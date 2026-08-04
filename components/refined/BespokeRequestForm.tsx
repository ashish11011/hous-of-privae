"use client";

import { useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertContactDetails } from "@/lib";

const garmentTypes = ["Saree", "Lehenga", "Suit Set", "Co-ord Set", "Blouse", "Bridal Ensemble"];
const budgets = ["Below Rs 50,000", "Rs 50,000 - Rs 1,00,000", "Rs 1,00,000 - Rs 2,50,000", "Rs 2,50,000+"];

export default function BespokeRequestForm() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    garment: garmentTypes[0],
    occasion: "",
    budget: budgets[0],
    message: "",
  });

  const update = (key: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await insertContactDetails({
      name: form.name,
      email: form.email,
      phone: form.phone,
      location: "Bespoke request",
      message: [
        `Garment: ${form.garment}`,
        `Occasion: ${form.occasion || "Not specified"}`,
        `Budget: ${form.budget}`,
        form.message,
      ].join("\n"),
    });
    setLoading(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-xl border border-border bg-card p-8 text-center">
        <Check className="mx-auto mb-5 text-gold" size={36} strokeWidth={1.4} />
        <h2 className="font-heading text-3xl mb-3">Your Vision is in Our Hands</h2>
        <p className="font-body text-sm leading-relaxed text-muted-foreground">
          Our atelier has received your bespoke enquiry and will reach out within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl border border-border bg-card p-5 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Name">
          <Input value={form.name} onChange={(e) => update("name", e.target.value)} required className="rounded-none bg-background" />
        </Field>
        <Field label="Email">
          <Input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} required className="rounded-none bg-background" />
        </Field>
        <Field label="Phone">
          <Input value={form.phone} onChange={(e) => update("phone", e.target.value)} required className="rounded-none bg-background" />
        </Field>
        <Field label="Occasion">
          <Input value={form.occasion} onChange={(e) => update("occasion", e.target.value)} className="rounded-none bg-background" />
        </Field>
        <Field label="Garment Type">
          <select value={form.garment} onChange={(e) => update("garment", e.target.value)} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm">
            {garmentTypes.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
        <Field label="Budget">
          <select value={form.budget} onChange={(e) => update("budget", e.target.value)} className="w-full rounded-none border border-input bg-background px-3 py-2 text-sm">
            {budgets.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Inspiration Notes">
        <Textarea value={form.message} onChange={(e) => update("message", e.target.value)} required rows={5} className="rounded-none bg-background" />
      </Field>
      <Button disabled={loading} className="w-full rounded-none h-12 tracking-[0.2em] uppercase text-xs">
        {loading && <Loader2 size={14} className="mr-2 animate-spin" />}
        Send Bespoke Request
      </Button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
