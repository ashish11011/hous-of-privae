"use server";
import { loadCatalog } from "@/lib/productCatalog";
import { variantCards } from "@/lib/productAdapter";

export async function useGetAllProducts(page: number | null, pageSize: number | null) {
  const products = variantCards(await loadCatalog());
  return page && pageSize ? { products: products.slice((page - 1) * pageSize, page * pageSize), total: products.length } : products;
}
export async function getAdminProducts(page: number, pageSize: number) {
  const products = await loadCatalog();
  return { products: products.slice((page - 1) * pageSize, page * pageSize), total: products.length };
}
export async function useGetSearchedProducts(searchString: string) { return searchProducts(searchString, 24); }
export async function searchProducts(searchString = "", limit = 8) {
  const term = searchString.trim().toLowerCase();
  return variantCards(await loadCatalog()).filter(item =>
    [item.name, item.sku, item.fabric, item.description, ...item.colors ?? [], ...item.materials ?? []].filter(Boolean).join(" ").toLowerCase().includes(term)
  ).slice(0, limit);
}
