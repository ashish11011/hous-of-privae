"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type DeleteBlogButtonProps = {
  id: string;
  title?: string | null;
};

export function DeleteBlogButton({ id, title }: DeleteBlogButtonProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(`Delete blog "${title || "Untitled"}"?`);
    if (!confirmed) return;

    setDeleting(true);
    const response = await fetch("/api/admin/blogs", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleting(false);

    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      window.alert(payload.msg ?? "Failed to delete blog.");
      return;
    }

    router.refresh();
  }

  return (
    <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
      <Trash2 size={14} />
      {deleting ? "Deleting..." : "Delete"}
    </Button>
  );
}
