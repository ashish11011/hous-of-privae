import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { collection, collectionProduct } from "@/db/collectionSchema";
import { product } from "@/db/productSchema";
import { db } from "./db";
import { requireAdmin } from "./auth/admin";
import { collectionInput } from "./collectionValidation";

function refreshCollections() {
  revalidatePath("/", "layout");
  revalidatePath("/sitemap.xml");
}

export async function saveCollection(input: unknown, updating: boolean) {
  await requireAdmin();
  const { id, productIds, ...values } = collectionInput.parse(input);
  if (updating && !id) throw new Error("Collection ID is required");
  const result = await db.transaction(async tx => {
    if (productIds.length) {
      const products = await tx.select({ id: product.id }).from(product).where(inArray(product.id, productIds));
      if (products.length !== productIds.length) throw new Error("One or more selected products no longer exist. Reload and try again.");
    }
    const [saved] = updating
      ? await tx.update(collection).set({ ...values, updatedAt: new Date() }).where(eq(collection.id, id!)).returning()
      : await tx.insert(collection).values(values).returning();
    if (!saved) throw new Error("Collection not found");
    await tx.delete(collectionProduct).where(eq(collectionProduct.collectionId, saved.id));
    if (productIds.length) await tx.insert(collectionProduct).values(productIds.map((productId, sortOrder) => ({ collectionId: saved.id, productId, sortOrder })));
    return saved;
  });
  refreshCollections();
  return result;
}

export async function deleteCollection(id: string) {
  await requireAdmin();
  const [deleted] = await db.delete(collection).where(eq(collection.id, id)).returning();
  if (!deleted) throw new Error("Collection not found");
  refreshCollections();
}
