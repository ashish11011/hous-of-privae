import { giftCardApi } from "@/lib/gift-cards/api";
import {
  getPurchasedGiftCard,
  sendGiftCardDeliveries,
} from "@/lib/gift-cards/service";
import { giftCardRequestSchema } from "@/lib/gift-cards/validation";
import { CheckoutError } from "@/lib/payments/checkout-error";
export async function POST(req: Request) {
  return giftCardApi(async (userId) => {
    const card = await getPurchasedGiftCard(
      giftCardRequestSchema.parse(await req.json()).id,
      userId,
    );
    if (card.paymentStatus !== "paid")
      throw new CheckoutError("The gift card payment is still pending.", 409);
    await sendGiftCardDeliveries(card.id);
    return { success: true };
  });
}
