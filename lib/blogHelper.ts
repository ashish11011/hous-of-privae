"use server";

import { desc, eq } from "drizzle-orm";
import { blogTable } from "@/db/schema";
import { db } from "./db";
import { normalizeStoredS3Key } from "./blogImage";

export type BlogRecord = typeof blogTable.$inferSelect;

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizeTags(value: unknown) {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  return String(value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function normalizeVisibility(value: unknown) {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") return value !== "false";
  return true;
}

async function createUniqueBlogSlug(baseSlug: string, currentId?: string) {
  let slug = baseSlug;
  let suffix = 2;

  while (true) {
    const [existing] = await db
      .select({ id: blogTable.id })
      .from(blogTable)
      .where(eq(blogTable.slug, slug))
      .limit(1);

    if (!existing || existing.id === currentId) return slug;
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }
}

async function normalizeBlogInput(input: Record<string, unknown>, currentId?: string) {
  const title = String(input.title ?? "").trim();
  if (!title) throw new Error("Blog title is required");

  const baseSlug = slugify(String(input.slug || title));
  if (!baseSlug) throw new Error("Blog slug is required");

  return {
    title,
    metaDescription: String(input.metaDescription ?? "").trim() || null,
    blogCategory: String(input.blogCategory ?? "").trim() || null,
    image: normalizeStoredS3Key(String(input.image ?? "")) || null,
    tags: normalizeTags(input.tags),
    date:
      String(input.date ?? "").trim() ||
      new Date().toISOString().slice(0, 10),
    data: String(input.data ?? "").trim() || null,
    userImage: normalizeStoredS3Key(String(input.userImage ?? "")) || null,
    userName: String(input.userName ?? "").trim() || null,
    slug: await createUniqueBlogSlug(baseSlug, currentId),
    isVisible: normalizeVisibility(input.isVisible),
  };
}

export async function getAllBlogs() {
  return db.select().from(blogTable).orderBy(desc(blogTable.date));
}

export async function getVisibleBlogs() {
  try {
    return await db
      .select()
      .from(blogTable)
      .where(eq(blogTable.isVisible, true))
      .orderBy(desc(blogTable.date));
  } catch {
    console.warn("Blog database unavailable; using static blog data only.");
    return [];
  }
}

export async function getBlogBySlug(slug: string) {
  try {
    const [blog] = await db
      .select()
      .from(blogTable)
      .where(eq(blogTable.slug, slug))
      .limit(1);

    return blog ?? null;
  } catch {
    console.warn("Blog database unavailable; dynamic blog lookup failed.");
    return null;
  }
}

export async function createBlog(input: Record<string, unknown>) {
  const [created] = await db
    .insert(blogTable)
    .values(await normalizeBlogInput(input))
    .returning();

  return created;
}

export async function updateBlog(input: Record<string, unknown>) {
  const id = String(input.id ?? "");
  if (!id) throw new Error("Blog id is required");

  const [updated] = await db
    .update(blogTable)
    .set(await normalizeBlogInput(input, id))
    .where(eq(blogTable.id, id))
    .returning();

  return updated;
}

export async function deleteBlog(id: string) {
  const [deleted] = await db.delete(blogTable).where(eq(blogTable.id, id)).returning();
  return deleted;
}
