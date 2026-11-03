"use client";

import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2, Upload } from "lucide-react";
import { uploadFileToS3 } from "@/lib/s3-upload";
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
import { PriorityOrderList, prioritiesFromOrder, type OrderableItem } from "@/components/admin/PriorityOrderList";
import { CategoryProductOrder } from "@/components/admin/CategoryProductOrder";
import { Textarea } from "@/components/ui/textarea";

type Category = {
  id?: string;
  name: string;
  slug: string;
  image: string;
  tagline: string;
  level: number;
  parentId: string;
  isActive: boolean;
};

const emptyCategory: Category = {
  name: "",
  slug: "",
  image: "",
  tagline: "",
  level: 1,
  parentId: "",
  isActive: true,
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

export default function CategoriesAdminPage() {
  const [orderCategory, setOrderCategory] = useState<{ id: string; name: string } | null>(null);
  const [categoryOrder, setCategoryOrder] = useState<(OrderableItem & { priority: number })[] | null>(null);
  const [orderDirty, setOrderDirty] = useState(false);
  const [orderBusy, setOrderBusy] = useState(false);
  const [orderMessage, setOrderMessage] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(emptyCategory);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [uploading, setUploading] = useState(false);



  async function loadCategories() {
    setLoading(true);
    const response = await fetch("/api/admin/categories", { cache: "no-store" });
    const payload = await response.json();
    setCategories(payload.data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    void loadCategories();
    void loadCategoryOrder();
  }, []);

  async function loadCategoryOrder() {
    setOrderBusy(true);
    setOrderMessage("");
    try {
      const response = await fetch("/api/admin/categories/order", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to load category order.");
      setCategoryOrder(payload.categories);
      setOrderDirty(false);
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to load category order.");
    } finally {
      setOrderBusy(false);
    }
  }

  function reorderCategories(ids: string[]) {
    const priorities = prioritiesFromOrder(ids);
    setCategoryOrder(current => {
      const byId = new Map(current?.map(item => [item.id, item]));
      return ids.map(id => ({ ...byId.get(id)!, priority: priorities[id] }));
    });
    setOrderDirty(true);
    setOrderMessage("");
  }

  async function saveCategoryOrder() {
    if (!categoryOrder) return;
    setOrderBusy(true);
    setOrderMessage("");
    try {
      const response = await fetch("/api/admin/categories/order", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: categoryOrder.map(item => item.id) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to save category order.");
      setOrderDirty(false);
      setOrderMessage("Category order saved.");
      await loadCategories();
    } catch (error) {
      setOrderMessage(error instanceof Error ? error.message : "Unable to save category order.");
    } finally {
      setOrderBusy(false);
    }
  }

  function updateForm(key: keyof Category, value: string | number | boolean) {
    setForm((current) => {
      if (key === "name" && !current.id && !current.slug) {
        return { ...current, name: String(value), slug: slugify(String(value)) };
      }

      return { ...current, [key]: value };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const method = form.id ? "PUT" : "POST";
    const response = await fetch("/api/admin/categories", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, slug: form.slug || slugify(form.name) }),
    });

    const payload = await response.json();
    setSaving(false);

    if (!response.ok) {
      setMessage(payload.msg ?? "Failed to save category");
      return;
    }

    setMessage(form.id ? "Category updated successfully." : "Category created successfully.");
    setForm(emptyCategory);
    await Promise.all([loadCategories(), loadCategoryOrder()]);
  }

  async function handleDelete(category: Category) {
    if (!category.id) return;
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setMessage("");
    const response = await fetch("/api/admin/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: category.id }),
    });

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setMessage(payload.msg ?? "Failed to delete category");
      return;
    }

    setOrderCategory(current => current?.id === category.id ? null : current);
    setMessage("Category deleted successfully.");
    await Promise.all([loadCategories(), loadCategoryOrder()]);
  }

  return (
    <main className="w-full p-4 md:p-8 space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            Manage category options used by admin products and storefront category pages.
          </p>
        </div>
        <Button type="button" onClick={() => setForm(emptyCategory)}>
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <section className="space-y-3 border bg-card p-5" aria-labelledby="arrange-categories">
        <h2 id="arrange-categories" className="text-lg font-medium">Arrange Categories</h2>
        <p className="text-sm text-muted-foreground">
          Drag category names into the order you want them to appear on the storefront.
        </p>
        {categoryOrder?.length ? (
          <PriorityOrderList items={categoryOrder}
            priorities={Object.fromEntries(categoryOrder.map(item => [item.id, item.priority]))}
            onReorder={reorderCategories} disabled={orderBusy || saving} />
        ) : categoryOrder ? (
          <p className="text-sm">Add categories to arrange them here.</p>
        ) : !orderMessage && (
          <p role="status" className="text-sm">Loading category order…</p>
        )}
        {orderMessage && <p role="status" className="text-sm">{orderMessage}</p>}
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={!orderDirty || orderBusy || saving} onClick={saveCategoryOrder}>
            Save Category Order
          </Button>
          {orderMessage && (
            <Button type="button" variant="outline" disabled={orderBusy || saving} onClick={loadCategoryOrder}>
              Reload Category Order
            </Button>
          )}
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[380px_1fr] gap-6">
        <form onSubmit={handleSubmit} className="border bg-card p-5 space-y-4 h-fit">
          <div>
            <p className="text-lg font-medium">{form.id ? "Edit Category" : "Add Category"}</p>
            <p className="text-xs text-muted-foreground">
              Level 1 maps to product Category Level 1. Level 2 maps to product Category Level 2.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => updateForm("name", e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={form.slug} onChange={(e) => updateForm("slug", slugify(e.target.value))} required />
          </div>


          <div className="space-y-2">
            <Label>Category Image</Label>
            {form.image ? (
              <div className="relative group w-full">
                <img
                  src={form.image}
                  alt="Category"
                  className="w-full h-36 object-cover rounded-md border"
                />
                <button
                  type="button"
                  onClick={() => updateForm("image", "")}
                  className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ) : (
              <label
                className={`flex flex-col items-center justify-center gap-2 w-full h-36 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
                  uploading ? "opacity-50 pointer-events-none" : "hover:border-primary hover:bg-muted/40"
                }`}
              >
                <Upload size={20} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {uploading ? "Uploading..." : "Click to upload image"}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setUploading(true);
                    try {
                      const url = await uploadFileToS3(file, "categories");
                      updateForm("image", url);
                    } catch (err) {
                      setMessage("Image upload failed. Please try again.");
                    } finally {
                      setUploading(false);
                    }
                  }}
                />
              </label>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Textarea id="tagline" value={form.tagline ?? ""} onChange={(e) => updateForm("tagline", e.target.value)} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => updateForm("isActive", e.target.checked)}
            />
            Active
          </label>

          {message && <p className="text-sm text-muted-foreground">{message}</p>}

          <Button type="submit" disabled={saving || orderBusy} className="w-full">
            {saving ? "Saving..." : form.id ? "Update Category" : "Create Category"}
          </Button>
        </form>

        <div className="min-w-0 space-y-4">
          {orderCategory && <CategoryProductOrder key={orderCategory.id} {...orderCategory} onClose={() => setOrderCategory(null)} />}
          <div className="border bg-card overflow-x-auto">
            {loading ? (
              <p className="p-6 text-sm text-muted-foreground">Loading categories...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Slug</TableHead>

                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id ?? category.slug}>
                      <TableCell>{category.name}</TableCell>
                      <TableCell>{category.slug}</TableCell>

                      <TableCell>{category.isActive ? "Active" : "Hidden"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end gap-2">
                          {category.id?.length === 36 && (
                            <Button type="button" variant="outline" size="sm" onClick={() => setOrderCategory({ id: category.id!, name: category.name })}>
                              Arrange Products
                            </Button>
                          )}
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setForm({
                                ...emptyCategory,
                                ...category,
                                image: category.image ?? "",
                                tagline: category.tagline ?? "",
                                parentId: category.parentId ?? "",
                              })
                            }
                          >
                            <Edit2 size={14} />
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={orderBusy || !category.id || category.id.length !== 36}
                            onClick={() => handleDelete(category)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
