"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Scissors,
  Sparkles,
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const GARMENT_TYPES = [
  "Saree",
  "Lehenga",
  "Anarkali / Gown",
  "Suit Set",
  "Co-ord Set",
  "Blouse Only",
  "Bridal Ensemble",
  "Other",
] as const;

const OCCASIONS = [
  "Wedding",
  "Reception / Sangeet",
  "Engagement / Roka",
  "Festive / Diwali",
  "Cocktail / Soiree",
  "Personal Wardrobe",
  "Other",
] as const;

const BUDGET_RANGES = [
  "Below Rs 50,000",
  "Rs 50,000 - Rs 1,00,000",
  "Rs 1,00,000 - Rs 2,50,000",
  "Rs 2,50,000 - Rs 5,00,000",
  "Rs 5,00,000+",
  "I'd like guidance",
] as const;

const bespokeSchema = z.object({
  garmentType: z.string().trim().min(1, "Choose a garment type"),
  occasion: z.string().trim().max(80).optional().or(z.literal("")),
  eventDate: z.string().optional().or(z.literal("")),
  budgetRange: z.string().trim().max(60).optional().or(z.literal("")),
  fabricPreference: z.string().trim().max(120).optional().or(z.literal("")),
  colorPreference: z.string().trim().max(120).optional().or(z.literal("")),
  inspirationNotes: z
    .string()
    .trim()
    .min(20, "Tell us a little more - at least 20 characters")
    .max(2000, "Please keep under 2000 characters"),
  fullName: z.string().trim().min(2, "Your name is required").max(100),
  email: z.string().trim().email("A valid email is required").max(255),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  country: z.string().trim().max(60).optional().or(z.literal("")),
});

type FormState = z.infer<typeof bespokeSchema>;

const initialForm: FormState = {
  garmentType: "",
  occasion: "",
  eventDate: "",
  budgetRange: "",
  fabricPreference: "",
  colorPreference: "",
  inspirationNotes: "",
  fullName: "",
  email: "",
  phone: "",
  country: "India",
};

const STEPS = ["Vision", "Details", "Contact", "Review"] as const;

const inputCls =
  "w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors";
const labelCls =
  "text-[11px] tracking-[0.18em] uppercase font-body text-foreground block mb-2";

export default function BespokeRequestForm() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [referenceId, setReferenceId] = useState<string | null>(null);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const canAdvance = (() => {
    if (step === 0) return form.garmentType !== "";
    if (step === 1) return form.inspirationNotes.trim().length >= 20;
    if (step === 2) {
      return (
        form.fullName.trim().length >= 2 && /^\S+@\S+\.\S+$/.test(form.email)
      );
    }
    return true;
  })();

  const next = () => {
    if (!canAdvance) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    const parsed = bespokeSchema.safeParse(form);
    if (!parsed.success) {
      toast.error(
        parsed.error.issues[0]?.message ?? "Some fields need attention."
      );
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/bespoke", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          payload.message || "Something went wrong on our end."
        );
      }

      setReferenceId(payload.referenceId ?? null);
      setSubmitted(true);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong on our end. Please try again in a moment."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="py-20 md:py-28 px-4">
        <div className="container mx-auto max-w-xl text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/15 text-gold mb-8">
            <Check size={28} strokeWidth={1.5} />
          </div>
          <p className="eyebrow mb-3">Request received</p>
          <h1 className="font-heading text-3xl md:text-5xl text-foreground mb-5 heading-rule">
            Your Vision is in Our Hands
          </h1>
          <p className="font-body text-sm md:text-base text-muted-foreground leading-relaxed mb-3">
            Thank you, {form.fullName.split(" ")[0]}. Our atelier has received
            your bespoke enquiry and a senior stylist will be in touch within{" "}
            <span className="text-foreground">24 hours</span> to begin the
            conversation.
          </p>
          {referenceId && (
            <p className="text-xs tracking-[0.2em] uppercase font-body text-muted-foreground/80 mt-6">
              Reference - {referenceId.slice(0, 8).toUpperCase()}
            </p>
          )}
          <div className="section-rule my-10" />
          <p className="font-body text-sm text-muted-foreground mb-8 leading-relaxed">
            Want to discuss in person? Book a private consultation at our Jaipur
            atelier or browse the collection while you wait.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/appointment"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors"
            >
              Book Studio Appointment
            </Link>
            <Link
              href="/collections"
              className="inline-block border border-primary text-primary px-8 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-primary hover:text-primary-foreground transition-all"
            >
              Explore Collections
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <>
      <section className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-16 md:py-24 text-center">
          <Scissors
            size={32}
            className="mx-auto text-gold mb-5"
            strokeWidth={1.25}
          />
          <p className="text-[11px] tracking-[0.3em] uppercase font-body text-gold mb-3">
            Privae Bespoke
          </p>
          <h1 className="font-heading text-4xl md:text-6xl mb-5 heading-rule">
            A Piece Made Only For You
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base font-body text-primary-foreground/85 leading-relaxed">
            One vision. One garment. Made entirely for you. Share your
            inspiration and our atelier will craft a piece that exists nowhere
            else in the world.
          </p>
          <div className="mt-8">
            <p className="text-xs font-body text-primary-foreground/70 mb-3">
              Prefer to discuss in person?
            </p>
            <Link
              href="/appointment"
              className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.2em] uppercase font-body text-gold border-b border-gold/40 hover:border-gold pb-0.5 transition-colors"
            >
              Visit Our Privae Studio in Jaipur -
            </Link>
          </div>
        </div>
      </section>

      <main className="py-14 md:py-20 px-4">
        <div className="container mx-auto max-w-2xl">
          <ol className="flex items-center justify-between mb-10 md:mb-14">
            {STEPS.map((label, idx) => {
              const active = idx === step;
              const done = idx < step;
              return (
                <li key={label} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center w-full">
                    <span
                      className={`flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-body transition-colors border ${
                        done
                          ? "bg-gold border-gold text-foreground"
                          : active
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-background border-border text-muted-foreground"
                      }`}
                      aria-current={active ? "step" : undefined}
                    >
                      {done ? <Check size={14} /> : idx + 1}
                    </span>
                    <span
                      className={`mt-2 text-[10px] tracking-[0.2em] uppercase font-body hidden sm:block ${
                        active ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {label}
                    </span>
                  </div>
                  {idx < STEPS.length - 1 && (
                    <div
                      className={`h-px flex-1 -mt-6 mx-1 sm:mx-2 ${
                        idx < step ? "bg-gold/60" : "bg-border"
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <div className="bg-card border border-border p-6 md:p-10 animate-fade-in-up">
            {step === 0 && (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Step 1 of 4</p>
                  <h2 className="font-heading text-2xl md:text-3xl text-foreground">
                    Tell Us About Your Vision
                  </h2>
                </div>

                <div>
                  <label className={labelCls}>
                    What would you like crafted?
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {GARMENT_TYPES.map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => update("garmentType", g)}
                        className={`px-3 py-3 text-xs tracking-wide font-body border transition-colors text-left ${
                          form.garmentType === g
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className={labelCls}>For what occasion?</label>
                  <select
                    value={form.occasion}
                    onChange={(e) => update("occasion", e.target.value)}
                    className={inputCls}
                  >
                    <option value="">Select an occasion (optional)</option>
                    {OCCASIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelCls}>
                    Event date (if applicable)
                  </label>
                  <input
                    type="date"
                    value={form.eventDate}
                    onChange={(e) => update("eventDate", e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                    className={inputCls}
                  />
                  <p className="text-[11px] font-body text-muted-foreground mt-2 leading-relaxed">
                    Bespoke pieces are crafted over 6-12 weeks. Earlier is
                    always better.
                  </p>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Step 2 of 4</p>
                  <h2 className="font-heading text-2xl md:text-3xl text-foreground">
                    The Finer Details
                  </h2>
                </div>

                <div>
                  <label className={labelCls}>Investment range</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {BUDGET_RANGES.map((b) => (
                      <button
                        type="button"
                        key={b}
                        onClick={() => update("budgetRange", b)}
                        className={`px-3 py-2.5 text-xs font-body border transition-colors ${
                          form.budgetRange === b
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:border-primary/50"
                        }`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>Fabric preference</label>
                    <input
                      type="text"
                      value={form.fabricPreference}
                      onChange={(e) =>
                        update("fabricPreference", e.target.value)
                      }
                      placeholder="e.g. silk organza, chanderi..."
                      className={inputCls}
                      maxLength={120}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Colour palette</label>
                    <input
                      type="text"
                      value={form.colorPreference}
                      onChange={(e) =>
                        update("colorPreference", e.target.value)
                      }
                      placeholder="e.g. ivory & gold, deep maroon..."
                      className={inputCls}
                      maxLength={120}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelCls}>
                    Tell us your story{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={form.inspirationNotes}
                    onChange={(e) => update("inspirationNotes", e.target.value)}
                    placeholder="Inspirations, references, silhouettes you love, motifs you'd like, anything we should know..."
                    className={`${inputCls} resize-none`}
                    maxLength={2000}
                  />
                  <div className="flex justify-between mt-2">
                    <p className="text-[11px] font-body text-muted-foreground">
                      Minimum 20 characters - share generously
                    </p>
                    <p className="text-[11px] font-body text-muted-foreground">
                      {form.inspirationNotes.length}/2000
                    </p>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Step 3 of 4</p>
                  <h2 className="font-heading text-2xl md:text-3xl text-foreground">
                    How May We Reach You?
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className={labelCls}>
                      Full name <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.fullName}
                      onChange={(e) => update("fullName", e.target.value)}
                      className={inputCls}
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>
                      Email <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email", e.target.value)}
                      className={inputCls}
                      maxLength={255}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Phone / WhatsApp</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="+91..."
                      className={inputCls}
                      maxLength={40}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Country</label>
                    <input
                      type="text"
                      value={form.country}
                      onChange={(e) => update("country", e.target.value)}
                      className={inputCls}
                      maxLength={60}
                    />
                  </div>
                </div>

                <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                  Your details are kept in strict confidence and used only by
                  our atelier team to discuss your commission.
                </p>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <p className="eyebrow mb-2">Step 4 of 4</p>
                  <h2 className="font-heading text-2xl md:text-3xl text-foreground">
                    Review &amp; Send
                  </h2>
                </div>

                <dl className="divide-y divide-border border border-border">
                  {[
                    ["Garment", form.garmentType],
                    ["Occasion", form.occasion || "-"],
                    ["Event date", form.eventDate || "-"],
                    ["Investment", form.budgetRange || "-"],
                    ["Fabric", form.fabricPreference || "-"],
                    ["Colour", form.colorPreference || "-"],
                    ["Notes", form.inspirationNotes],
                    ["Name", form.fullName],
                    ["Email", form.email],
                    ["Phone", form.phone || "-"],
                    ["Country", form.country || "-"],
                  ].map(([k, v]) => (
                    <div key={k} className="grid grid-cols-3 gap-4 px-4 py-3">
                      <dt className="text-[11px] tracking-[0.18em] uppercase font-body text-muted-foreground">
                        {k}
                      </dt>
                      <dd className="col-span-2 text-sm font-body text-foreground whitespace-pre-wrap break-words">
                        {v}
                      </dd>
                    </div>
                  ))}
                </dl>

                <div className="flex items-start gap-3 bg-secondary/40 border border-border p-4">
                  <Sparkles
                    size={16}
                    className="text-gold mt-0.5 shrink-0"
                    strokeWidth={1.5}
                  />
                  <p className="text-xs font-body text-muted-foreground leading-relaxed">
                    Our senior stylist will reply within 24 hours with a
                    personal note, suggested fabrics and an indicative timeline.
                    There is no obligation until you approve the design.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between mt-10 pt-6 border-t border-border">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="inline-flex items-center gap-2 text-xs tracking-[0.18em] uppercase font-body text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} /> Back
              </button>

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  disabled={!canAdvance}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight size={14} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors disabled:opacity-50"
                >
                  {submitting ? "Sending..." : "Send Request"}
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 text-center">
            {[
              {
                title: "1:1 Stylist",
                body: "A senior atelier stylist personally guides every commission.",
              },
              {
                title: "Hand-Crafted",
                body: "Cut, embroidered and finished by our karigars.",
              },
              {
                title: "No Obligation",
                body: "Approve the design and quote before any work begins.",
              },
            ].map((b) => (
              <div key={b.title}>
                <p className="text-[11px] tracking-[0.2em] uppercase font-body text-gold mb-2">
                  {b.title}
                </p>
                <p className="text-xs font-body text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {b.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
