import { z, ZodError } from "zod";
import { asc, desc, eq } from "drizzle-orm";
import { getOrderAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import {
  accountAppointment,
  bespokeRequest,
  bespokeMilestone,
} from "@/db/accountSchema";
import { contactTable } from "@/db/schema";
import { accountJson, accountSchemaMissing } from "@/lib/account/api";
import { updateBespoke } from "@/lib/account/atelier";
import { CheckoutError } from "@/lib/payments/checkout-error";
function failure(error: unknown) {
  return accountJson(
    {
      success: false,
      message:
        error instanceof ZodError
          ? error.issues[0]?.message
          : error instanceof CheckoutError
            ? error.message
            : "Unable to load or update atelier requests. Check that the account schema is available.",
    },
    error instanceof CheckoutError
      ? error.status
      : error instanceof ZodError
        ? 400
        : accountSchemaMissing(error)
          ? 503
          : 500,
  );
}
export async function GET() {
  if (!(await getOrderAdmin()))
    return accountJson({ message: "Admin sign-in is required." }, 403);
  try {
    const [commissions, bookings, milestones] = await Promise.all([
      db.select().from(bespokeRequest).orderBy(desc(bespokeRequest.createdAt)),
      db
        .select({
          appointment: accountAppointment,
          name: contactTable.name,
          email: contactTable.email,
          phone: contactTable.phone,
        })
        .from(accountAppointment)
        .innerJoin(
          contactTable,
          eq(accountAppointment.contactId, contactTable.id),
        )
        .orderBy(desc(accountAppointment.scheduledFor)),
      db
        .select()
        .from(bespokeMilestone)
        .orderBy(asc(bespokeMilestone.createdAt), asc(bespokeMilestone.id)),
    ]);
    return accountJson({
      commissions: commissions.map((request) => ({
        ...request,
        milestones: milestones.filter((row) => row.requestId === request.id),
      })),
      bookings: bookings.map((row) => ({
        ...row.appointment,
        name: row.name,
        email: row.email,
        phone: row.phone,
      })),
    });
  } catch (error) {
    return failure(error);
  }
}
export async function POST(req: Request) {
  const admin = await getOrderAdmin();
  if (!admin)
    return accountJson({ message: "Admin sign-in is required." }, 403);
  try {
    const input = await req.json();
    if (input.kind === "bespoke")
      return accountJson({
        success: true,
        data: await updateBespoke(input, admin.id),
      });
    const data = z
      .object({
        kind: z.literal("appointment"),
        id: z.uuid(),
        status: z.enum(["confirmed", "completed", "cancelled"]),
      })
      .parse(input);
    const updated = await db.transaction(async (tx) => {
      const [booking] = await tx
        .select()
        .from(accountAppointment)
        .where(eq(accountAppointment.id, data.id))
        .for("update");
      if (!booking) throw new CheckoutError("Appointment not found.", 404);
      const allowed =
        booking.status === "requested"
          ? ["confirmed", "cancelled"]
          : booking.status === "confirmed"
            ? ["completed", "cancelled"]
            : [];
      if (!allowed.includes(data.status))
        throw new CheckoutError(
          "That appointment status change is not allowed.",
          409,
        );
      return (
        await tx
          .update(accountAppointment)
          .set({ status: data.status })
          .where(eq(accountAppointment.id, booking.id))
          .returning()
      )[0];
    });
    return accountJson({ success: true, data: updated });
  } catch (error) {
    return failure(error);
  }
}
