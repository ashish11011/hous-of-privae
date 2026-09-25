import { db } from "./db";
import { product, productVarient } from "@/db/productSchema";
import { desc, eq, type SQL } from "drizzle-orm";
import { compactProduct, type ProductVariant } from "./productAdapter";

export async function loadCatalog(where?: SQL) {
  const rows = await db.select({ product, variant: productVarient }).from(product)
    .leftJoin(productVarient, eq(productVarient.productId, product.id)).where(where)
    .orderBy(desc(product.createdAt), product.id, productVarient.createdAt, productVarient.id);
  const groups = new Map<string, { product: typeof product.$inferSelect; variants: ProductVariant[] }>();
  for (const row of rows) {
    const entry = groups.get(row.product.id) ?? { product: row.product, variants: [] };
    if (row.variant) entry.variants.push(row.variant);
    groups.set(row.product.id, entry);
  }
  return [...groups.values()].map(row => compactProduct(row.product, row.variants));
}
