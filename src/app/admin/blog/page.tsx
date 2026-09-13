import Link from "next/link";
import { Edit2, Eye, EyeOff, Plus } from "lucide-react";
import { getAllBlogs } from "@/lib/blogHelper";
import { getImagePreviewUrl } from "@/lib/blogImage";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteBlogButton } from "./_components/DeleteBlogButton";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const blogs = await getAllBlogs();

  return (
    <main className="w-full p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blogs</h1>
          <p className="text-sm text-muted-foreground">Create, edit, publish, hide, and delete blog articles.</p>
        </div>
        <Button asChild>
          <Link href="/admin/blog/new">
            <Plus size={16} />
            New Blog
          </Link>
        </Button>
      </div>

      <div className="overflow-x-auto border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Blog</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {blogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-28 text-center text-sm text-muted-foreground">
                  No blogs yet.
                </TableCell>
              </TableRow>
            ) : (
              blogs.map((blog) => (
                <TableRow key={blog.id}>
                  <TableCell className="min-w-[280px]">
                    <div className="flex items-center gap-3">
                      {blog.image ? (
                        <img
                          src={getImagePreviewUrl(blog.image)}
                          alt=""
                          className="h-14 w-20 border object-cover"
                        />
                      ) : (
                        <div className="h-14 w-20 border bg-muted" />
                      )}
                      <div>
                        <p className="font-medium">{blog.title || "Untitled"}</p>
                        <p className="line-clamp-1 text-xs text-muted-foreground">{blog.metaDescription || "No description"}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{blog.blogCategory || "-"}</TableCell>
                  <TableCell>{blog.date || "-"}</TableCell>
                  <TableCell>
                    <Badge variant={blog.isVisible ? "default" : "secondary"}>
                      {blog.isVisible ? <Eye size={12} /> : <EyeOff size={12} />}
                      {blog.isVisible ? "Visible" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{blog.slug || "-"}</TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/blog/${blog.id}`}>
                          <Edit2 size={14} />
                          Edit
                        </Link>
                      </Button>
                      <DeleteBlogButton id={blog.id} title={blog.title} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
