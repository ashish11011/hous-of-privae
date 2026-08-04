"use server";
import { and, eq, not, or } from "drizzle-orm";
import { db } from "./db";
import { product } from "@/db/productSchema";
import {
  compactProduct,
  fallbackProducts,
  normalizeProductInput,
} from "./productAdapter";

export async function createProduct(data: any) {
  const result = await db.insert(product).values(normalizeProductInput(data));

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
    const data = await db
      .select()
      .from(product)
      .where(
        or(
          eq(product.categoryId1, categoryID),
          eq(product.categoryId2, categoryID)
        )
      );
    return data.map(compactProduct);
  } catch {
    console.warn("Category products database unavailable; using fallback product data.");
    return fallbackProducts.filter(
      (item) => item.categoryId1 === categoryID || item.categoryId2 === categoryID
    );
  }
}

export async function updateProdcutInfoBySlug({ slug, productDetails }: any) {
  return await db
    .update(product)
    .set(normalizeProductInput(productDetails))
    .where(eq(product.slug, slug));
}

export async function deleteProductBySlug(slug: string) {
  return await db
    .update(product)
    .set({ isDeleted: true })
    .where(eq(product.slug, slug));
}
