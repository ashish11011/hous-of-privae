import { and, desc, eq, sql } from "drizzle-orm";
import { z } from "zod";
import {
  accountAppointment,
  bespokeMilestone,
  bespokeRequest,
} from "@/db/accountSchema";
import { contactTable } from "@/db/schema";
import { db } from "@/lib/db";
import { sendFormNotificationEmails } from "@/lib/email/ses";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { bespokeInput, bespokeUpdateInput } from "./validation";
import { accountSchemaMissing } from "./api";
export const APPOINTMENT_SERVICES = {
  studio_visit: { label: "Studio Visit", duration: 60 },
  virtual_fitting: { label: "Virtual Fitting", duration: 45 },
  bespoke_consultation: { label: "Bespoke Consultation", duration: 90 },
};
export const appointmentInput = z
  .object({
    appointmentType: z.enum([
      "studio_visit",
      "virtual_fitting",
      "bespoke_consultation",
    ]),
    date: z.iso.date(),
    time: z.string().regex(/^(1[0-8]):00$/),
    name: z.string().trim().min(2).max(100),
    email: z.email().max(254),
    phone: z.string().trim().min(6).max(40),
    notes: z.string().trim().max(2000).default(""),
  })
  .refine(
    (data) =>
      new Date(`${data.date}T${data.time}:00+05:30`).getTime() > Date.now(),
    "Choose a future appointment date and time.",
  );
export async function submitBespoke(input: unknown, userId: string | null) {
  const data = bespokeInput.parse(input);
  const request = await db.transaction(async (tx) => {
    const [saved] = await tx
      .insert(bespokeRequest)
      .values({ ...data, eventDate: data.eventDate || null, userId })
      .returning();
    await tx.insert(bespokeMilestone).values({
      requestId: saved.id,
      milestone: "received",
      note: "Your request has reached the atelier.",
    });
    return saved;
  });
  let emailPending = false;
  try {
    await sendFormNotificationEmails({
      type: "bespoke",
      requireDelivery: true,
      title: "Bespoke request received",
      adminSubject: `New bespoke request - ${data.fullName}`,
      userEmail: data.email,
      fields: {
        Reference: request.id,
        Name: data.fullName,
        Email: data.email,
        Phone: data.phone,
        Country: data.country,
        Garment: data.garmentType,
        Occasion: data.occasion,
        "Event Date": data.eventDate,
        "Investment Range": data.budgetRange,
        "Fabric Preference": data.fabricPreference,
        "Colour Palette": data.colorPreference,
        "Inspiration Notes": data.inspirationNotes,
      },
    });
    await db
      .update(bespokeRequest)
      .set({ emailSentAt: new Date() })
      .where(eq(bespokeRequest.id, request.id));
  } catch {
    emailPending = true;
  }
  return {
    success: true,
    referenceId: request.id,
    message: "Bespoke request submitted successfully.",
    emailPending,
  };
}
export async function updateBespoke(input: unknown, adminId: string) {
  const data = bespokeUpdateInput.parse(input);
  return db.transaction(async (tx) => {
    const [request] = await tx
      .select()
      .from(bespokeRequest)
      .where(eq(bespokeRequest.id, data.id))
      .for("update");
    if (!request) throw new CheckoutError("Commission not found.", 404);
    if (request.updatedAt.toISOString() !== data.expectedUpdatedAt)
      throw new CheckoutError(
        "This commission changed. Refresh before saving.",
        409,
      );
    const [saved] = await tx
      .update(bespokeRequest)
      .set({
        status: data.status,
        currentMilestone: data.milestone,
        estimatedDeliveryDate: data.estimatedDeliveryDate || null,
        updatedAt: new Date(
          Math.max(Date.now(), request.updatedAt.getTime() + 1),
        ),
      })
      .where(eq(bespokeRequest.id, request.id))
      .returning();
    if (
      request.currentMilestone !== data.milestone ||
      data.note ||
      data.imageUrl
    )
      await tx.insert(bespokeMilestone).values({
        requestId: request.id,
        milestone: data.milestone,
        note: data.note,
        imageUrl: data.imageUrl || null,
        changedBy: adminId,
      });
    const milestones = await tx
      .select()
      .from(bespokeMilestone)
      .where(eq(bespokeMilestone.requestId, request.id))
      .orderBy(bespokeMilestone.createdAt, bespokeMilestone.id);
    return { ...saved, milestones };
  });
}
export async function bookedAppointmentTimes() {
  const legacy = await db
    .select()
    .from(contactTable)
    .where(eq(contactTable.location, "appointment"));
  let records: (typeof accountAppointment.$inferSelect)[] = [];
  try {
    records = await db.select().from(accountAppointment);
  } catch (error) {
    if (!accountSchemaMissing(error)) throw error;
  }
  const linked = new Set(records.map((row) => row.contactId));
  const booked: Record<string, string[]> = {};
  function add(date: string, time: string) {
    booked[date] = [...new Set([...(booked[date] ?? []), time])];
  }
  for (const row of legacy)
    if (!linked.has(row.id)) {
      const match = row.message?.match(
        /Scheduled:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/,
      );
      if (match) add(match[1], match[2]);
    }
  for (const row of records.filter((row) =>
    ["requested", "confirmed"].includes(row.status),
  )) {
    const start = row.scheduledFor.getTime();
    for (
      let time = start;
      time < start + row.durationMinutes * 60000;
      time += 3600000
    ) {
      const local = new Date(time + 330 * 60000).toISOString();
      add(local.slice(0, 10), local.slice(11, 16));
    }
  }
  return booked;
}
export async function bookAppointment(userId: string, input: unknown) {
  const data = appointmentInput.parse(input);
  const service = APPOINTMENT_SERVICES[data.appointmentType];
  const scheduledFor = new Date(`${data.date}T${data.time}:00+05:30`);
  const booking = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select pg_advisory_xact_lock(hashtext('privae-appointment-slots'))`,
    );
    const rows = await tx
      .select()
      .from(accountAppointment)
      .where(sql`${accountAppointment.status} in ('requested', 'confirmed')`)
      .for("update");
    for (const row of rows)
      if (
        scheduledFor.getTime() <
          row.scheduledFor.getTime() + row.durationMinutes * 60000 &&
        row.scheduledFor.getTime() <
          scheduledFor.getTime() + service.duration * 60000
      ) {
        if (
          row.userId === userId &&
          row.scheduledFor.getTime() === scheduledFor.getTime() &&
          row.service === service.label
        )
          return row;
        throw new CheckoutError(
          "That time overlaps another appointment. Please choose another slot.",
          409,
        );
      }
    const contacts = await tx
      .select()
      .from(contactTable)
      .where(eq(contactTable.location, "appointment"));
    const knownContacts = new Set(
      (
        await tx
          .select({ contactId: accountAppointment.contactId })
          .from(accountAppointment)
      ).map((row) => row.contactId),
    );
    if (
      contacts.some(
        (row) =>
          !knownContacts.has(row.id) &&
          row.message?.includes(`Scheduled: ${data.date} ${data.time}`),
      )
    )
      throw new CheckoutError("That slot is already booked.", 409);
    const [contact] = await tx
      .insert(contactTable)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        location: "appointment",
        message: `APPOINTMENT_REQUEST\nService: ${service.label}\nType: ${data.appointmentType}\nScheduled: ${data.date} ${data.time}\nDuration: ${service.duration} min\nNotes: ${data.notes || "-"}`,
      })
      .returning();
    const [saved] = await tx
      .insert(accountAppointment)
      .values({
        userId,
        contactId: contact.id,
        service: service.label,
        scheduledFor,
        durationMinutes: service.duration,
        notes: data.notes,
      })
      .returning();
    return saved;
  });
  let emailPending = false;
  if (!booking.emailSentAt)
    try {
      await sendFormNotificationEmails({
        type: "appointment",
        requireDelivery: true,
        title: "Appointment request received",
        userEmail: data.email,
        fields: {
          Reference: booking.id,
          Name: data.name,
          Email: data.email,
          Phone: data.phone,
          Service: service.label,
          Scheduled: `${data.date} ${data.time}`,
          Notes: data.notes,
        },
      });
      await db
        .update(accountAppointment)
        .set({ emailSentAt: new Date() })
        .where(eq(accountAppointment.id, booking.id));
    } catch {
      emailPending = true;
    }
  return {
    success: true,
    message: "Appointment request submitted successfully.",
    data: booking,
    emailPending,
  };
}
