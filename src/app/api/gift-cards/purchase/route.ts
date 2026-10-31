import { giftCardApi } from "@/lib/gift-cards/api";
import { createGiftCardPurchase } from "@/lib/gift-cards/service";
import { giftCardPurchaseSchema } from "@/lib/gift-cards/validation";
export async function POST(req: Request) {
  return giftCardApi(async (userId) =>
    createGiftCardPurchase(
      giftCardPurchaseSchema.parse(await req.json()),
      userId,
    ),
  );
}
