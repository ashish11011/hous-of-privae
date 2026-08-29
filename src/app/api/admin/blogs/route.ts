import { NextResponse } from "next/server";
import { createBlog, deleteBlog, getAllBlogs, updateBlog } from "@/lib/blogHelper";

export async function GET() {
  try {
    const blogs = await getAllBlogs();
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to load blogs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const blog = await createBlog(body);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to create blog" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const blog = await updateBlog(body);
    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to update blog" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json({ success: false, msg: "Blog id is required" }, { status: 400 });
    }

    await deleteBlog(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to delete blog" },
      { status: 500 }
    );
  }
}
