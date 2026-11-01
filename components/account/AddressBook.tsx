"use client";
import { useState } from "react";
import { Pencil, Plus, Save, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  AccountState,
  accountAction,
  accountRequest,
  useAccount,
} from "./shared";
import type { Address } from "@/lib/account/types";
const blank = {
  label: "",
  recipientName: "",
  phone: "",
  line1: "",
  line2: "",
  city: "",
  state: "",
  pincode: "",
  country: "India",
  isDefault: false,
};
export default function AddressBook({
  onChange,
}: {
  onChange: (count: number) => void;
}) {
  const state = useAccount<Address[]>("addresses");
  const [editing, setEditing] = useState<Partial<Address> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setSaveError("");
    try {
      const saved = await accountRequest<Address>("addresses", editing);
      setEditing(saved);
      const list = await state.reload({ throwOnError: true });
      if (
        !list?.some(
          (address) =>
            address.id === saved.id && address.updatedAt === saved.updatedAt,
        )
      )
        throw new Error(
          "The saved address could not be reloaded. Please try again.",
        );
      onChange(list?.length ?? 0);
      setEditing(null);
      toast.success("Address saved.");
    } catch (error) {
      setSaveError((error as Error).message);
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  async function remove(id: string) {
    setSaving(true);
    try {
      await accountRequest("addresses", { id }, "DELETE");
      const list = await state.reload({ throwOnError: true });
      onChange(list?.length ?? 0);
      toast.success("Address removed.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  return (
    <AccountState {...state} retry={state.reload}>
      <div className="space-y-4">
        {saveError && (
          <p role="alert" className="text-sm text-destructive">
            {saveError}
          </p>
        )}
        {!editing && (
          <button
            type="button"
            onClick={() =>
              setEditing({ ...blank, isDefault: !state.data?.length })
            }
            className={accountAction}
          >
            <Plus size={14} />
            Add Address
          </button>
        )}
        {editing && (
          <form
            onSubmit={save}
            className="bg-card p-5 grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <fieldset disabled={saving} className="contents">
              {(
                [
                  ["label", "Label (Home, Office)", false],
                  ["recipientName", "Recipient name", true],
                  ["phone", "Phone", true],
                  ["line1", "Address line 1", true],
                  ["line2", "Address line 2", false],
                  ["city", "City", true],
                  ["state", "State", true],
                  ["pincode", "Pincode", true],
                ] as const
              ).map(([field, label, required]) => (
                <div key={field}>
                  <Label
                    htmlFor={`address-${field}`}
                    className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground mb-1"
                  >
                    {label}
                    {required ? " *" : ""}
                  </Label>
                  <Input
                    id={`address-${field}`}
                    required={required}
                    value={String(editing[field] ?? "")}
                    onChange={(event) =>
                      setEditing({ ...editing, [field]: event.target.value })
                    }
                    maxLength={field === "pincode" ? 6 : 300}
                    inputMode={
                      field === "pincode" || field === "phone"
                        ? "numeric"
                        : undefined
                    }
                  />
                </div>
              ))}
              <label className="md:col-span-2 flex gap-2 items-center text-xs">
                <input
                  type="checkbox"
                  checked={editing.isDefault ?? false}
                  onChange={(event) =>
                    setEditing({ ...editing, isDefault: event.target.checked })
                  }
                />
                Use as default delivery address
              </label>
              <div className="md:col-span-2 flex gap-2 pt-2">
                <button type="submit" className={accountAction}>
                  <Save size={14} />
                  {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="border px-5 py-2.5 text-xs uppercase tracking-widest"
                >
                  Cancel
                </button>
              </div>
            </fieldset>
          </form>
        )}
        {!state.data?.length && !editing && (
          <p className="text-sm text-muted-foreground">
            No addresses saved yet.
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-4">
          {state.data?.map((address) => (
            <article
              key={address.id}
              className="bg-card p-5 flex justify-between gap-3"
            >
              <div className="text-sm">
                <p className="font-medium">
                  {address.label || address.recipientName}
                  {address.isDefault && (
                    <span className="ml-2 text-[10px] bg-primary text-white px-1.5 py-0.5 uppercase tracking-wider">
                      Default
                    </span>
                  )}
                </p>
                <p className="mt-1">
                  {address.recipientName} · {address.phone}
                </p>
                <p className="text-muted-foreground mt-1">
                  {address.line1}
                  {address.line2 ? `, ${address.line2}` : ""}
                </p>
                <p className="text-muted-foreground">
                  {address.city}, {address.state} — {address.pincode}
                </p>
                <p className="text-xs text-muted-foreground">
                  {address.country}
                </p>
              </div>
              <div className="flex gap-2 items-start">
                <button
                  type="button"
                  aria-label={`Edit ${address.label || address.recipientName}`}
                  disabled={saving}
                  onClick={() => setEditing(address)}
                >
                  <Pencil size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Delete ${address.label || address.recipientName}`}
                  disabled={saving}
                  onClick={() => remove(address.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AccountState>
  );
}
