import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getOrderedCategoryProducts, saveCategoryProductOrder } from "@/lib/categoryProducts";
import { isMissingDatabaseObject } from "@/lib/databaseSchemaStatus";

const denied = () => NextResponse.json({ msg: "Admin sign-in is required." }, { status: 403 });

export async function GET(request: Request) {
  if (!await getOrderAdmin()) return denied();
  const id = z.uuid().safeParse(new URL(request.url).searchParams.get("id"));
  if (!id.success) return NextResponse.json({ msg: "Invalid category ID." }, { status: 400 });

  const products = await getOrderedCategoryProducts(id.data);
  return NextResponse.json({
    products: products.map(({ id, name, slug, sku, priority }) => ({ id, name, slug, sku, priority })),
  });
}

const orderInput = z.object({
  id: z.uuid(),
  productIds: z.array(z.uuid()).refine(ids => new Set(ids).size === ids.length),
});

export async function PUT(request: Request) {
  if (!await getOrderAdmin()) return denied();
  const input = orderInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ msg: "Invalid product order." }, { status: 400 });

  try {
    const current = await saveCategoryProductOrder(input.data.id, input.data.productIds);
    if (!current) {
      return NextResponse.json({ msg: "The category or its products changed. Reopen the product list and try again." }, { status: 409 });
    }
    revalidatePath(`/category/${current.slug}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isMissingDatabaseObject(error, "42P01", "category_product_priorities")) {
      return NextResponse.json({ msg: "Apply the category priority schema before saving product order." }, { status: 503 });
    }
    console.error("Unable to save category product order", error);
    return NextResponse.json({ msg: "Unable to save product order." }, { status: 500 });
  }
}
