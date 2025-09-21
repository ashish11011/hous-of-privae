"use server";
import slugify from "slugify";
import { product } from "@/db/productSchema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function generateUniqueSlug(name: string) {
  let base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let i = 1;

  while (true) {
    const existing = await db
      .select()
      .from(product)
      .where(eq(product.slug, slug));
    if (existing.length === 0) break;
    slug = `${base}-${i++}`;
  }

  return slug;
}
