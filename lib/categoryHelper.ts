"use server";

import { asc, eq, or } from "drizzle-orm";
import { categoryTable } from "@/db/schema";
import { CATEGORY_1, CATEGORY_2, moreSidebarCategories } from "@/const";
import { db } from "./db";

export type CategoryRecord = typeof categoryTable.$inferSelect;

export async function generateCategorySlug(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function fallbackCategories(): Promise<CategoryRecord[]> {
  const levelOne = [...CATEGORY_1, ...moreSidebarCategories].map((item) => ({
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    image: "image" in item ? item.image ?? null : null,
    tagline: "tagline" in item ? item.tagline ?? null : null,
    level: 1,
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  const levelTwo = CATEGORY_2.map((item) => ({
    id: String(item.id),
    name: item.name,
    slug: item.slug,
    image: item.image ?? null,
    tagline: null,
    level: 2,
    parentId: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

  return [...levelOne, ...levelTwo];
}

export async function getAllCategories() {
  try {
    const categories = await db
      .select()
      .from(categoryTable)
      .orderBy(asc(categoryTable.level), asc(categoryTable.name));

    return categories.length ? categories : fallbackCategories();
  } catch {
    console.warn("Categories database unavailable; using fallback category data.");
    return fallbackCategories();
  }
}

export async function getCategoryBySlugOrId(value: string) {
  try {
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(or(eq(categoryTable.id, value), eq(categoryTable.slug, value)))
      .limit(1);

    if (category) return category;
  } catch {
    console.warn("Category database unavailable; using fallback category lookup.");
  }

  return (await fallbackCategories()).find((item) => item.id === value || item.slug === value) ?? null;
}

export async function getCategoryBySlug(slug: string) {
  try {
    const [category] = await db
      .select()
      .from(categoryTable)
      .where(eq(categoryTable.slug, slug))
      .limit(1);

    if (category) return category;
  } catch {
    console.warn("Category database unavailable; using fallback category lookup.");
  }

  return (await fallbackCategories()).find((item) => item.slug === slug) ?? null;
}

export async function createCategory(input: Record<string, any>) {
  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("Category name is required");

  const slug = await generateCategorySlug(input.slug || name);
  if (!slug) throw new Error("Category slug is required");

  const [created] = await db
    .insert(categoryTable)
    .values({
      name,
      slug,
      image: input.image || null,
      tagline: input.tagline || null,
      level: Number(input.level) === 2 ? 2 : 1,
      parentId: input.parentId || null,
      isActive: input.isActive ?? true,
    })
    .returning();

  return created;
}

export async function updateCategory(input: Record<string, any>) {
  if (!input.id) throw new Error("Category id is required");

  const name = String(input.name ?? "").trim();
  if (!name) throw new Error("Category name is required");

  const slug = await generateCategorySlug(input.slug || name);
  if (!slug) throw new Error("Category slug is required");

  const [updated] = await db
    .update(categoryTable)
    .set({
      name,
      slug,
      image: input.image || null,
      tagline: input.tagline || null,
      level: Number(input.level) === 2 ? 2 : 1,
      parentId: input.parentId || null,
      isActive: Boolean(input.isActive),
      updatedAt: new Date(),
    })
    .where(eq(categoryTable.id, input.id))
    .returning();

  return updated;
}

export async function deleteCategory(id: string) {
  const [deleted] = await db.delete(categoryTable).where(eq(categoryTable.id, id)).returning();
  return deleted;
}
