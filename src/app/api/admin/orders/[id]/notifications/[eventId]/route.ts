import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { deliverOrderStatusEmail, OrderActionError } from "@/lib/orders/admin";

export async function POST(_request: Request, context: { params: Promise<{ id: string; eventId: string }> }) {
  try {
    if (!await getOrderAdmin()) return NextResponse.json({ message: "Admin sign-in is required." }, { status: 403 });
    const { id, eventId } = await context.params;
    if (![id, eventId].every(value => z.string().uuid().safeParse(value).success)) return NextResponse.json({ message: "Invalid notification." }, { status: 400 });
    await deliverOrderStatusEmail(id, eventId);
    return NextResponse.json({ message: "Customer email sent." });
  } catch (error) {
    if (error instanceof OrderActionError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("Order status email retry failed:", error);
    return NextResponse.json({ message: "Email delivery failed. Please try again." }, { status: 502 });
  }
}
