"use client";
import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import type { Dossier as DossierData } from "@/lib/account/types";
import {
  AccountState,
  accountAction,
  accountRequest,
  useAccount,
} from "./shared";
export default function Dossier({
  onMeasurements,
  onSaved,
}: {
  onMeasurements: () => void;
  onSaved: (name: string) => void;
}) {
  const state = useAccount<DossierData>("profile");
  const [draft, setDraft] = useState<DossierData | null>(null);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (state.data) setDraft(state.data);
  }, [state.data]);
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const profile = await accountRequest<DossierData>("profile", draft);
      state.setData(profile);
      onSaved(profile.name || "Friend");
      toast.success("Profile updated.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSaving(false);
    }
  }
  const fields = [
    draft?.name,
    draft?.number,
    draft?.dateOfBirth,
    draft?.preferredTopSize,
    draft?.preferredBottomSize,
    draft?.preferredBlouseSize,
  ];
  const percent = Math.round(
    (fields.filter((value) => value?.trim()).length / 6) * 100,
  );
  return (
    <AccountState {...state} retry={state.reload}>
      {draft && (
        <form onSubmit={save} className="max-w-2xl space-y-6">
          <div className="bg-card border p-6 md:p-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Client Dossier
            </p>
            <h2 className="font-heading text-2xl md:text-3xl mt-1">
              {draft.name?.trim() || "Your profile"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{draft.email}</p>
            <div className="mt-5">
              <div className="flex justify-between mb-1.5 text-[10px] uppercase tracking-[0.2em]">
                <p className="text-muted-foreground">Dossier completeness</p>
                <p className="text-gold">{percent}%</p>
              </div>
              <div
                role="progressbar"
                aria-label="Dossier completeness"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                className="h-1 bg-muted"
              >
                <div
                  className="h-1 bg-gold transition-all"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>
          <fieldset disabled={saving} className="contents">
            <div className="bg-card border p-6 md:p-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
                Identity
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                How the atelier addresses you and reaches you.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {(
                  [
                    ["name", "Full name", "text"],
                    ["number", "Phone", "tel"],
                    ["dateOfBirth", "Date of birth", "date"],
                  ] as const
                ).map(([field, label, type]) => (
                  <div key={field}>
                    <Label
                      htmlFor={`dossier-${field}`}
                      className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5"
                    >
                      {label}
                    </Label>
                    <Input
                      id={`dossier-${field}`}
                      type={type}
                      required={field === "name"}
                      maxLength={120}
                      value={draft[field] ?? ""}
                      onChange={(event) =>
                        setDraft({ ...draft, [field]: event.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-card border p-6 md:p-8">
              <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
                Fit Preferences
              </p>
              <p className="text-xs text-muted-foreground mb-5">
                Your house sizes, so every recommendation begins closer to you.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                {(
                  [
                    ["preferredTopSize", "Top size", "e.g. S"],
                    ["preferredBottomSize", "Bottom size", "e.g. M"],
                    ["preferredBlouseSize", "Blouse size", "e.g. 34"],
                  ] as const
                ).map(([field, label, placeholder]) => (
                  <div key={field}>
                    <Label
                      htmlFor={`dossier-${field}`}
                      className="block text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1.5"
                    >
                      {label}
                    </Label>
                    <Input
                      id={`dossier-${field}`}
                      maxLength={20}
                      placeholder={placeholder}
                      value={draft[field]}
                      onChange={(event) =>
                        setDraft({ ...draft, [field]: event.target.value })
                      }
                    />
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={onMeasurements}
                className="mt-5 text-[11px] uppercase tracking-[0.2em] text-primary border-b border-gold/60 pb-0.5 hover:text-gold"
              >
                Refine full measurements →
              </button>
            </div>
            <button
              type="submit"
              className={`${accountAction} w-full md:w-auto px-10 py-3.5 tracking-[0.25em]`}
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}
              Save to the Atelier
            </button>
          </fieldset>
        </form>
      )}
    </AccountState>
  );
}
