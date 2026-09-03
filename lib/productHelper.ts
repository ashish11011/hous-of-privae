"use server";
import { and, eq, not, or } from "drizzle-orm";
import { db } from "./db";
import { product } from "@/db/productSchema";
import {
  compactProduct,
  fallbackProducts,
  normalizeProductInput,
} from "./productAdapter";
import { getAllCategories, type CategoryRecord } from "./categoryHelper";

export async function createProduct(data: any) {
  const result = await db
    .insert(product)
    .values(normalizeProductInput(await normalizeProductCategoryIds(data)));

  return result;
}

export async function getProdcutInfoBySlug(slug: string) {
  try {
    const data = await db.select().from(product).where(eq(product.slug, slug));
    return data.map(compactProduct);
  } catch {
    console.warn("Product detail database unavailable; using fallback product data.");
    return fallbackProducts.filter((item) => item.slug === slug);
  }
}

export async function getSimillarProducts(
  categoryID: string,
  currentProductSlug: string
) {
  // return await db.select().from(product).where(eq(product.slug, slug));
  try {
    const categoryProducts = await db
      .select()
      .from(product)
      .where(
        and(
          or(
            eq(product.categoryId1, categoryID),
            eq(product.categoryId2, categoryID)
          ),
          not(eq(product.slug, currentProductSlug))
        )
      )
      .limit(4);

    const productMoreRemaining = 4 - categoryProducts.length;

    const remainingProducts =
      productMoreRemaining > 0
        ? await db
            .select()
            .from(product)
            .where(not(eq(product.slug, currentProductSlug)))
            .limit(productMoreRemaining)
        : [];

    return [...categoryProducts, ...remainingProducts].map(compactProduct);
  } catch {
    console.warn("Similar products database unavailable; using fallback product data.");
    return fallbackProducts.filter((item) => item.slug !== currentProductSlug).slice(0, 4);
  }
}

export async function getProductByCategory(categoryID: string) {
  try {
    const categoryFilters = or(
      eq(product.categoryId1, categoryID),
      eq(product.categoryId2, categoryID)
    );

    const data = await db
      .select()
      .from(product)
      .where(and(not(eq(product.isDeleted, true)), categoryFilters));

    return data.map(compactProduct);
  } catch {
    console.warn("Category products database unavailable; using fallback product data.");
    return fallbackProducts.filter(
      (item) =>
        item.isDeleted !== true &&
        (item.categoryId1 === categoryID || item.categoryId2 === categoryID)
    );
  }
}

export async function updateProdcutInfoBySlug({ slug, productDetails }: any) {
  return await db
    .update(product)
    .set(
      normalizeProductInput(await normalizeProductCategoryIds(productDetails))
    )
    .where(eq(product.slug, slug));
}

export async function deleteProductBySlug(slug: string) {
  return await db
    .update(product)
    .set({ isDeleted: true })
    .where(eq(product.slug, slug));
}

async function normalizeProductCategoryIds(data: Record<string, any>) {
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
