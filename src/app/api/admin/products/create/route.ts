import { createProduct } from "@/lib";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  const body = await req.json();
  const slug = generateUniqueSlug(body.name);
  body.slug = slug;
  try {
    await createProduct(body);
    return NextResponse.json({
      success: true,
      msg: "successfully created product",
    });
  } catch (error) {
    NextResponse.json({ success: false, msg: error });
  }
};

function generateUniqueSlug(name: string): string {
  // Remove all non-alphanumeric characters and replace spaces with hyphens
  return name
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, ""); // Remove all non-alphanumeric characters (except hyphens)
}
