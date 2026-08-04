"use server";

import { product } from "@/db/productSchema";
import { db } from "@/lib/db";
import { compactProduct, fallbackProducts } from "@/lib/productAdapter";
import { eq, ilike, not } from "drizzle-orm";

export async function useGetAllProducts(
  page: number | null,
  pageSize: number | null
) {
  try {
    if (!page || !pageSize) {
      const data = await db
        .select()
        .from(product)
        .where(not(eq(product.isDeleted, true)));
      return data.map(compactProduct);
    }
    const offset = (page - 1) * pageSize;

    const products = await db
      .select()
      .from(product)
      .where(not(eq(product.isDeleted, true)))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await db.$count(product);
    const total = Number(totalResult);

    return { products: products.map(compactProduct), total };
  } catch {
    console.warn("Product database unavailable; rendering fallback products.");
    const fallback = fallbackProducts.slice(0, pageSize ?? fallbackProducts.length);
    return page && pageSize ? { products: fallback, total: fallbackProducts.length } : fallback;
  }
}

export async function useGetSearchedProducts(searchString: string) {
  try {
    const data = await db
      .select()
      .from(product)
      .where(ilike(product.name, `%${searchString}%`));
    return data.map(compactProduct);
  } catch {
    console.warn("Product search database unavailable; rendering fallback results.");
    const term = searchString.toLowerCase();
    return fallbackProducts.filter((item) => item.name?.toLowerCase().includes(term));
  }
}
