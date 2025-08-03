"use server";
import { eq } from "drizzle-orm";
import { db } from "../../lib/db";
import { product } from "../../db/productSchema";

export const generateUniqueSlug = async (name: string) => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  let slug = base;
  let count = 1;

  while (true) {
    const existing = await db
      .select()
      .from(product)
      .where(eq(product.slug, slug));

    if (existing.length === 0) break;

    slug = `${base}-${count}`;
    count++;
  }

  return slug;
};
