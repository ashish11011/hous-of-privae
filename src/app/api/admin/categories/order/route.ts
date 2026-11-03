import { asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";
import { categoryPriority, categoryTable } from "@/db/schema";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getSavedCategories } from "@/lib/categoryHelper";
import { isMissingDatabaseObject } from "@/lib/databaseSchemaStatus";
import { db } from "@/lib/db";

const denied = () => NextResponse.json({ msg: "Admin sign-in is required." }, { status: 403 });

export async function GET() {
  if (!await getOrderAdmin()) return denied();
  const categories = await getSavedCategories();
  return NextResponse.json({ categories: categories.map(({ id, name, slug, priority }) => ({ id, name, slug, priority })) });
}

const orderInput = z.object({
  ids: z.array(z.uuid()).min(1).refine(ids => new Set(ids).size === ids.length),
});

export async function PUT(request: Request) {
  if (!await getOrderAdmin()) return denied();
  const input = orderInput.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ msg: "Invalid category order." }, { status: 400 });

  const { ids } = input.data;
  try {
    const saved = await db.transaction(async tx => {
      const categories = await tx.select({ id: categoryTable.id }).from(categoryTable)
        .orderBy(asc(categoryTable.id)).for("update");
      const current = new Set(categories.map(item => item.id));
      if (ids.length !== current.size || ids.some(id => !current.has(id))) return false;

      const priorities = ids.map((categoryId, index) => ({ categoryId, priority: ids.length - index }));
      await tx.delete(categoryPriority);
      await tx.insert(categoryPriority).values(priorities);
      return true;
    });
    if (!saved) return NextResponse.json({ msg: "Categories changed. Reload the category order and try again." }, { status: 409 });

    revalidatePath("/", "layout");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (isMissingDatabaseObject(error, "42P01", "category_priorities")) {
      return NextResponse.json({ msg: "Apply the category priority schema before saving category order." }, { status: 503 });
    }
    console.error("Unable to save category order", error);
    return NextResponse.json({ msg: "Unable to save category order." }, { status: 500 });
  }
}
