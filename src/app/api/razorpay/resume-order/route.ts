import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { getOrderGiftCardReservation } from "@/lib/gift-cards/redemption";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.id) return NextResponse.json({ success: false }, { status: 401 });
  let input;
  try { input = z.object({ orderId: z.string().uuid() }).parse(await request.json()); }
  catch { return NextResponse.json({ success: false, msg: "Valid order ID required." }, { status: 400 }); }
  try {
    const [order] = await db.select().from(orderTable).where(and(
      eq(orderTable.id, input.orderId), eq(orderTable.userId, session.id),
    ));
    const giftReservation = order?.checkoutSnapshot?.giftCardAmount ? await getOrderGiftCardReservation(order.id) : null;
    if (!order || (order.loyaltyPointsStatus !== "reserved" && giftReservation?.status !== "reserved") || order.paymentStatus === "paid" || !order.razorpayOrderId || !order.checkoutSnapshot || !order.expectedAmountPaise)
      return NextResponse.json({ success: false, msg: "This checkout is no longer pending. Refresh your balance." }, { status: 409 });
    return NextResponse.json({
      success: true, orderId: order.razorpayOrderId, internalOrderId: order.id,
      amount: order.expectedAmountPaise, currency: order.currency,
      loyaltyPointsRedeemed: order.loyaltyPointsRedeemed,
      prefill: order.checkoutSnapshot.user,
      items: order.checkoutSnapshot.items,
      giftWrap: order.checkoutSnapshot.giftWrap ?? false,
      giftWrapCharge: order.checkoutSnapshot.giftWrapCharge ?? 0,
      giftWrapNote: order.checkoutSnapshot.giftWrapNote ?? "",
      giftCardAmount: order.checkoutSnapshot.giftCardAmount ?? 0,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to resume points checkout:", error);
    return NextResponse.json({ success: false, msg: "Unable to resume checkout." }, { status: 500 });
  }
}
