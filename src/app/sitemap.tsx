import { loadCatalog } from "@/lib/productCatalog";
import { visibleSizePrices } from "@/lib/productPricing";
import { CATEGORY_1 } from "@/const";
import { MetadataRoute } from "next";
import { getNavbarCollections } from "@/lib/collections";
// import { blogTable } from '../../db/schema';

const paths = [
  "",
  "/about-us",
  "/career",
  "/contact-us",
  "/hire-us",
  "/services",
  "/blog",
  "/magazine",
  "/lookbook",
  "/bespoke",
  "/privae-fit",
  "/gifting",
  "/track",
  "/atelier/glossary",
  "/product",
  "/collection",
  "/privacy",
  "/privacy-policy",
  "/terms",
  "/terms-and-conditions",
  "/shipping",
  "/returns",
  "/faqs",
  "/order-and-shipping",
  "/returns-and-refunds",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://www.hausofprivae.com";

  const pathEntries = paths.map((path) => ({
    url: `${baseUrl}${path}/`,
    lastModified: new Date().toISOString(),
  }));

  const [catalog, collections] = await Promise.all([loadCatalog(), getNavbarCollections()]);
  const productData = catalog.filter(item => item.variants.length && visibleSizePrices(item.pricingConfig).length);

  const productDataEnteries = productData.map((product) => ({
    url: `${baseUrl}/product/${product.slug}/`,
    lastModified: new Date().toISOString(),
  }));
  const categoryDataEnteries = CATEGORY_1.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}/`,
    lastModified: new Date().toISOString(),
  }));

  const collectionEntries = collections.filter(item => !item.isComingSoon).map(item => ({ url: `${baseUrl}/collection/${item.slug}/`, lastModified: new Date().toISOString() }));
  return [...pathEntries, ...productDataEnteries, ...categoryDataEnteries, ...collectionEntries];
}
