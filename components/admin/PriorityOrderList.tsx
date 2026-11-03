"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type OrderableItem = { id: string; name: string | null; slug: string };

export function PriorityOrderList({ items, priorities, onReorder, onRemove, disabled }: {
  items: OrderableItem[];
  priorities: Record<string, number>;
  onReorder: (ids: string[]) => void;
  onRemove?: (id: string) => void;
  disabled?: boolean;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);

  function move(id: string, target: number) {
    const ids = items.map(item => item.id);
    const from = ids.indexOf(id);
    if (disabled || from < 0 || from === target || target < 0 || target >= ids.length) return;
    ids.splice(from, 1);
    ids.splice(target, 0, id);
    onReorder(ids);
  }

  function clearDrag() {
    setDraggedId(null);
    setTargetId(null);
  }

  return (
    <ol className="max-h-80 divide-y overflow-auto border">
      {items.map((item, index) => {
        const name = item.name || item.slug;
        return (
          <li key={item.id} className={`flex items-center gap-2 p-2 text-sm ${targetId === item.id ? "bg-muted" : ""}`}
            onDragOver={event => {
              if (!draggedId || disabled) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = "move";
              setTargetId(item.id);
            }}
            onDrop={event => {
              event.preventDefault();
              if (draggedId) move(draggedId, index);
              clearDrag();
            }}>
            <span draggable={!disabled} title="Drag to reorder" className="cursor-grab p-1 text-muted-foreground"
              onDragStart={event => {
                event.dataTransfer.setData("text/plain", item.id);
                event.dataTransfer.effectAllowed = "move";
                setDraggedId(item.id);
              }}
              onDragEnd={clearDrag}>
              <GripVertical size={16} aria-hidden />
            </span>
            <span className="min-w-0 flex-1 truncate" title={name}>{name}</span>
            <span className="shrink-0 text-xs text-muted-foreground">Priority {priorities[item.id] ?? 1}</span>
            <Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} up`} disabled={disabled || index === 0} onClick={() => move(item.id, index - 1)}><ArrowUp size={14} /></Button>
            <Button type="button" variant="ghost" size="icon" aria-label={`Move ${name} down`} disabled={disabled || index === items.length - 1} onClick={() => move(item.id, index + 1)}><ArrowDown size={14} /></Button>
            {onRemove && <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${name}`} disabled={disabled} onClick={() => onRemove(item.id)}><Trash2 size={14} /></Button>}
          </li>
        );
      })}
    </ol>
  );
}

export function prioritiesFromOrder(ids: string[]) {
  return Object.fromEntries(ids.map((id, index) => [id, ids.length - index]));
}
