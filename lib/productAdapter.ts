import type { product, productVarient } from "@/db/productSchema";
import { lowestVisiblePrice, visibleSizePrices } from "./productPricing";

export type ProductVariant = typeof productVarient.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;
export type ProductRecord = typeof product.$inferSelect & {
  variants: ProductVariant[];
  variantId: string | null;
  bannerImage: string;
  images: string[];
  strikethroughPrice: number | null;
};

export function compactProduct(input: typeof product.$inferSelect, variants: ProductVariant[] = []): ProductRecord {
  const price = lowestVisiblePrice(input.pricingConfig);
  return {
    ...input, variants, variantId: variants[0]?.id ?? null,
    basePrice: price?.basePrice ?? input.basePrice,
    strikethroughPrice: price?.strikethroughPrice ?? null,
    bannerImage: variants[0]?.bannerImage ?? "",
    images: variants[0]?.images ?? [],
    sizes: visibleSizePrices(input.pricingConfig).map(row => row.size),
    colors: variants.map(variant => variant.color),
  };
}
export function variantCards(products: ProductRecord[]): ProductRecord[] {
  return products.filter(product => visibleSizePrices(product.pricingConfig).length > 0)
    .flatMap(product => product.variants.map(variant => ({
      ...product, variantId: variant.id, bannerImage: variant.bannerImage,
      images: variant.images ?? [], colors: [variant.color],
    })));
}
export function productHref(product: { slug: string; variantId?: string | null }) {
  return `/product/${product.slug}${product.variantId ? `?variant=${encodeURIComponent(product.variantId)}` : ""}`;
}
