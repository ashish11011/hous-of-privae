"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, type FormEvent } from "react";

const fieldClass = "rounded-none border-[#ddd5c8] bg-[#f2eee7] px-4 text-sm placeholder:text-muted-foreground";

export default function Submitform() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;

    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setLoading(true);
    setStatus(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setStatus({ type: "error", message: result.message || "Unable to send your message. Please try again." });
        return;
      }

      form.reset();
      setStatus({ type: "success", message: "Thank you. Your message has been received." });
    } catch {
      setStatus({ type: "error", message: "Unable to send your message. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-describedby="contact-consent" className="space-y-4">
      <fieldset disabled={loading} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="sr-only">Name</span>
          <Input name="name" autoComplete="name" placeholder="Name *" required maxLength={120} className={`h-11 ${fieldClass}`} />
        </label>
        <label>
          <span className="sr-only">Email</span>
          <Input name="email" type="email" autoComplete="email" placeholder="E-mail *" required maxLength={254} className={`h-11 ${fieldClass}`} />
        </label>
        <label>
          <span className="sr-only">Phone (optional)</span>
          <Input name="phone" type="tel" autoComplete="tel" placeholder="Phone" maxLength={40} className={`h-11 ${fieldClass}`} />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Subject (optional)</span>
          <Input name="subject" placeholder="Subject" maxLength={160} className={`h-11 ${fieldClass}`} />
        </label>
        <label className="sm:col-span-2">
          <span className="sr-only">Message</span>
          <Textarea name="message" placeholder="Message *" required maxLength={5000} rows={5} className={`min-h-36 resize-y py-3 ${fieldClass}`} />
        </label>
      </fieldset>
      <p id="contact-consent" className="text-xs leading-relaxed text-muted-foreground">
        By submitting this form, you grant us permission to contact you via SMS, WhatsApp, email, and other channels.
      </p>
      <Button type="submit" disabled={loading} className="h-10 rounded-none bg-[#5e0c21] px-7 text-[11px] uppercase tracking-[0.2em] text-white hover:bg-[#4c091a]">
        {loading ? "Sending…" : "Send message"}
      </Button>
      {status && (
        <p role={status.type === "error" ? "alert" : "status"} className={status.type === "error" ? "text-sm text-red-700" : "text-sm text-green-800"}>
          {status.message}
        </p>
      )}
    </form>
  );
}
