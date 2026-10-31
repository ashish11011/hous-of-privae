"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, Edit2, Plus, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileToS3 } from "@/lib/s3-upload";
import { collectionSlug, type CollectionInput } from "@/lib/collectionValidation";

type Collection = CollectionInput & { id: string; productCount: number };
type Product = { id: string; name: string | null; sku: string | null; image: string; slug: string };
const emptyCollection: CollectionInput = { name: "", slug: "", image: "", label: "", tagline: "", description: "", isActive: true, isComingSoon: false, sortOrder: 0, productIds: [] };

export default function CollectionsAdminPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<CollectionInput>(emptyCollection);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/collections", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to load collections");
      setCollections(payload.data);
      setProducts(payload.products);
      setReady(true);
    } catch (error) { setReady(false); setMessage(error instanceof Error ? error.message : "Unable to load collections"); }
    finally { setLoading(false); }
  }

  useEffect(() => { void load(); }, []);

  function reset() { setForm(emptyCollection); setSearch(""); }
  function update<K extends keyof CollectionInput>(key: K, value: CollectionInput[K]) {
    setForm(current => ({ ...current, [key]: value }));
  }
  function toggleProduct(id: string) {
    setForm(current => ({ ...current, productIds: current.productIds.includes(id) ? current.productIds.filter(value => value !== id) : [...current.productIds, id] }));
  }
  function moveProduct(index: number, direction: number) {
    const ids = [...form.productIds];
    [ids[index], ids[index + direction]] = [ids[index + direction], ids[index]];
    update("productIds", ids);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/collections", { method: form.id ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, slug: form.slug || collectionSlug(form.name) }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to save collection");
      setMessage(form.id ? "Collection updated." : "Collection created.");
      reset(); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to save collection"); }
    finally { setSaving(false); }
  }

  async function remove(item: Collection) {
    if (!window.confirm(`Delete collection “${item.name}”? Its products will remain in the store.`)) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/collections", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: item.id }) });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to delete collection");
      if (form.id === item.id) reset();
      setMessage("Collection deleted. Products were kept."); await load();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to delete collection"); }
    finally { setSaving(false); }
  }

  const filteredProducts = products.filter(item => `${item.name ?? ""} ${item.sku ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const selectedProducts = form.productIds.map(id => products.find(item => item.id === id)).filter((item): item is Product => Boolean(item));

  return (
    <main className="w-full min-w-0 p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div><h1 className="text-2xl font-semibold">Collections</h1><p className="text-sm text-muted-foreground">Create chapters of the house and choose the pieces in each one.</p></div>
        <div className="flex gap-3"><Button asChild variant="outline"><Link href="/collection">View storefront</Link></Button><Button disabled={!ready || loading || saving || uploading} onClick={reset}><Plus size={16} /> Add Collection</Button></div>
      </div>
      {message && <p role="status" className="border p-3 text-sm bg-muted">{message}</p>}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 items-start">
        <form onSubmit={save} className="border bg-card p-5 space-y-5">
          <h2 className="text-lg font-medium">{form.id ? "Edit Collection" : "Add Collection"}</h2>
          <fieldset disabled={!ready || saving || uploading || loading} className="space-y-5 disabled:opacity-60">
            <div className="space-y-2"><Label htmlFor="collection-name">Name</Label><Input id="collection-name" required maxLength={120} value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value, slug: !current.id && current.slug === collectionSlug(current.name) ? collectionSlug(e.target.value) : current.slug }))} /></div>
            <div className="space-y-2"><Label htmlFor="collection-slug">URL slug</Label><Input id="collection-slug" required maxLength={140} pattern="[a-z0-9]+(-[a-z0-9]+)*" value={form.slug} onChange={e => update("slug", e.target.value)} placeholder="aarambh" /><p className="text-xs text-muted-foreground">/collection/{form.slug || "your-collection"}</p></div>
            <div className="space-y-2">
              <Label htmlFor="collection-image">Cover image</Label>
              {form.image && <img src={form.image} alt="Collection cover preview" className="w-full aspect-[8/5] object-cover border" />}
              <Input id="collection-image" type="url" required value={form.image} onChange={e => update("image", e.target.value)} placeholder="https://… or upload below" />
              <label className="flex items-center gap-2 border border-dashed p-3 cursor-pointer text-sm"><Upload size={16} />{uploading ? "Uploading…" : "Upload cover image"}<input type="file" accept="image/*" className="sr-only" disabled={uploading || saving} onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                setUploading(true); setMessage("");
                try { update("image", await uploadFileToS3(file, "collections")); }
                catch { setMessage("Cover upload failed. Please try again."); }
                finally { setUploading(false); }
              }} /></label>
            </div>
            <div className="space-y-2"><Label htmlFor="collection-label">Image label</Label><Input id="collection-label" value={form.label} maxLength={120} onChange={e => update("label", e.target.value)} placeholder="Summer 2026 / Next Chapter" /></div>
            <div className="space-y-2"><Label htmlFor="collection-tagline">Tagline</Label><Input id="collection-tagline" value={form.tagline} maxLength={240} onChange={e => update("tagline", e.target.value)} placeholder="The beginning — our debut collection" /></div>
            <div className="space-y-2"><Label htmlFor="collection-description">Description</Label><Textarea id="collection-description" value={form.description} maxLength={5000} onChange={e => update("description", e.target.value)} rows={3} /></div>
            <div className="space-y-2"><Label htmlFor="collection-order">Display order</Label><Input id="collection-order" type="number" min={0} max={100000} required value={form.sortOrder} onChange={e => update("sortOrder", Number(e.target.value))} /><p className="text-xs text-muted-foreground">Lower numbers appear first in the menu and collection archive.</p></div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={e => update("isActive", e.target.checked)} />Visible on storefront and navbar</label>
            <div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.isComingSoon} onChange={e => update("isComingSoon", e.target.checked)} />Coming soon</label><p className="text-xs text-muted-foreground mt-1">Shown with “Coming soon” on the collections page and hidden from the navbar. Its card cannot open, and its page is unavailable even through a direct link.</p></div>
            <div className="space-y-3">
              <h3 className="font-medium">Products ({form.productIds.length} selected)</h3>
              <p className="text-xs text-muted-foreground">Products can belong to multiple collections. Use the arrows to arrange selected pieces.</p>
              {selectedProducts.length > 0 && <ol className="border divide-y max-h-64 overflow-auto">{selectedProducts.map((item, index) => <li key={item.id} className="flex items-center gap-2 p-2 text-sm"><span className="flex-1 truncate">{item.name || item.slug}</span><Button type="button" variant="ghost" size="sm" aria-label={`Move ${item.name} up`} disabled={index === 0} onClick={() => moveProduct(index, -1)}><ArrowUp size={14} /></Button><Button type="button" variant="ghost" size="sm" aria-label={`Move ${item.name} down`} disabled={index === selectedProducts.length - 1} onClick={() => moveProduct(index, 1)}><ArrowDown size={14} /></Button><Button type="button" variant="ghost" size="sm" aria-label={`Remove ${item.name}`} onClick={() => toggleProduct(item.id)}><Trash2 size={14} /></Button></li>)}</ol>}
              <Input type="search" aria-label="Search products" placeholder="Search by product name or SKU" value={search} onChange={e => setSearch(e.target.value)} />
              <div className="border divide-y max-h-80 overflow-y-auto">{filteredProducts.map(item => <label key={item.id} className="flex items-center gap-3 p-3 cursor-pointer hover:bg-muted"><input type="checkbox" checked={form.productIds.includes(item.id)} onChange={() => toggleProduct(item.id)} />{item.image && <img src={item.image} alt="" className="w-10 h-14 object-cover" />}<span className="text-sm"><span className="block">{item.name || item.slug}</span><span className="text-xs text-muted-foreground">{item.sku}</span></span></label>)}{!filteredProducts.length && <p className="p-4 text-sm text-muted-foreground">No products found.</p>}</div>
            </div>
            <Button type="submit" className="w-full">{saving ? "Saving…" : form.id ? "Update Collection" : "Create Collection"}</Button>
          </fieldset>
        </form>
        <section className="space-y-4" aria-label="Existing collections">
          {loading ? <p role="status">Loading collections…</p> : !ready ? <div className="border p-6 space-y-3"><p className="text-sm text-muted-foreground">Collections could not be loaded. Resolve the message above, then try again.</p><Button type="button" variant="outline" onClick={() => { setMessage(""); void load(); }}>Retry</Button></div> : !collections.length ? <div className="border p-8 text-center text-muted-foreground">No collections yet. Create your first collection to show it in the storefront.</div> : collections.map(item => <article key={item.id} className="border bg-card p-4 flex gap-4">
            <img src={item.image} alt="" className="w-24 h-32 object-cover shrink-0" />
            <div className="min-w-0 flex-1 space-y-2"><h2 className="font-medium">{item.name}</h2><p className="text-xs text-muted-foreground break-all">/collection/{item.slug}</p><p className="text-sm">{item.productCount} pieces · {item.isActive ? item.isComingSoon ? "Coming soon" : "Live" : "Hidden"}</p><p className="text-xs text-muted-foreground">Display order: {item.sortOrder}</p><div className="flex flex-wrap gap-2"><Button type="button" size="sm" variant="outline" disabled={saving || uploading} onClick={() => { setForm({ ...item }); setSearch(""); setMessage(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}><Edit2 size={14} /> Edit</Button><Button type="button" size="sm" variant="destructive" disabled={saving || uploading} onClick={() => remove(item)}><Trash2 size={14} /> Delete</Button>{item.isActive && !item.isComingSoon && <Button asChild size="sm" variant="outline"><Link href={`/collection/${item.slug}`}>View</Link></Button>}</div></div>
          </article>)}
        </section>
      </div>
    </main>
  );
}
