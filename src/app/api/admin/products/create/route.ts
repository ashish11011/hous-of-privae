import { createProduct } from "@/lib";
import { revalidateProductCatalogPaths } from "@/lib/revalidateProductPaths";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const body = await req.json();
    if (typeof body.name !== "string" || !body.name.trim()) return NextResponse.json({ success: false, msg: "Product name is required" }, { status: 400 });
    body.slug = generateUniqueSlug(body.name);
    await createProduct(body);
    await revalidateProductCatalogPaths(body);

    return NextResponse.json({
      success: true,
      msg: "successfully created product",
    });
  } catch (error) {
    return NextResponse.json({ success: false, msg: String(error) }, { status: 500 });
  }
};

function generateUniqueSlug(name: string): string {
  // Remove all non-alphanumeric characters and replace spaces with hyphens
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove all non-alphanumeric characters (except hyphens)
}
