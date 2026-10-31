import { giftCardApi } from "@/lib/gift-cards/api";
import { claimGiftCard } from "@/lib/gift-cards/service";
import { giftCardActionSchema } from "@/lib/gift-cards/validation";
export async function POST(req: Request) {
  return giftCardApi(async (userId) => ({
    success: true,
    card: await claimGiftCard(
      giftCardActionSchema.parse(await req.json()).code,
      userId,
    ),
  }));
}
