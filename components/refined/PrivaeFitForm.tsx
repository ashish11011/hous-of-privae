"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Ruler,
} from "lucide-react";

const STUDIO_ADDRESS =
  "125, Gole Market Link Rd, Gole Market, Jawahar Nagar, Jaipur 302004";
const STUDIO_MAPS_URL =
  "https://maps.google.com/?q=125%20Gole%20Market%20Link%20Rd%20Gole%20Market%20Jawahar%20Nagar%20Jaipur%20302004";

type Mode = "measure" | "studio";

const initialMeasureForm = {
  fullName: "",
  phone: "",
  email: "",
  bust: "",
  waist: "",
  hips: "",
  shoulderWidth: "",
  sleeveLength: "",
  kurtaLength: "",
  bottomLength: "",
  bottomWaist: "",
  dupattaLength: "",
  selectedColor: "As Shown",
  additionalNotes: "",
};

const initialStudioForm = {
  name: "",
  phone: "",
  email: "",
  date: "",
  message: "",
};

export default function PrivaeFitForm() {
  const [mode, setMode] = useState<Mode>("measure");
  const [submitted, setSubmitted] = useState<null | Mode>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(initialMeasureForm);
  const [studioData, setStudioData] = useState(initialStudioForm);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedMode = params.get("mode");
    if (requestedMode === "studio" || requestedMode === "measure") {
      setMode(requestedMode);
    }
  }, []);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");

    const params = new URLSearchParams(window.location.search);
    params.set("mode", next);
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`
    );
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleStudioChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setStudioData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const submitRequest = async (nextMode: Mode) => {
    setSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/privae-fit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          nextMode === "measure"
            ? { mode: nextMode, ...formData }
            : { mode: nextMode, ...studioData }
        ),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.message || "Could not submit Privae Fit request.");
      }

      setSubmitted(nextMode);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not submit Privae Fit request."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const InputField = ({
    label,
    name,
    placeholder,
    unit,
  }: {
    label: string;
    name: keyof typeof initialMeasureForm;
    placeholder: string;
    unit?: string;
  }) => (
    <div>
      <label className="block text-xs font-body uppercase tracking-[0.1em] text-muted-foreground mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type="text"
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {unit}
          </span>
        )}
      </div>
    </div>
  );

  if (submitted) {
    return (
      <main className="py-24 text-center container mx-auto px-4">
        <p className="text-xs tracking-[0.3em] uppercase font-body text-gold mb-3">
          Privae Fit
        </p>
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4 heading-rule">
          Thank You
        </h1>
        <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-6 leading-relaxed">
          {submitted === "measure" ? (
            <>
              Your Privae Fit request has been received. Our atelier team will
              reach out within 24-48 hours to confirm your measurements and
              customization details.
            </>
          ) : (
            <>
              Your studio appointment request has been received. We&apos;ll
              confirm your visit to our Jaipur atelier within 24 hours.
            </>
          )}
        </p>

        {submitted === "studio" && (
          <div className="max-w-md mx-auto border border-border bg-card p-6 mb-6 text-left">
            <p className="text-[11px] tracking-[0.22em] uppercase font-body text-gold mb-3 text-center">
              The Privae Studio - Jaipur
            </p>
            <p className="text-sm font-body text-foreground/90 leading-relaxed text-center mb-2">
              125, Gole Market Link Rd,
              <br />
              Gole Market, Jawahar Nagar
              <br />
              Jaipur, Rajasthan 302004
            </p>
            <p className="text-xs font-body text-muted-foreground text-center mb-5">
              10 AM - 7 PM - By Appointment
            </p>
            <a
              href={STUDIO_MAPS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors duration-300"
            >
              <Navigation size={14} />
              Get Directions
            </a>
          </div>
        )}

        <Link href="/collections" className="text-primary font-body text-sm underline">
          Browse Collections
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.3em] uppercase font-body text-gold mb-2">
            Privae Fit
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3 heading-rule">
            A Fit Made Only For You
          </h1>
          <p className="text-sm text-muted-foreground font-body max-w-lg mx-auto leading-relaxed">
            Every piece at Haus of Privae can be tailored to your exact
            measurements. Choose how you&apos;d like to share them with us.
          </p>
        </div>

        <div className="grid grid-cols-2 border border-border mb-8">
          <button
            type="button"
            onClick={() => switchMode("measure")}
            className={`px-4 py-4 text-left transition-colors ${
              mode === "measure" ? "bg-card" : "bg-background hover:bg-card/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <Ruler
                size={18}
                className={
                  mode === "measure"
                    ? "text-gold mt-0.5"
                    : "text-muted-foreground mt-0.5"
                }
              />
              <div>
                <p
                  className={`text-xs tracking-[0.18em] uppercase font-body mb-1 ${
                    mode === "measure"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Provide Measurements
                </p>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                  Share your measurements and we&apos;ll craft remotely.
                </p>
              </div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => switchMode("studio")}
            className={`px-4 py-4 text-left border-l border-border transition-colors ${
              mode === "studio" ? "bg-card" : "bg-background hover:bg-card/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                className={
                  mode === "studio"
                    ? "text-gold mt-0.5"
                    : "text-muted-foreground mt-0.5"
                }
              />
              <div>
                <p
                  className={`text-xs tracking-[0.18em] uppercase font-body mb-1 ${
                    mode === "studio"
                      ? "text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  Visit the Studio
                </p>
                <p className="text-[11px] text-muted-foreground font-body leading-relaxed">
                  Book a private session at our Jaipur atelier.
                </p>
              </div>
            </div>
          </button>
        </div>

        {mode === "measure" && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitRequest("measure");
            }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-4 border-b border-border pb-2">
                Contact Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Full Name"
                  name="fullName"
                  placeholder="Your full name"
                />
                <InputField
                  label="Phone"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                />
                <div className="md:col-span-2">
                  <InputField
                    label="Email"
                    name="email"
                    placeholder="your@email.com"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-4 border-b border-border pb-2">
                Upper Body - Kurta / Top
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InputField label="Bust / Chest" name="bust" placeholder="36" unit="in" />
                <InputField label="Waist" name="waist" placeholder="30" unit="in" />
                <InputField label="Hips" name="hips" placeholder="38" unit="in" />
                <InputField label="Shoulder Width" name="shoulderWidth" placeholder="14" unit="in" />
                <InputField label="Sleeve Length" name="sleeveLength" placeholder="22" unit="in" />
                <InputField label="Kurta / Top Length" name="kurtaLength" placeholder="42" unit="in" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-4 border-b border-border pb-2">
                Lower Body - Bottom
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InputField label="Bottom Waist" name="bottomWaist" placeholder="30" unit="in" />
                <InputField label="Bottom Length" name="bottomLength" placeholder="40" unit="in" />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-4 border-b border-border pb-2">
                Dupatta
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InputField
                  label="Dupatta Length (optional)"
                  name="dupattaLength"
                  placeholder="2.5"
                  unit="m"
                />
              </div>
            </div>

            <div>
              <h3 className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-4 border-b border-border pb-2">
                Additional Notes
              </h3>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                placeholder="Any specific preferences, adjustments, or requests..."
                className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground py-3.5 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Submitting..." : "Submit Privae Fit Request"}
            </button>

            <div className="border border-gold/40 bg-gold/5 px-5 py-4 text-center">
              <p className="text-xs font-body text-foreground mb-1">
                Need help with measurements?
              </p>
              <p className="text-[11px] font-body text-muted-foreground mb-3 leading-relaxed">
                Book a complimentary virtual consultation - our atelier team
                will guide you through every measurement on a video call.
              </p>
              <Link
                href="/appointment?type=virtual_fitting"
                className="inline-block border border-primary text-primary px-5 py-2 text-[11px] tracking-[0.2em] uppercase font-body hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Book a Consultation Call
              </Link>
            </div>

            <p className="text-center text-xs text-muted-foreground font-body">
              Prefer to be measured in person?{" "}
              <button
                type="button"
                onClick={() => switchMode("studio")}
                className="text-primary underline"
              >
                Book a studio visit instead
              </button>
            </p>
          </form>
        )}

        {mode === "studio" && (
          <div>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <MapPin size={16} className="text-gold" />
                Jaipur, Rajasthan
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Clock size={16} className="text-gold" />
                10 AM - 7 PM
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
                <Calendar size={16} className="text-gold" />
                By Appointment Only
              </div>
            </div>

            <div className="text-center mb-8">
              <p className="text-xs font-body text-foreground/70 leading-relaxed mb-2">
                {STUDIO_ADDRESS}
              </p>
              <a
                href={STUDIO_MAPS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[11px] tracking-[0.18em] uppercase font-body text-gold border-b border-gold/40 hover:border-gold pb-0.5 transition-colors"
              >
                <Navigation size={12} />
                View on Google Maps
              </a>
            </div>

            <p className="text-center text-sm text-muted-foreground font-body mb-8 max-w-lg mx-auto leading-relaxed">
              Visit our atelier in Jaipur for a personalized fitting and
              styling experience. Our team will take your measurements in
              person and walk you through bespoke options.
            </p>

            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                submitRequest("studio");
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs tracking-[0.1em] uppercase font-body text-foreground block mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={studioData.name}
                    onChange={handleStudioChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-[0.1em] uppercase font-body text-foreground block mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={studioData.phone}
                    onChange={handleStudioChange}
                    className="w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs tracking-[0.1em] uppercase font-body text-foreground block mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={studioData.email}
                  onChange={handleStudioChange}
                  className="w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.1em] uppercase font-body text-foreground block mb-2">
                  Preferred Date
                </label>
                <input
                  type="date"
                  name="date"
                  required
                  value={studioData.date}
                  onChange={handleStudioChange}
                  className="w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label className="text-xs tracking-[0.1em] uppercase font-body text-foreground block mb-2">
                  Message (Optional)
                </label>
                <textarea
                  rows={4}
                  name="message"
                  value={studioData.message}
                  onChange={handleStudioChange}
                  className="w-full border border-border bg-background px-4 py-3 text-sm font-body text-foreground focus:outline-none focus:border-primary transition-colors resize-none"
                  placeholder="Tell us about the occasion or what you're looking for..."
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary text-primary-foreground py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Submitting..." : "Request Appointment"}
              </button>

              <p className="text-center text-xs text-muted-foreground font-body">
                Can&apos;t visit Jaipur?{" "}
                <button
                  type="button"
                  onClick={() => switchMode("measure")}
                  className="text-primary underline"
                >
                  Share your measurements remotely
                </button>
              </p>
            </form>
          </div>
        )}

        {error && <p className="mt-6 text-center text-sm text-red-600">{error}</p>}

        <div className="mt-10 bg-card p-6 text-center">
          <p className="text-xs font-body uppercase tracking-[0.2em] text-foreground mb-3">
            Need help deciding?
          </p>
          <p className="text-sm font-body text-muted-foreground mb-4">
            Reach out to us - our team will guide you through measurements,
            fittings and customization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-body">
            <a
              href="tel:+917023117408"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Phone size={14} />
              +91 7023 117 408
            </a>
            <a
              href="mailto:hello@hausofprivae.com"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <Mail size={14} />
              hello@hausofprivae.com
            </a>
            <a
              href="https://wa.me/917023117408"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary hover:underline"
            >
              <MessageCircle size={14} />
              Privae Concierge
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
