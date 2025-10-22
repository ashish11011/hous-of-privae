"use server";

import { product } from "@/db/productSchema";
import { db } from "@/lib/db";
import { eq, ilike, not } from "drizzle-orm";

export async function useGetAllProducts(
  page: number | null,
  pageSize: number | null
) {
  if (!page || !pageSize) return await db.select().from(product);
  const offset = (page - 1) * pageSize;

  const products = await db
    .select()
    .from(product)
    .where(not(eq(product.isDeleted, true)))
    .limit(pageSize)
    .offset(offset);

  const totalResult = await db.$count(product);
  const total = Number(totalResult);

  return { products, total };
}

export async function useGetSearchedProducts(searchString: string) {
  return await db
    .select()
    .from(product)
    .where(ilike(product.name, `%${searchString}%`));
}
