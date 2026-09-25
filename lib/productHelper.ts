"use server";
import { getOrderAdmin } from "@/lib/auth/admin";
import { eq, inArray, or } from "drizzle-orm";
import { db } from "./db";
import { product, productVarient } from "@/db/productSchema";
import { loadCatalog } from "./productCatalog";
import { variantCards } from "./productAdapter";
import { pricingConfigSchema, lowestVisiblePrice } from "./productPricing";
import { getAllCategories, type CategoryRecord } from "./categoryHelper";
import { z } from "zod";

const variantSchema = z.object({
  id: z.string().uuid().optional(), color: z.string().trim().min(1).max(100),
  bannerImage: z.string().trim().min(1), images: z.array(z.string().min(1)).default([]),
});
const inputSchema = z.object({
  name: z.string().trim().min(1), slug: z.string().trim().min(1),
  sku: z.string().nullable().optional(), fabric: z.string().nullable().optional(),
  description: z.string().nullable().optional(), care: z.string().nullable().optional(),
  style_note: z.string().nullable().optional(), customization: z.string().nullable().optional(),
  model_height: z.string().nullable().optional(), isInStoke: z.boolean().default(true),
  categoryId1: z.string().nullable().optional(), categoryId2: z.string().nullable().optional(),
  materials: z.array(z.string()).default([]), pricingConfig: pricingConfigSchema,
  variants: z.array(variantSchema).min(1).max(100).refine(rows => {
    const ids = rows.flatMap(row => row.id ? [row.id] : []);
    return new Set(ids).size === ids.length;
  }, "Duplicate variant IDs"),
});
async function saveProduct(data: unknown, slug?: string) {
  if (!await getOrderAdmin()) throw new Error("Admin sign-in is required.");
  const parsed = inputSchema.parse(data);
  const { variants, ...fields } = await normalizeProductCategoryIds(parsed);
  return db.transaction(async tx => {
    let id: string;
    const values = { ...fields, basePrice: lowestVisiblePrice(fields.pricingConfig)?.basePrice ?? null,
      sizes: fields.pricingConfig.filter((row: any) => row.isVisible).map((row: any) => row.size),
      colors: variants.map((row: any) => row.color), updatedAt: new Date() };
    if (slug) {
      const [existing] = await tx.select().from(product).where(eq(product.slug, slug)).for("update");
      if (!existing) throw new Error("Product not found");
      id = existing.id;
      await tx.update(product).set(values).where(eq(product.id, id));
    } else {
      const [created] = await tx.insert(product).values(values).returning({ id: product.id });
      id = created.id;
    }
    const existingVariants = await tx.select().from(productVarient).where(eq(productVarient.productId, id));
    const retained = new Set<string>();
    for (const variant of variants) {
      if (variant.id) {
        if (!existingVariants.some(item => item.id === variant.id)) throw new Error("Variant does not belong to this product");
        await tx.update(productVarient).set({ color: variant.color, bannerImage: variant.bannerImage, images: variant.images }).where(eq(productVarient.id, variant.id));
        retained.add(variant.id);
      } else {
        const [created] = await tx.insert(productVarient).values({ productId: id, color: variant.color, bannerImage: variant.bannerImage, images: variant.images }).returning();
        retained.add(created.id);
      }
    }
    const removed = existingVariants.filter(item => !retained.has(item.id));
    if (removed.length) await tx.delete(productVarient).where(inArray(productVarient.id, removed.map(item => item.id)));
    return { id };
  });
}
export async function createProduct(data: unknown) { return saveProduct(data); }
export async function updateProdcutInfoBySlug({ slug, productDetails }: any) { return saveProduct(productDetails, slug); }
export async function getProdcutInfoBySlug(slug: string) { return loadCatalog(eq(product.slug, slug)); }
export async function getProductByCategory(categoryID: string) {
  return variantCards(await loadCatalog(or(eq(product.categoryId1, categoryID), eq(product.categoryId2, categoryID))));
}
export async function getSimillarProducts(categoryID: string, currentProductSlug: string) {
  const products = variantCards(await loadCatalog()).filter(item => item.slug !== currentProductSlug);
  return products.sort((a, b) => Number(b.categoryId1 === categoryID) - Number(a.categoryId1 === categoryID)).slice(0, 4);
}
export async function deleteProductBySlug(slug: string) {
  if (!await getOrderAdmin()) throw new Error("Admin sign-in is required.");
  // Archive by hiding every size; retain product IDs and historical order links.
  return db.update(product).set({ pricingConfig: [], sizes: [], isInStoke: false, updatedAt: new Date() }).where(eq(product.slug, slug));
}

async function normalizeProductCategoryIds<T extends Record<string, any>>(data: T) {
  const categories = await getAllCategories();

  return {
    ...data,
    categoryId1: resolveCategoryId(
      data.categoryId1 ?? data.category_id_1,
      categories,
      1
    ),
    categoryId2: resolveCategoryId(
      data.categoryId2 ?? data.category2_id_2 ?? data.category_id_2,
      categories,
      2
    ),
  };
}

function resolveCategoryId(
  value: unknown,
  categories: CategoryRecord[],
  level: number
) {
  if (typeof value !== "string") return null;

  const trimmedValue = value.trim();
  if (!trimmedValue) return null;

  const normalizedValue = trimmedValue.toLowerCase();
  const category = categories.find(
    (item) =>
      item.level === level &&
      (item.id === trimmedValue ||
        item.slug === trimmedValue ||
        item.name.toLowerCase() === normalizedValue)
  );

  return category?.id ?? null;
}
