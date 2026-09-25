import { SIZES } from "@/const/globalConstants";
import { z } from "zod";

export const sizePriceSchema = z.object({
  size: z.enum(SIZES),
  basePrice: z.number().int().min(0).max(10000000),
  strikethroughPrice: z.number().int().min(0).max(10000000).nullable().optional(),
  isVisible: z.boolean(),
}).refine(row => !row.isVisible || row.basePrice > 0, "Visible sizes need a positive price");
export type SizePrice = z.infer<typeof sizePriceSchema>;
export const pricingConfigSchema = z.array(sizePriceSchema).max(SIZES.length).refine(
  rows => new Set(rows.map(row => row.size)).size === rows.length, "Each size must have one price",
);
export function visibleSizePrices(config: unknown): SizePrice[] {
  if (!Array.isArray(config)) return [];
  return config.flatMap(row => {
    const result = sizePriceSchema.safeParse(row);
    return result.success && result.data.isVisible ? [result.data] : [];
  });
}
export function priceForSize(config: unknown, size: string) {
  return visibleSizePrices(config).find(row => row.size === size.toLowerCase());
}
export function lowestVisiblePrice(config: unknown) {
  return visibleSizePrices(config).sort((a, b) => a.basePrice - b.basePrice)[0];
}
