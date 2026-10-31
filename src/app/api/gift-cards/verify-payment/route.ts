import { z } from "zod";
import { giftCardApi } from "@/lib/gift-cards/api";
import { getPurchasedGiftCard } from "@/lib/gift-cards/service";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { validSignature } from "@/lib/payments/razorpay-events";
const callback = z.object({
  id: z.uuid(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});
export async function POST(req: Request) {
  return giftCardApi(async (userId) => {
    const input = callback.parse(await req.json());
    if (
      !validSignature(
        `${input.razorpay_order_id}|${input.razorpay_payment_id}`,
        input.razorpay_signature,
        process.env.RAZORPAY_KEY_SECRET || "",
      )
    )
      throw new CheckoutError("Payment signature verification failed.");
    const card = await getPurchasedGiftCard(input.id, userId);
    if (card.razorpayOrderId !== input.razorpay_order_id)
      throw new CheckoutError("Payment does not match this gift card.");
    return {
      success: true,
      verified: true,
      confirmed:
        card.paymentStatus === "paid" &&
        card.razorpayPaymentId === input.razorpay_payment_id,
    };
  });
}
