import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { OrderActionError, updateAdminOrderStatus } from "@/lib/orders/admin";
import { editableOrderStatuses } from "@/lib/orders/status";

const schema = z.object({ status: z.enum(editableOrderStatuses), expectedUpdatedAt: z.iso.datetime() }).strict();
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const admin = await getOrderAdmin();
    if (!admin) return NextResponse.json({ message: "Admin sign-in is required." }, { status: 403 });
    const { id } = await context.params;
    const result = schema.safeParse(await request.json().catch(() => null));
    if (!z.string().uuid().safeParse(id).success || !result.success) return NextResponse.json({ message: "Invalid order status update." }, { status: 400 });
    const update = await updateAdminOrderStatus(id, result.data.status, result.data.expectedUpdatedAt, admin.id);
    return NextResponse.json({ ...update, message: !update.changed ? "Order status is unchanged." : update.emailSent ? "Order status updated and customer email sent." : "Order status updated. Email could not be sent; use Retry email in the history." });
  } catch (error) {
    if (error instanceof OrderActionError) return NextResponse.json({ message: error.message }, { status: error.status });
    console.error("Order status update failed:", error);
    return NextResponse.json({ message: "Unable to update the order." }, { status: 500 });
  }
}
