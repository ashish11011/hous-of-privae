"use client";
import { useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Measurement } from "@/lib/account/types";
import { MEASUREMENT_FIELDS } from "@/lib/account/rules";
import {
  AccountState,
  accountAction,
  accountRequest,
  useAccount,
} from "./shared";
const labels: Record<(typeof MEASUREMENT_FIELDS)[number], string> = {
  bust: "Bust",
  waist: "Waist",
  hips: "Hips",
  shoulder: "Shoulder",
  sleeveLength: "Sleeve length",
  kurtaLength: "Kurta length",
  inseam: "Inseam",
  height: "Height",
};
export default function Measurements({
  onChange,
}: {
  onChange: (count: number) => void;
}) {
  const state = useAccount<Measurement[]>("measurements");
  const [editing, setEditing] = useState<Partial<Measurement> | null>(null);
  const [saving, setSaving] = useState(false);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const saved = await accountRequest<Measurement>("measurements", editing);
      setEditing(saved);
      const rows = await state.reload({ throwOnError: true });
      if (
        !rows?.some(
          (row) => row.id === saved.id && row.updatedAt === saved.updatedAt,
        )
      )
        throw new Error(
          "The saved measurements could not be reloaded. Please try again.",
        );
      onChange(rows?.length ?? 0);
      setEditing(null);
      toast.success("Measurements saved.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    setSaving(true);
    try {
      await accountRequest("measurements", { id }, "DELETE");
      const rows = await state.reload({ throwOnError: true });
      onChange(rows?.length ?? 0);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <AccountState {...state} retry={state.reload}>
      <div className="space-y-4">
        {!editing && (
          <button
            className={accountAction}
            onClick={() =>
              setEditing({ label: "My measurements", unit: "inches" })
            }
          >
            <Plus size={14} />
            Add Measurement Set
          </button>
        )}
        {editing && (
          <form
            onSubmit={save}
            className="bg-card p-5 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <div className="col-span-2 md:col-span-3">
              <Label htmlFor="measurement-label" className="text-xs">
                Label
              </Label>
              <Input
                id="measurement-label"
                required
                maxLength={100}
                value={editing.label ?? ""}
                onChange={(event) =>
                  setEditing({ ...editing, label: event.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="measurement-unit" className="text-xs">
                Unit
              </Label>
              <select
                id="measurement-unit"
                className="w-full h-9 border px-2 text-sm bg-background"
                value={editing.unit}
                onChange={(event) => {
                  const nextUnit = event.target.value as "inches" | "cm";
                  const factor = nextUnit === "cm" ? 2.54 : 1 / 2.54;
                  setEditing({
                    ...editing,
                    unit: nextUnit,
                    ...Object.fromEntries(
                      MEASUREMENT_FIELDS.map((field) => [
                        field,
                        editing[field] == null
                          ? null
                          : Math.round(Number(editing[field]) * factor * 100) /
                            100,
                      ]),
                    ),
                  });
                }}
              >
                <option value="inches">Inches</option>
                <option value="cm">Centimetres</option>
              </select>
            </div>
            {MEASUREMENT_FIELDS.map((field) => (
              <div key={field}>
                <Label
                  htmlFor={`measurement-${field}`}
                  className="text-[10px] text-muted-foreground uppercase tracking-widest"
                >
                  {labels[field]} ({editing.unit === "cm" ? "cm" : "in"})
                </Label>
                <Input
                  id={`measurement-${field}`}
                  type="number"
                  min="0.01"
                  max="500"
                  step="0.01"
                  value={editing[field] ?? ""}
                  onChange={(event) =>
                    setEditing({
                      ...editing,
                      [field]: event.target.value
                        ? Number(event.target.value)
                        : null,
                    })
                  }
                />
              </div>
            ))}
            <div className="col-span-2 md:col-span-4 flex gap-2 pt-2">
              <button type="submit" disabled={saving} className={accountAction}>
                <Save size={14} />
                {saving ? "Saving…" : "Save"}
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="border px-5 py-2.5 text-xs uppercase tracking-widest"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
        {!state.data?.length && !editing && (
          <p className="text-sm text-muted-foreground">
            No measurements saved. Save them once and reuse them for your next
            Privae Fit request.
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {state.data?.map((measurement) => (
            <article key={measurement.id} className="bg-card p-5">
              <div className="flex justify-between gap-3">
                <p className="font-medium text-sm">{measurement.label}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    aria-label={`Edit ${measurement.label}`}
                    disabled={saving}
                    onClick={() => setEditing(measurement)}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${measurement.label}`}
                    disabled={saving}
                    onClick={() => remove(measurement.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-muted-foreground">
                {MEASUREMENT_FIELDS.map(
                  (field) =>
                    measurement[field] != null && (
                      <p key={field}>
                        {labels[field]}:{" "}
                        <span className="text-foreground">
                          {measurement[field]}{" "}
                          {measurement.unit === "inches" ? "in" : "cm"}
                        </span>
                      </p>
                    ),
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </AccountState>
  );
}
