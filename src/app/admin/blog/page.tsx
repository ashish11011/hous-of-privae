"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import {
  Edit2,
  Eye,
  EyeOff,
  ImagePlus,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getImagePreviewUrl } from "@/lib/blogImage";
import { uploadFileToS3 } from "@/lib/s3-upload";

const Editor = dynamic(() => import("../editor"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[280px] items-center justify-center border bg-muted/20 text-sm text-muted-foreground">
      Loading editor...
    </div>
  ),
});

type Blog = {
  id?: string;
  title: string;
  metaDescription: string;
  blogCategory: string;
  image: string;
  tags: string[];
  date: string;
  data: string;
  userImage: string;
  userName: string;
  slug: string;
  isVisible: boolean;
};

const today = () => new Date().toISOString().slice(0, 10);

const emptyBlog: Blog = {
  title: "",
  metaDescription: "",
  blogCategory: "",
  image: "",
  tags: [],
  date: today(),
  data: "",
  userImage: "",
  userName: "",
  slug: "",
  isVisible: true,
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function tagString(tags: string[]) {
  return tags.join(", ");
}

function parseTags(value: string) {
  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [form, setForm] = useState<Blog>(emptyBlog);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"image" | "userImage" | null>(null);
  const [message, setMessage] = useState("");

  const formTitle = useMemo(
    () => (form.id ? "Edit Blog" : "Create Blog"),
    [form.id]
  );

  async function loadBlogs() {
    setLoading(true);
    const response = await fetch("/api/admin/blogs", { cache: "no-store" });
    const payload = await response.json();
    setBlogs(payload.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  function updateForm(key: keyof Blog, value: string | boolean | string[]) {
    setForm((current) => {
      if (key === "title" && !current.id && !current.slug) {
        return { ...current, title: String(value), slug: slugify(String(value)) };
      }

      return { ...current, [key]: value };
    });
  }

  async function uploadImage(field: "image" | "userImage", file?: File) {
    if (!file) return;

    setMessage("");
    setUploadingField(field);

    try {
      const key = await uploadFileToS3(
        file,
        field === "image" ? "blogs" : "blog-authors",
        "key"
      );
      updateForm(field, key);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/blogs", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || slugify(form.title) }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(payload.msg ?? "Failed to save blog");
      return;
    }

    setMessage(form.id ? "Blog updated successfully." : "Blog created successfully.");
    setForm({ ...emptyBlog, date: today() });
    await loadBlogs();
  }

  async function handleDelete(blog: Blog) {
    if (!blog.id) return;
    const confirmed = window.confirm(`Delete blog "${blog.title}"?`);
    if (!confirmed) return;

    const response = await fetch("/api/admin/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blog.id }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.msg ?? "Failed to delete blog");
      return;
    }

    setMessage("Blog deleted successfully.");
    await loadBlogs();
  }

  function editBlog(blog: Blog) {
    setForm({
      ...emptyBlog,
      ...blog,
      title: blog.title ?? "",
      metaDescription: blog.metaDescription ?? "",
      blogCategory: blog.blogCategory ?? "",
      image: blog.image ?? "",
      tags: blog.tags ?? [],
      date: blog.date || today(),
      data: blog.data ?? "",
      userImage: blog.userImage ?? "",
      userName: blog.userName ?? "",
      slug: blog.slug ?? "",
      isVisible: blog.isVisible ?? true,
    });
    setMessage("");
  }

  return (
    <main className="w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Blog</h1>
          <p className="text-sm text-muted-foreground">
            Create and publish articles using the existing blog schema.
          </p>
        </div>
        <Button type="button" onClick={() => setForm({ ...emptyBlog, date: today() })}>
          <Plus size={16} />
          New Blog
        </Button>
      </div>

      <section className="grid grid-cols-1 2xl:grid-cols-[520px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="border bg-card p-5 space-y-5 h-fit">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-medium">{formTitle}</p>
              <p className="text-xs text-muted-foreground">
                Blog images are uploaded to S3 and saved as object keys.
              </p>
            </div>
            <Badge variant={form.isVisible ? "default" : "secondary"}>
              {form.isVisible ? "Visible" : "Hidden"}
            </Badge>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => updateForm("title", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(e) => updateForm("slug", slugify(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => updateForm("date", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.blogCategory}
                onChange={(e) => updateForm("blogCategory", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.userName}
                onChange={(e) => updateForm("userName", e.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={form.metaDescription}
                onChange={(e) => updateForm("metaDescription", e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={tagString(form.tags)}
                onChange={(e) => updateForm("tags", parseTags(e.target.value))}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadField
              id="blogImage"
              label="Blog Image"
              value={form.image}
              uploading={uploadingField === "image"}
              onUpload={(file) => uploadImage("image", file)}
              onValueChange={(value) => updateForm("image", value)}
            />
            <ImageUploadField
              id="authorImage"
              label="Author Image"
              value={form.userImage}
              uploading={uploadingField === "userImage"}
              onUpload={(file) => uploadImage("userImage", file)}
              onValueChange={(value) => updateForm("userImage", value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Content</Label>
            <Editor value={form.data} fieldChange={(value) => updateForm("data", value)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(e) => updateForm("isVisible", e.target.checked)}
            />
            Publish on website
          </label>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button type="submit" disabled={saving || Boolean(uploadingField)} className="w-full">
            <Save size={16} />
            {saving ? "Saving..." : form.id ? "Update Blog" : "Create Blog"}
          </Button>
        </form>

        <div className="border bg-card overflow-x-auto h-fit">
          {loading ? (
            <p className="p-6 text-sm text-muted-foreground">Loading blogs...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Image Key</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {blogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                      No blogs yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  blogs.map((blog) => (
                    <TableRow key={blog.id ?? blog.slug}>
                      <TableCell className="min-w-[220px] font-medium">{blog.title}</TableCell>
                      <TableCell>{blog.blogCategory || "-"}</TableCell>
                      <TableCell>{blog.date || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={blog.isVisible ? "default" : "secondary"}>
                          {blog.isVisible ? (
                            <>
                              <Eye size={12} />
                              Visible
                            </>
                          ) : (
                            <>
                              <EyeOff size={12} />
                              Hidden
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[240px] truncate text-xs text-muted-foreground">
                        {blog.image || "-"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => editBlog(blog)}>
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(blog)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </section>
    </main>
  );
}

function ImageUploadField({
  id,
  label,
  value,
  uploading,
  onUpload,
  onValueChange,
}: {
  id: string;
  label: string;
  value: string;
  uploading: boolean;
  onUpload: (file?: File) => void;
  onValueChange: (value: string) => void;
}) {
  const previewUrl = getImagePreviewUrl(value);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="file"
          accept="image/*"
          onChange={(e) => onUpload(e.target.files?.[0])}
          disabled={uploading}
        />
        <Button type="button" variant="outline" disabled={uploading} asChild>
          <label htmlFor={id} className="cursor-pointer">
            <ImagePlus size={16} />
          </label>
        </Button>
      </div>
      <Input
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="S3 object key"
      />
      {previewUrl && (
        <img
          src={previewUrl}
          alt=""
          className="h-28 w-full rounded-md border object-cover"
        />
      )}
      {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
    </div>
  );
}
