"use server";
import { loadCatalog } from "@/lib/productCatalog";
import { variantCards } from "@/lib/productAdapter";
export async function getProductFromIds(ids: string[]) {
  if (!ids.length) return [];
  return variantCards(await loadCatalog())
    .filter(item => ids.includes(item.variantId!) || (ids.includes(item.id) && item.variantId === item.variants[0]?.id))
    .map(item => ({ ...item, wishlistKey: ids.includes(item.variantId!) ? item.variantId : item.id }));
}
