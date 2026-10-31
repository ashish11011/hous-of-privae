import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getCollections } from "@/lib/collections";
import { saveCollection, deleteCollection } from "@/lib/collectionAdmin";
import { loadCatalog } from "@/lib/productCatalog";
import { isCollectionSchemaMissing } from "@/lib/collectionSchemaStatus";

function failure(error: unknown) {
  if (isCollectionSchemaMissing(error)) return NextResponse.json({ success: false, msg: "Collections are not available yet. The new collection schema must be applied to the database before you can manage them." }, { status: 503 });
  if (error instanceof ZodError) return NextResponse.json({ success: false, msg: error.issues[0]?.message ?? "Invalid collection" }, { status: 400 });
  const cause = error as { code?: string; cause?: { code?: string } };
  if (cause?.code === "23505" || cause?.cause?.code === "23505") return NextResponse.json({ success: false, msg: "That collection slug is already in use." }, { status: 409 });
  console.error("Collection operation failed", error);
  return NextResponse.json({ success: false, msg: "Unable to save changes. Check that the collection and selected products still exist, then try again." }, { status: 500 });
}

const denied = () => NextResponse.json({ success: false, msg: "Admin sign-in is required." }, { status: 403 });

export async function GET() {
  if (!await getOrderAdmin()) return denied();
  try {
    const [data, catalog] = await Promise.all([getCollections(true), loadCatalog()]);
    const products = catalog.map(item => ({ id: item.id, name: item.name, sku: item.sku, image: item.bannerImage, slug: item.slug }));
    return NextResponse.json({ success: true, data, products });
  } catch (error) { return failure(error); }
}

export async function POST(req: Request) {
  if (!await getOrderAdmin()) return denied();
  try { return NextResponse.json({ success: true, data: await saveCollection(await req.json(), false) }); }
  catch (error) { return failure(error); }
}

export async function PUT(req: Request) {
  if (!await getOrderAdmin()) return denied();
  try { return NextResponse.json({ success: true, data: await saveCollection(await req.json(), true) }); }
  catch (error) { return failure(error); }
}

export async function DELETE(req: Request) {
  if (!await getOrderAdmin()) return denied();
  try {
    const { id } = z.object({ id: z.uuid() }).parse(await req.json());
    await deleteCollection(id);
    return NextResponse.json({ success: true });
  } catch (error) { return failure(error); }
}
