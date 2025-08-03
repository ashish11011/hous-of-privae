"use server";
// lib/generate-slug.ts
import slugify from "slugify";
import { eq, ilike } from "drizzle-orm";
import { db } from "../../lib/db";
import { product } from "../../db/productSchema";

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
