import { product } from "@/db/productSchema";

export type ProductRecord = typeof product.$inferSelect;
export type ProductInsert = typeof product.$inferInsert;

const fallbackImages = [
  "/refined/shyama-purple-sharara.jpg",
  "/refined/hero-1.jpg",
  "/refined/hero-2.jpg",
  "/refined/mehfil-embroidered-blouse.jpg",
];

export const fallbackProducts: ProductRecord[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Shyama Purple Sharara",
    sku: "HOP-FALLBACK-001",
    fabric: "Silk blend",
    care: "Dry clean only",
    style_note: "Pair with gold jhumkas and a potli bag.",
    customization: "Fit adjustments available",
    model_height: "5'7\"",
    description: "A refined occasionwear silhouette for festive evenings.",
    basePrice: 24500,
    semiStitchedPrice: null,
    categoryId1: "c1a1e1b2-1234-4d3a-9f0a-abc111def002",
    categoryId2: null,
    slug: "shyama-purple-sharara",
    bannerImage: fallbackImages[0],
    images: [fallbackImages[0], "/refined/shyama-purple-sharara-detail.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#6b3f74"],
    materials: ["Silk"],
    isInStoke: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Mehfil Embroidered Blouse",
    sku: "HOP-FALLBACK-002",
    fabric: "Chanderi silk",
    care: "Dry clean only",
    style_note: "Layer with a saree or lehenga skirt.",
    customization: "Sleeve and neckline adjustments available",
    model_height: "5'7\"",
    description: "Hand-finished embroidery for intimate celebrations.",
    basePrice: 18500,
    semiStitchedPrice: null,
    categoryId1: "c1a1e1b1-1234-4d3a-9f0a-abc111def001",
    categoryId2: null,
    slug: "mehfil-embroidered-blouse",
    bannerImage: fallbackImages[3],
    images: [fallbackImages[3], "/refined/accessory-gold-jhumkas.jpg"],
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["#8a1f3d"],
    materials: ["Chanderi"],
    isInStoke: true,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export function normalizeProductInput(input: Record<string, any>): ProductInsert {
  return {
    id: input.id,
    name: input.name ?? null,
    sku: input.sku ?? null,
    fabric: input.fabric ?? null,
    care: input.care ?? null,
    style_note: input.style_note ?? input.styleNote ?? null,
    customization: input.customization ?? null,
    model_height: input.model_height ?? input.modelHeight ?? null,
    description: input.description ?? null,
    basePrice: asNumber(input.basePrice ?? input.base_price),
    semiStitchedPrice: asNumber(input.semiStitchedPrice ?? input.semi_stitched_price),
    categoryId1: input.categoryId1 ?? input.category_id_1 ?? null,
    categoryId2: input.categoryId2 ?? input.category2_id_2 ?? input.category_id_2 ?? null,
    slug: input.slug,
    bannerImage: input.bannerImage ?? input.banner_image ?? null,
    images: asStringArray(input.images),
    sizes: asStringArray(input.sizes),
    colors: asStringArray(input.colors),
    materials: asStringArray(input.materials),
    isInStoke: Boolean(input.isInStoke ?? input.in_stock ?? true),
    isDeleted: Boolean(input.isDeleted ?? input.is_deleted ?? false),
    createdAt: input.createdAt ?? input.created_at,
    updatedAt: input.updatedAt ?? input.updated_at,
  };
}

export function compactProduct(input: Record<string, any>): ProductRecord {
  return {
    id: input.id,
    name: input.name ?? "",
    sku: input.sku ?? null,
    fabric: input.fabric ?? null,
    care: input.care ?? null,
    style_note: input.style_note ?? input.styleNote ?? null,
    customization: input.customization ?? null,
    model_height: input.model_height ?? input.modelHeight ?? null,
    description: input.description ?? "",
    basePrice: asNumber(input.basePrice ?? input.base_price) ?? 0,
    semiStitchedPrice: asNumber(input.semiStitchedPrice ?? input.semi_stitched_price),
    categoryId1: input.categoryId1 ?? input.category_id_1 ?? null,
    categoryId2: input.categoryId2 ?? input.category2_id_2 ?? input.category_id_2 ?? null,
    slug: input.slug ?? input.id,
    bannerImage: input.bannerImage ?? input.banner_image ?? fallbackImages[0],
    images: asStringArray(input.images).length
      ? asStringArray(input.images)
      : [input.bannerImage ?? input.banner_image ?? fallbackImages[0]],
    sizes: asStringArray(input.sizes),
    colors: asStringArray(input.colors),
    materials: asStringArray(input.materials),
    isInStoke: Boolean(input.isInStoke ?? input.in_stock ?? true),
    isDeleted: Boolean(input.isDeleted ?? input.is_deleted ?? false),
    createdAt: asDate(input.createdAt ?? input.created_at),
    updatedAt: asDate(input.updatedAt ?? input.updated_at),
  };
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string");
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function asNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}
