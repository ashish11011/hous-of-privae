import { z } from "zod";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { contactTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { sendFormNotificationEmails } from "@/lib/email/ses";

const services = {
  studio_visit: { label: "Studio Visit", duration: 60 },
  virtual_fitting: { label: "Virtual Fitting", duration: 45 },
  bespoke_consultation: { label: "Bespoke Consultation", duration: 90 },
};
const appointmentSchema = z.object({
  appointmentType: z.enum(["studio_visit", "virtual_fitting", "bespoke_consultation"]),
  date: z.iso.date(),
  time: z.string().regex(/^(1[0-8]):00$/),
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(6).max(40),
  notes: z.string().trim().max(2000).default(""),
}).refine(data => new Date(`${data.date}T${data.time}:00+05:30`).getTime() > Date.now(), "Please choose a future appointment.");

const APPOINTMENT_LOCATION = "appointment";

function readBookedSlot(message: string | null) {
  const match = message?.match(/Scheduled:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/);
  if (!match) return null;

  return { date: match[1], time: match[2] };
}

export async function GET() {
  try {
    const rows = await db
      .select({ message: contactTable.message })
      .from(contactTable)
      .where(eq(contactTable.location, APPOINTMENT_LOCATION));

    const bookedTimes: Record<string, string[]> = {};

    rows.forEach((row) => {
      const slot = readBookedSlot(row.message);
      if (!slot) return;

      bookedTimes[slot.date] = bookedTimes[slot.date] ?? [];
      bookedTimes[slot.date].push(slot.time);
    });

    return NextResponse.json({ success: true, bookedTimes });
  } catch (error) {
    console.error("Error fetching appointment slots:", error);
    return NextResponse.json({ success: true, bookedTimes: {} });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = appointmentSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Please enter a valid service, future date and time, and contact details." }, { status: 400 });
    }
    const { appointmentType, date, email, name, notes, phone, time } = parsed.data;
    const { label: appointmentLabel, duration } = services[appointmentType];

    const rows = await db
      .select({ message: contactTable.message })
      .from(contactTable)
      .where(eq(contactTable.location, APPOINTMENT_LOCATION));

    const slotTaken = rows.some((row) => {
      const slot = readBookedSlot(row.message);
      return Boolean(slot && slot.date === date && slot.time === time);
    });

    if (slotTaken) {
      return NextResponse.json({ error: "That slot was just taken. Please pick another time." }, { status: 409 });
    }

    const message = [
      "APPOINTMENT_REQUEST",
      `Service: ${appointmentLabel ?? appointmentType}`,
      `Type: ${appointmentType}`,
      `Scheduled: ${date} ${time}`,
      `Duration: ${duration ?? 60} min`,
      `Notes: ${notes || "-"}`,
    ].join("\n");

    const [inserted] = await db
      .insert(contactTable)
      .values({
        name,
        email,
        phone,
        location: APPOINTMENT_LOCATION,
        message,
      })
      .returning();

    try {
      await sendFormNotificationEmails({
        type: "appointment",
        requireDelivery: true,
        adminSubject: `New Privae Studio appointment request - ${name}`,
        title: "Appointment request received",
        userEmail: email,
        fields: {
          Name: name,
          Email: email,
          Phone: phone,
          Service: appointmentLabel ?? appointmentType,
          Type: appointmentType,
          Scheduled: `${date} ${time}`,
          Duration: `${duration ?? 60} min`,
          Notes: notes || "-",
        },
      });

    } catch (error) {
      await db.delete(contactTable).where(eq(contactTable.id, inserted.id));
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: "Appointment request submitted successfully.",
      data: inserted,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
