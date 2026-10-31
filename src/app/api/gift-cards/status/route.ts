import { giftCardApi } from "@/lib/gift-cards/api";
import { getPurchasedGiftCard } from "@/lib/gift-cards/service";
import { giftCardRequestSchema } from "@/lib/gift-cards/validation";
export async function GET(req: Request) {
  return giftCardApi(async (userId) => {
    const { id } = giftCardRequestSchema.parse({
      id: new URL(req.url).searchParams.get("id"),
    });
    const card = await getPurchasedGiftCard(id, userId);
    return {
      success: true,
      confirmed: card.paymentStatus === "paid",
      paymentStatus: card.paymentStatus,
    };
  });
}
