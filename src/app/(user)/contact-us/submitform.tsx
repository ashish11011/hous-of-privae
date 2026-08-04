"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { insertContactDetails } from "@/lib";
import React, { useState } from "react";

const Submitform = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    consent: true,
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const target = e.target as HTMLInputElement;
    const { name, type, value, checked } = target;

    setForm((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await insertContactDetails({
        name: form.name,
        email: form.email,
        phone: form.phone,
        location: "", // optional field if needed
        message: form.message,
      });

      setStatus("success");
      setForm({
        name: "",
        email: "",
        phone: "",
        message: "",
        consent: true,
      });
    } catch (err) {
      console.error(err);
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {" "}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="name" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Name
            </label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="rounded-none bg-background"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              E-mail
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
              className="rounded-none bg-background"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="phone" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Phone No
            </label>
            <Input
              id="phone"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              required
              className="rounded-none bg-background"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label htmlFor="message" className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Message
            </label>
            <Textarea
              id="message"
              name="message"
              rows={4}
              value={form.message}
              onChange={handleChange}
              required
              className="rounded-none min-h-24 bg-background"
            />
          </div>
        </div>

        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            name="consent"
            checked={form.consent}
            onChange={handleChange}
            className="mt-1"
            required
          />
          <p>
            By submitting this form, you hereby grant us permission to contact
            you via SMS, WhatsApp, RCS, Email, and any other channel.
          </p>
        </div>

        <div className="pt-4 space-y-4">
          <Button
            type="submit"
            disabled={loading}
            size={"lg"}
            className="w-full rounded-none h-12 tracking-[0.2em] uppercase text-xs"
          >
            {loading ? "Sending..." : "Send message"}
          </Button>

          {status === "success" && (
            <p className="text-green-600 text-center">
              Form submitted successfully!
            </p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-center">
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </form>
    </>
  );
};

export default Submitform;
