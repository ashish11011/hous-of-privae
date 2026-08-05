import { NextResponse } from "next/server";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  updateCategory,
} from "@/lib/categoryHelper";

export async function GET() {
  const categories = await getAllCategories();
  return NextResponse.json({ success: true, data: categories });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const category = await createCategory(body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const category = await updateCategory(body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, msg: "Category id is required" }, { status: 400 });
    }

    await deleteCategory(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to delete category" },
      { status: 500 }
    );
  }
}
