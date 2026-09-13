"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Save } from "lucide-react";
import { BlogRecord } from "@/lib/blogHelper";
import { getImagePreviewUrl } from "@/lib/blogImage";
import { uploadFileToS3 } from "@/lib/s3-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlogContent } from "@/components/blog/BlogContent";
import { BlogRichTextEditor } from "./BlogRichTextEditor";

type BlogFormState = {
  id?: string;
  title: string;
  metaDescription: string;
  blogCategory: string;
  image: string;
  tags: string;
  date: string;
  data: string;
  userImage: string;
  userName: string;
  slug: string;
  isVisible: boolean;
};

type BlogFormProps = {
  blog?: BlogRecord | null;
};

const today = () => new Date().toISOString().slice(0, 10);

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function toFormState(blog?: BlogRecord | null): BlogFormState {
  return {
    id: blog?.id,
    title: blog?.title ?? "",
    metaDescription: blog?.metaDescription ?? "",
    blogCategory: blog?.blogCategory ?? "",
    image: blog?.image ?? "",
    tags: blog?.tags?.join(", ") ?? "",
    date: blog?.date || today(),
    data: blog?.data ?? "",
    userImage: blog?.userImage ?? "",
    userName: blog?.userName ?? "",
    slug: blog?.slug ?? "",
    isVisible: blog?.isVisible ?? true,
  };
}

export function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<BlogFormState>(() => toFormState(blog));
  const [saving, setSaving] = useState(false);
  const [uploadingField, setUploadingField] = useState<"image" | "userImage" | null>(null);
  const [message, setMessage] = useState("");

  const pageTitle = useMemo(() => (blog?.id ? "Edit Blog" : "New Blog"), [blog?.id]);

  function updateForm<K extends keyof BlogFormState>(key: K, value: BlogFormState[K]) {
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
      const key = await uploadFileToS3(file, field === "image" ? "blogs" : "blog-authors", "key");
      updateForm(field, key);
      setMessage("Image uploaded successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploadingField(null);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    const response = await fetch("/api/admin/blogs", {
      method: form.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug: form.slug || slugify(form.title),
        tags: form.tags,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSaving(false);

    if (!response.ok) {
      setMessage(payload.msg ?? "Failed to save blog.");
      return;
    }

    router.push("/admin/blog");
    router.refresh();
  }

  return (
    <main className="w-full p-4 md:p-8">
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-2 px-0">
            <Link href="/admin/blog">
              <ArrowLeft size={16} />
              Back to blogs
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">{pageTitle}</h1>
          <p className="text-sm text-muted-foreground">
            Write once here; the preview below uses the same reader customers see.
          </p>
        </div>
        <Button form="blog-form" type="submit" disabled={saving || Boolean(uploadingField)}>
          <Save size={16} />
          {saving ? "Saving..." : "Save Blog"}
        </Button>
      </div>

      <form id="blog-form" onSubmit={handleSubmit} className="grid gap-6 xl:grid-cols-[minmax(0,720px)_minmax(360px,1fr)]">
        <section className="space-y-5 border bg-card p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => updateForm("title", event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={form.slug}
                onChange={(event) => updateForm("slug", slugify(event.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(event) => updateForm("date", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={form.blogCategory}
                onChange={(event) => updateForm("blogCategory", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input
                id="author"
                value={form.userName}
                onChange={(event) => updateForm("userName", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="metaDescription">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={form.metaDescription}
                onChange={(event) => updateForm("metaDescription", event.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={form.tags}
                onChange={(event) => updateForm("tags", event.target.value)}
                placeholder="Craft, Styling, Occasion"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ImageUploadField
              id="blogImage"
              label="Cover Image"
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
            <Label>Blog Content</Label>
            <BlogRichTextEditor value={form.data} onChange={(value) => updateForm("data", value)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isVisible}
              onChange={(event) => updateForm("isVisible", event.target.checked)}
            />
            Publish on website
          </label>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </section>

        <aside className="space-y-4">
          <div className="border bg-card p-5">
            <p className="text-sm font-medium">Customer Preview</p>
            <p className="mb-4 text-xs text-muted-foreground">This is the same rich text rendering used on the blog page.</p>
            {form.image && (
              <img
                src={getImagePreviewUrl(form.image)}
                alt=""
                className="mb-5 aspect-[16/9] w-full object-cover"
              />
            )}
            <p className="eyebrow mb-3">{form.blogCategory || "Blog"}</p>
            <h2 className="font-heading text-3xl">{form.title || "Untitled Blog"}</h2>
            {form.metaDescription && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{form.metaDescription}</p>
            )}
            <div className="mt-6 border-t pt-5">
              <BlogContent markdown={form.data || "Start writing to preview the blog content."} />
            </div>
          </div>
        </aside>
      </form>
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
          onChange={(event) => onUpload(event.target.files?.[0])}
          disabled={uploading}
        />
        <Button type="button" variant="outline" size="icon" disabled={uploading} asChild>
          <label htmlFor={id} className="cursor-pointer">
            <ImagePlus size={16} />
          </label>
        </Button>
      </div>
      <Input
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="S3 object key"
      />
      {previewUrl && <img src={previewUrl} alt="" className="h-32 w-full border object-cover" />}
      {uploading && <p className="text-xs text-muted-foreground">Uploading...</p>}
    </div>
  );
}
