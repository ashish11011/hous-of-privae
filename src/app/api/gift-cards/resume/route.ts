import { giftCardApi } from "@/lib/gift-cards/api";
import {
  getPurchasedGiftCard,
  purchasePayment,
} from "@/lib/gift-cards/service";
import { giftCardRequestSchema } from "@/lib/gift-cards/validation";
import { CheckoutError } from "@/lib/payments/checkout-error";
export async function POST(req: Request) {
  return giftCardApi(async (userId) => {
    const card = await getPurchasedGiftCard(
      giftCardRequestSchema.parse(await req.json()).id,
      userId,
    );
    if (!card.razorpayOrderId)
      throw new CheckoutError("This purchase cannot be resumed.", 409);
    return purchasePayment(card);
  });
}
