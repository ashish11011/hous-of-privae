"use client";

import { useState } from "react";
import { Check, Loader2, MapPin, Ruler } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function PrivaeFitForm() {
  const [mode, setMode] = useState<"measure" | "studio">("measure");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    unit: "in",
    contact: "",
    chest: "",
    underbust: "",
    waist: "",
    hips: "",
    shoulderLength: "",
    bottomLength: "",
    additional: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await fetch("/api/tailored-fit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl border border-border bg-card p-8 text-center">
        <Check className="mx-auto mb-5 text-gold" size={36} strokeWidth={1.4} />
        <h2 className="font-heading text-3xl mb-3">Fit Request Received</h2>
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          The atelier team will confirm your measurements or studio appointment shortly.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="grid grid-cols-2 border border-border mb-8">
        <button type="button" onClick={() => setMode("measure")} className={`p-4 text-left ${mode === "measure" ? "bg-card" : "bg-background"}`}>
          <Ruler size={18} className="mb-2 text-gold" />
          <p className="text-xs uppercase tracking-[0.18em]">Provide Measurements</p>
        </button>
        <button type="button" onClick={() => setMode("studio")} className={`p-4 text-left border-l border-border ${mode === "studio" ? "bg-card" : "bg-background"}`}>
          <MapPin size={18} className="mb-2 text-gold" />
          <p className="text-xs uppercase tracking-[0.18em]">Visit The Studio</p>
        </button>
      </div>

      {mode === "studio" ? (
        <div className="border border-border bg-card p-8 text-center">
          <p className="eyebrow mb-3">The Privae Studio</p>
          <h2 className="font-heading text-3xl mb-4">Jaipur, By Appointment</h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed">
            Share your preferred date on WhatsApp and our stylist will confirm a private fitting slot.
          </p>
          <a href="https://wa.me/917023117408" className="mt-7 inline-flex bg-primary text-primary-foreground px-8 py-3 text-xs uppercase tracking-[0.2em]">
            Request Appointment
          </a>
        </div>
      ) : (
        <form onSubmit={submit} className="border border-border bg-card p-5 md:p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FitInput label="Contact Number" value={form.contact} onChange={(value) => update("contact", value)} required />
            <FitInput label="Chest" value={form.chest} onChange={(value) => update("chest", value)} />
            <FitInput label="Underbust" value={form.underbust} onChange={(value) => update("underbust", value)} />
            <FitInput label="Waist" value={form.waist} onChange={(value) => update("waist", value)} />
            <FitInput label="Hips" value={form.hips} onChange={(value) => update("hips", value)} />
            <FitInput label="Shoulder Length" value={form.shoulderLength} onChange={(value) => update("shoulderLength", value)} />
            <FitInput label="Bottom Length" value={form.bottomLength} onChange={(value) => update("bottomLength", value)} />
            <label>
              <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Unit</span>
              <select value={form.unit} onChange={(e) => update("unit", e.target.value)} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm">
                <option value="in">Inches</option>
                <option value="cm">Centimetres</option>
              </select>
            </label>
          </div>
          <label className="block">
            <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Additional Notes</span>
            <Textarea value={form.additional} onChange={(e) => update("additional", e.target.value)} rows={4} className="rounded-none bg-background" />
          </label>
          <Button disabled={loading} className="w-full rounded-none h-12 tracking-[0.2em] uppercase text-xs">
            {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
            Submit Measurements
          </Button>
        </form>
      )}
    </div>
  );
}

function FitInput({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label>
      <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      <Input value={value} onChange={(e) => onChange(e.target.value)} required={required} className="rounded-none bg-background" />
    </label>
  );
}
