import { eq, or } from "drizzle-orm";
import { z } from "zod";
import { category, categoryProductPriority, product } from "@/db/productSchema";
import { db } from "./db";
import { loadCatalog } from "./productCatalog";
import { isMissingDatabaseObject } from "./databaseSchemaStatus";

function categoryMembership(categoryId: string) {
  return or(eq(product.categoryId1, categoryId), eq(product.categoryId2, categoryId));
}

export async function getOrderedCategoryProducts(categoryId: string) {
  const products = await loadCatalog(categoryMembership(categoryId));
  if (!products.length || !z.guid().safeParse(categoryId).success) return products.map(item => ({ ...item, priority: 1 }));

  const priorities = new Map<string, number>();
  try {
    const rows = await db.select().from(categoryProductPriority)
      .where(eq(categoryProductPriority.categoryId, categoryId));
    for (const row of rows) priorities.set(row.productId, row.priority);
  } catch (error) {
    if (!isMissingDatabaseObject(error, "42P01", "category_product_priorities")) throw error;
  }

  return products.map(item => ({ ...item, priority: priorities.get(item.id) ?? 1 }))
    .sort((a, b) => b.priority - a.priority);
}

export async function saveCategoryProductOrder(categoryId: string, productIds: string[]) {
  return db.transaction(async tx => {
    const [current] = await tx.select({ slug: category.slug }).from(category)
      .where(eq(category.id, categoryId)).for("update");
    if (!current) return null;

    const products = await tx.select({ id: product.id }).from(product)
      .where(categoryMembership(categoryId));
    const members = new Set(products.map(item => item.id));
    if (productIds.length !== members.size || productIds.some(id => !members.has(id))) return null;

    await tx.delete(categoryProductPriority).where(eq(categoryProductPriority.categoryId, categoryId));
    if (productIds.length) {
      await tx.insert(categoryProductPriority).values(productIds.map((productId, index) => ({
        categoryId, productId, priority: productIds.length - index,
      })));
    }
    return current;
  });
}
