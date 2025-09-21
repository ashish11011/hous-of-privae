"use server";
import { and, eq, not, or } from "drizzle-orm";
import { db } from "./db";
import { product } from "@/db/productSchema";

export async function getAllProducts() {
  return await db.select().from(product);
}

export async function createProduct(data: any) {
  const result = await db.insert(product).values({
    ...data,
    slug: data.slug,
  });

  return result;
}

export async function getProdcutInfoBySlug(slug: string) {
  return await db.select().from(product).where(eq(product.slug, slug));
}

export async function getSimillarProducts(
  categoryID: string,
  currentProductSlug: string
) {
  // return await db.select().from(product).where(eq(product.slug, slug));
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

  return [...categoryProducts, ...remainingProducts];
}

export async function getProductByCategory(categoryID: string) {
  return await db
    .select()
    .from(product)
    .where(
      or(
        eq(product.categoryId1, categoryID),
        eq(product.categoryId2, categoryID)
      )
    );
}

export async function updateProdcutInfoBySlug({ slug, productDetails }: any) {
  return await db
    .update(product)
    .set(productDetails)
    .where(eq(product.slug, slug));
}
