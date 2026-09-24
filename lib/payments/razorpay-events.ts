import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";

export function validSignature(body: string, signature: string | null, secret: string) {
  if (!signature || !/^[a-f0-9]{64}$/i.test(signature) || !secret) return false;
  const expected = createHmac("sha256", secret).update(body).digest();
  return timingSafeEqual(expected, Buffer.from(signature, "hex"));
}

const eventSchema = z.object({
  event: z.string(),
  payload: z.unknown().optional(),
});
const paymentSchema = z.object({
  payment: z.object({ entity: z.object({
    id: z.string().startsWith("pay_"),
    order_id: z.string().startsWith("order_"),
    amount: z.number().int().positive(),
    currency: z.string(),
    status: z.enum(["authorized", "captured", "failed"]),
  }) }),
});

export function parsePaymentEvent(body: string) {
  const event = eventSchema.parse(JSON.parse(body));
  if (!["payment.captured", "order.paid", "payment.failed", "payment.authorized"].includes(event.event)) return null;
  const { entity: payment } = paymentSchema.parse(event.payload).payment;
  const expectedStatus = event.event === "order.paid" ? "captured" : event.event.split(".")[1];
  if (payment.status !== expectedStatus) throw new Error("Inconsistent payment event status");
  return payment;
}
export type PaymentEvent = NonNullable<ReturnType<typeof parsePaymentEvent>>;

export function paymentTransition(order: {
  paymentStatus: string; expectedAmountPaise: number | null; currency: string;
  razorpayOrderId: string | null; razorpayPaymentId: string | null;
}, payment: PaymentEvent) {
  if (order.razorpayOrderId !== payment.order_id || order.expectedAmountPaise !== payment.amount || order.currency !== payment.currency) {
    throw new Error("Payment does not match the saved order or amount");
  }
  if (order.paymentStatus === "paid") {
    if (payment.status === "captured" && order.razorpayPaymentId !== payment.id) {
      throw new Error("Order already paid by a different payment");
    }
    return null;
  }
  if (payment.status === "captured") return { paymentStatus: "paid", status: "confirmed" };
  // An earlier failed attempt must not overwrite a later authorized attempt.
  if (payment.status === "failed" && order.paymentStatus === "authorized") return null;
  return payment.status === "authorized"
    ? { paymentStatus: "authorized", status: "pending_payment" }
    : { paymentStatus: "failed", status: "payment_failed" };
}
