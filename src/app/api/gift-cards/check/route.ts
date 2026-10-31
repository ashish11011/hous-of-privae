import { giftCardApi } from "@/lib/gift-cards/api";
import { checkGiftCard } from "@/lib/gift-cards/redemption";
import { giftCardActionSchema } from "@/lib/gift-cards/validation";
export async function POST(req: Request) {
  return giftCardApi(async (userId) => ({
    success: true,
    card: await checkGiftCard(
      giftCardActionSchema.parse(await req.json()).code,
      userId,
    ),
  }));
}
