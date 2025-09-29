"use server";

import { product } from "@/db/productSchema";
import { db } from "@/lib/db";
import { eq, not } from "drizzle-orm";

export async function useGetAllProducts(page: number, pageSize: number) {
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
