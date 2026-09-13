import { notFound } from "next/navigation";
import { getBlogById } from "@/lib/blogHelper";
import { BlogForm } from "../_components/BlogForm";

export const dynamic = "force-dynamic";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const blog = await getBlogById(id);

  if (!blog) notFound();

  return <BlogForm blog={blog} />;
}
