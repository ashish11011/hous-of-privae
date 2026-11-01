import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { settleOrderLoyalty } from "@/lib/loyalty";
import { paymentTransition, type PaymentEvent } from "./razorpay-events";
import { sendPaidOrderEmails } from "./order-emails";
import { processGiftCardPayment } from "@/lib/gift-cards/service";
import { getOrderGiftCardReservation, settleGiftCardReservation } from "@/lib/gift-cards/redemption";
import { settleOrderReferral } from "@/lib/account/referrals";
import { circleEnabled } from "@/lib/account/circle";

export async function processPaymentWebhook(payment: PaymentEvent) {
  if (await processGiftCardPayment(payment)) return;
  const programme = await circleEnabled();
  const orderId = await db.transaction(async tx => {
    const [order] = await tx.select().from(orderTable)
      .where(eq(orderTable.razorpayOrderId, payment.order_id)).for("update");
    if (!order) throw new Error("No saved order for Razorpay payment; retry required");
    const transition = paymentTransition(order, payment);
    if (transition) {
      const giftAmount = order.checkoutSnapshot?.giftCardAmount ?? 0;
      if (transition.paymentStatus === "paid" && giftAmount > 0) {
        const reservation = await getOrderGiftCardReservation(order.id, tx);
        if (!reservation || reservation.status !== "reserved" || reservation.userId !== order.userId || reservation.amountPaise !== giftAmount * 100)
          throw new Error("Gift card funding does not match the saved order");
      }
      const settledTotal = payment.amount / 100 + giftAmount;
      await tx.update(orderTable).set({
        ...transition,
        razorpayPaymentId: payment.id,
        ...(transition.paymentStatus === "paid" ? {
          totalAmountPaid: settledTotal,
          loyaltyPointsStatus: order.loyaltyPointsRedeemed > 0 ? "spent" as const : "none" as const,
        } : {}),
        updatedAt: new Date(),
      }).where(eq(orderTable.id, order.id));
      if (transition.paymentStatus === "paid") {
        await settleOrderLoyalty(tx, order, settledTotal, programme);
        if (giftAmount > 0) await settleGiftCardReservation(tx, order.id);
      }
    }
    return order.id;
  });
  if (payment.status === "captured") {
    await settleOrderReferral(orderId);
    await sendPaidOrderEmails(orderId);
  }
}
