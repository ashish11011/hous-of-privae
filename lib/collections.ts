import { and, asc, eq, inArray } from "drizzle-orm";
import { collection, collectionProduct } from "@/db/collectionSchema";
import { product } from "@/db/productSchema";
import { db } from "./db";
import { loadCatalog } from "./productCatalog";
import { variantCards } from "./productAdapter";
import { isCollectionSchemaMissing } from "./collectionSchemaStatus";

export async function getNavbarCollections() {
  try {
    return await db.select({ name: collection.name, slug: collection.slug, isComingSoon: collection.isComingSoon })
      .from(collection)
      .where(and(eq(collection.isActive, true), eq(collection.isComingSoon, false)))
      .orderBy(asc(collection.sortOrder), asc(collection.name));
  } catch (error) {
    if (isCollectionSchemaMissing(error)) return [];
    throw error;
  }
}

export async function getCollections(admin = false) {
  try {
    const rows = await db.select().from(collection).where(admin ? undefined : eq(collection.isActive, true))
      .orderBy(asc(collection.sortOrder), asc(collection.name));
    if (!rows.length) return [];
    const memberships = await db.select().from(collectionProduct)
      .where(inArray(collectionProduct.collectionId, rows.map(row => row.id)))
      .orderBy(asc(collectionProduct.sortOrder), asc(collectionProduct.productId));
    // Count pieces using the same availability rules as the product cards.
    const productIds = [...new Set(memberships.map(item => item.productId))];
    const visibleIds = admin || !productIds.length ? null : new Set(
      variantCards(await loadCatalog(inArray(product.id, productIds))).map(item => item.id),
    );
    return rows.map(row => {
      const ids = memberships.filter(item => item.collectionId === row.id).map(item => item.productId);
      return { ...row, productIds: ids, productCount: ids.filter(id => !visibleIds || visibleIds.has(id)).length };
    });
  } catch (error) {
    if (!admin && isCollectionSchemaMissing(error)) return [];
    throw error;
  }
}

export async function getCollectionBySlug(slug: string) {
  try {
    const [row] = await db.select().from(collection)
      .where(and(eq(collection.slug, slug), eq(collection.isActive, true), eq(collection.isComingSoon, false))).limit(1);
    if (!row) return null;
    const memberships = await db.select().from(collectionProduct).where(eq(collectionProduct.collectionId, row.id))
      .orderBy(asc(collectionProduct.sortOrder), asc(collectionProduct.productId));
    const ids = memberships.map(item => item.productId);
    const products = ids.length ? await loadCatalog(inArray(product.id, ids)) : [];
    const order = new Map(ids.map((id, index) => [id, index]));
    products.sort((a, b) => order.get(a.id)! - order.get(b.id)!);
    return { ...row, products: variantCards(products) };
  } catch (error) {
    if (isCollectionSchemaMissing(error)) return null;
    throw error;
  }
}
