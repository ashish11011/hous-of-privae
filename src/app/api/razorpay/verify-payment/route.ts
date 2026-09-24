import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { validSignature } from "@/lib/payments/razorpay-events";
import { calculateOrderRewardPoints } from "@/lib/loyaltyRewards";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_KEY_SECRET;
  if (!secret) return NextResponse.json({ success: false }, { status: 503 });
  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ success: false }, { status: 400 });
  }
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body ?? {};
  if (typeof razorpay_order_id !== "string" || typeof razorpay_payment_id !== "string" || typeof razorpay_signature !== "string" ||
      !validSignature(`${razorpay_order_id}|${razorpay_payment_id}`, razorpay_signature, secret)) {
    return NextResponse.json({ success: false, verified: false }, { status: 400 });
  }
  try {
    const [order] = await db.select({
      id: orderTable.id, paymentStatus: orderTable.paymentStatus,
      status: orderTable.status, totalAmountPaid: orderTable.totalAmountPaid,
      razorpayPaymentId: orderTable.razorpayPaymentId,
    }).from(orderTable).where(eq(orderTable.razorpayOrderId, razorpay_order_id));
    if (!order) return NextResponse.json({ success: false, msg: "Order not found." }, { status: 404 });
    // Checkout signatures prove the callback's authenticity, not payment capture.
    // This endpoint only reads status; the webhook is the sole confirmation path.
    const confirmed = order.paymentStatus === "paid" && order.razorpayPaymentId === razorpay_payment_id;
    return NextResponse.json({
      success: true, verified: true, confirmed, orderId: order.id,
      paymentStatus: order.paymentStatus, orderStatus: order.status,
      loyaltyPointsEarned: confirmed ? calculateOrderRewardPoints(order.totalAmountPaid ?? 0) : 0,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Payment status lookup failed:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
