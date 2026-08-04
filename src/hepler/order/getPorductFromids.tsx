"use server";
import { productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { compactProduct, fallbackProducts } from "@/lib/productAdapter";
import { inArray } from "drizzle-orm";

export const getProductFromIds = async (ids: string[]) => {
  if (ids.length === 0) return [];
  try {
    const data = await db
      .select()
      .from(productTable)
      .where(inArray(productTable.id, ids));
    return data.map(compactProduct);
  } catch {
    console.warn("Wishlist product database unavailable; using fallback product data.");
    return fallbackProducts.filter((item) => ids.includes(item.id));
  }
};
