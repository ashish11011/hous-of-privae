import { giftCardApi } from "@/lib/gift-cards/api";
import { getAccountGiftCards } from "@/lib/gift-cards/service";
export async function GET() {
  return giftCardApi(async (userId) => ({
    success: true,
    cards: await getAccountGiftCards(userId),
  }));
}
