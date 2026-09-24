import { db } from "@/lib/db";
import { orderTable, userTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { calculateOrderRewardPoints } from "@/lib/loyaltyRewards";
import { sendOrderConfirmationEmail } from "@/lib/email/ses";
import { paymentTransition, type PaymentEvent } from "./razorpay-events";

export async function processPaymentWebhook(payment: PaymentEvent) {
  const orderId = await db.transaction(async tx => {
    // Serializes all events for an order, including order.paid + payment.captured.
    const [order] = await tx.select().from(orderTable)
      .where(eq(orderTable.razorpayOrderId, payment.order_id)).for("update");
    if (!order) throw new Error("No saved order for Razorpay payment; retry required");
    const transition = paymentTransition(order, payment);
    if (transition) {
      await tx.update(orderTable).set({
        ...transition,
        razorpayPaymentId: payment.id,
        ...(transition.paymentStatus === "paid" ? { totalAmountPaid: payment.amount / 100 } : {}),
        updatedAt: new Date(),
      }).where(eq(orderTable.id, order.id));
      if (transition.paymentStatus === "paid") {
        const points = calculateOrderRewardPoints(payment.amount / 100);
        await tx.update(userTable).set({
          loyaltyPoints: sql`${userTable.loyaltyPoints} + ${points}`,
          updatedAt: new Date(),
        }).where(eq(userTable.id, order.userId));
      }
    }
    return order.id;
  });

  if (payment.status !== "captured") return;
  // Payment remains committed even if SES fails. A webhook retry resumes email only.
  // Separate delivery markers ensure an admin failure does not resend customer mail.
  for (const recipient of ["customer", "admin"] as const) {
    await db.transaction(async tx => {
      const [order] = await tx.select().from(orderTable).where(eq(orderTable.id, orderId)).for("update");
      const sentAt = recipient === "customer" ? order.confirmationEmailSentAt : order.adminEmailSentAt;
      if (order.paymentStatus !== "paid" || sentAt) return;
      if (!order.checkoutSnapshot) throw new Error("Missing order email snapshot");
      await sendOrderConfirmationEmail(order.checkoutSnapshot, recipient);
      await tx.update(orderTable).set(recipient === "customer"
        ? { confirmationEmailSentAt: new Date() }
        : { adminEmailSentAt: new Date() }
      ).where(eq(orderTable.id, order.id));
    });
  }
}
