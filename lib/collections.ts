import { and, asc, desc, eq, inArray, type SQL } from "drizzle-orm";
import { collection, collectionProduct } from "@/db/collectionSchema";
import { product } from "@/db/productSchema";
import { db } from "./db";
import { loadCatalog } from "./productCatalog";
import { variantCards } from "./productAdapter";
import { isMissingDatabaseObject } from "./databaseSchemaStatus";
import { isCollectionSchemaMissing } from "./collectionSchemaStatus";

async function getCollectionMemberships(where: SQL) {
  const fields = { collectionId: collectionProduct.collectionId, productId: collectionProduct.productId };
  const tieBreakers = [asc(collectionProduct.sortOrder), asc(collectionProduct.productId)];
  try {
    return await db.select({ ...fields, priority: collectionProduct.priority })
      .from(collectionProduct).where(where).orderBy(desc(collectionProduct.priority), ...tieBreakers);
  } catch (error) {
    if (!isMissingDatabaseObject(error, "42703", "priority")) throw error;
    const rows = await db.select(fields).from(collectionProduct).where(where).orderBy(...tieBreakers);
    return rows.map(row => ({ ...row, priority: 1 }));
  }
}

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
    const memberships = await getCollectionMemberships(inArray(collectionProduct.collectionId, rows.map(row => row.id)));
    // Count pieces using the same availability rules as the product cards.
    const productIds = [...new Set(memberships.map(item => item.productId))];
    const visibleIds = admin || !productIds.length ? null : new Set(
      variantCards(await loadCatalog(inArray(product.id, productIds))).map(item => item.id),
    );
    return rows.map(row => {
      const members = memberships.filter(item => item.collectionId === row.id);
      const ids = members.map(item => item.productId);
      return {
        ...row,
        productIds: ids,
        productCount: ids.filter(id => !visibleIds || visibleIds.has(id)).length,
        ...(admin && { productPriorities: Object.fromEntries(members.map(item => [item.productId, item.priority])) }),
      };
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
    const memberships = await getCollectionMemberships(eq(collectionProduct.collectionId, row.id));
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
