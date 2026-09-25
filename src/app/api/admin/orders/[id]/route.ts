import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getAdminOrderDetail } from "@/lib/orders/admin";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    if (!(await getOrderAdmin()))
      return NextResponse.json(
        { message: "Admin sign-in is required." },
        { status: 403 },
      );
    const { id } = await context.params;
    if (!z.string().uuid().safeParse(id).success)
      return NextResponse.json(
        { message: "Invalid order ID." },
        { status: 400 },
      );
    const order = await getAdminOrderDetail(id);
    if (!order)
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 },
      );
    return NextResponse.json(
      { order },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Admin order details failed:", error);
    return NextResponse.json(
      { message: "Unable to load order details." },
      { status: 500 },
    );
  }
}
