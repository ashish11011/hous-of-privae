import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { eq } from "drizzle-orm";
import { contactTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";

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

    const body = await req.json();
    const {
      appointmentLabel,
      appointmentType,
      date,
      duration,
      email,
      name,
      notes,
      phone,
      time,
    } = body;

    if (!appointmentType || !date || !time || !name || !phone || !email) {
      return NextResponse.json({ error: "Missing appointment details." }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, data: inserted });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
