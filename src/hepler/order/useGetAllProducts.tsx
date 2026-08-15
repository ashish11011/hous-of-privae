"use server";

import { product } from "@/db/productSchema";
import { db } from "@/lib/db";
import { compactProduct, fallbackProducts } from "@/lib/productAdapter";
import { and, eq, ilike, not, or } from "drizzle-orm";

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
  return searchProducts(searchString, 24);
}

export async function searchProducts(searchString = "", limit = 8) {
  const term = searchString.trim();

  try {
    const visibleProducts = not(eq(product.isDeleted, true));
    const searchFilter = term
      ? or(
          ilike(product.name, `%${term}%`),
          ilike(product.sku, `%${term}%`),
          ilike(product.fabric, `%${term}%`),
          ilike(product.description, `%${term}%`),
          ilike(product.care, `%${term}%`),
          ilike(product.style_note, `%${term}%`),
          ilike(product.customization, `%${term}%`)
        )
      : undefined;

    const data = await db
      .select()
      .from(product)
      .where(searchFilter ? and(visibleProducts, searchFilter) : visibleProducts)
      .limit(limit);

    return data.map(compactProduct);
  } catch {
    console.warn("Product search database unavailable; rendering fallback results.");
    const fallbackTerm = term.toLowerCase();
    const matches = fallbackTerm
      ? fallbackProducts.filter((item) => {
          const haystack = [
            item.name,
            item.sku,
            item.fabric,
            item.description,
            item.care,
            item.style_note,
            item.customization,
            ...(item.colors ?? []),
            ...(item.materials ?? []),
            ...(item.sizes ?? []),
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();

          return haystack.includes(fallbackTerm);
        })
      : fallbackProducts;

    return matches.slice(0, limit);
  }
}
