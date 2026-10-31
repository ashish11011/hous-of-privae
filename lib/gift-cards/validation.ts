import { z } from "zod";

export const GIFT_CARD_AMOUNTS = [10000, 25000, 50000, 100000] as const;
export const GIFT_CARD_MIN = 1000;
export const GIFT_CARD_MAX = 500000;
export const giftCardPurchaseSchema = z.object({
  requestId: z.uuid(),
  amount: z.number().int().min(GIFT_CARD_MIN).max(GIFT_CARD_MAX),
  senderName: z.string().trim().min(1).max(120),
  recipientName: z.string().trim().min(1).max(120),
  recipientEmail: z
    .union([z.email().max(254), z.literal("")])
    .default("")
    .transform((value) => value.toLowerCase()),
  message: z.string().trim().max(500).default(""),
  design: z.enum(["classic", "celebration", "wedding"]).default("classic"),
});
export type GiftCardPurchaseInput = z.infer<typeof giftCardPurchaseSchema>;
export const giftCardCodeSchema = z
  .string()
  .trim()
  .min(20)
  .max(80)
  .regex(/^[a-zA-Z0-9\s-]+$/, "Enter a valid gift card code");
export const giftCardActionSchema = z.object({ code: giftCardCodeSchema });
export const giftCardRequestSchema = z.object({ id: z.uuid() });
export function formatGiftCardAmount(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(paise / 100);
}
