import { CATEGORY_1 } from "@/const";
import { productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { MetadataRoute } from "next";
// import { db } from '../../lib/db';
// import { blogTable } from '../../db/schema';

const paths = [
  "",
  "/about-us",
  "/career",
  "/contact-us",
  "/hire-us",
  "/services",
  "/blog",
  "/privacy-policy",
  "/terms-and-conditions",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const pathEntries = paths.map((path) => ({
    url: `${baseUrl}${path}/`,
    lastModified: new Date().toISOString(),
  }));

  const productData = await db
    .select({
      slug: productTable.slug,
    })
    .from(productTable);

  const productDataEnteries = productData.map((product) => ({
    url: `${baseUrl}/product/${product.slug}/`,
    lastModified: new Date().toISOString(),
  }));
  const categoryDataEnteries = CATEGORY_1.map((cat) => ({
    url: `${baseUrl}/category/${cat.slug}/`,
    lastModified: new Date().toISOString(),
  }));

  return [...pathEntries, ...productDataEnteries, ...categoryDataEnteries];
}
