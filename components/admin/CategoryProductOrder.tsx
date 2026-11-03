"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PriorityOrderList, prioritiesFromOrder, type OrderableItem } from "./PriorityOrderList";

export function CategoryProductOrder({ id, name, onClose }: { id: string; name: string; onClose: () => void }) {
  const [products, setProducts] = useState<OrderableItem[]>([]);
  const [priorities, setPriorities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/admin/categories/products?id=${id}`, { signal: controller.signal });
        const payload = await response.json();
        if (!response.ok) throw new Error(payload.msg || "Unable to load products.");
        const rows: (OrderableItem & { priority: number })[] = payload.products;
        setProducts(rows);
        setPriorities(Object.fromEntries(rows.map(item => [item.id, item.priority])));
      } catch (error) {
        if (!controller.signal.aborted) setMessage(error instanceof Error ? error.message : "Unable to load products.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [id]);

  function reorder(ids: string[]) {
    const byId = new Map(products.map(item => [item.id, item]));
    setProducts(ids.map(id => byId.get(id)!));
    setPriorities(prioritiesFromOrder(ids));
    setDirty(true);
    setMessage("");
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/categories/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, productIds: products.map(item => item.id) }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.msg || "Unable to save product order.");
      setDirty(false);
      setMessage("Product order saved.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save product order.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="space-y-3 border bg-card p-5" aria-label="Category product order">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-medium">Product order for {name}</h2>
        <Button type="button" variant="outline" disabled={saving} onClick={onClose}>Close</Button>
      </div>
      <p className="text-xs text-muted-foreground">Drag products or use the arrows to arrange them. Higher priorities appear first.</p>
      {loading ? <p role="status">Loading products…</p> : products.length > 0 ? (
        <PriorityOrderList items={products} priorities={priorities} onReorder={reorder} disabled={saving} />
      ) : !message && <p>No products are assigned to this category.</p>}
      {message && <p role="status" className="text-sm">{message}</p>}
      <Button type="button" disabled={!dirty || saving} onClick={save}>{saving ? "Saving…" : "Save Product Order"}</Button>
    </section>
  );
}
