"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Calendar as CalIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const STUDIO_ADDRESS = "125, Gole Market Link Rd, Gole Market, Jawahar Nagar, Jaipur 302004";
const STUDIO_MAPS_URL = "https://maps.google.com/?q=125%20Gole%20Market%20Link%20Rd%20Gole%20Market%20Jawahar%20Nagar%20Jaipur%20302004";
const HORIZON_DAYS = 60;

const APPOINTMENT_TYPES = [
  {
    value: "studio_visit",
    label: "Studio Visit",
    duration: 60,
    blurb: "A private styling session at our Jaipur atelier.",
  },
  {
    value: "virtual_fitting",
    label: "Virtual Fitting",
    duration: 45,
    blurb: "A guided fitting consultation over video.",
  },
  {
    value: "bespoke_consultation",
    label: "Bespoke Consultation",
    duration: 90,
    blurb: "Begin a custom commission with our designer.",
  },
] as const;

type AppointmentType = (typeof APPOINTMENT_TYPES)[number]["value"];
type Slot = { time: string; taken: boolean };

const pad = (value: number) => String(value).padStart(2, "0");

function dateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function formatDisplayDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatMonth(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(date);
}

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function sameDay(a?: Date, b?: Date) {
  return Boolean(a && b && dateKey(a) === dateKey(b));
}

function buildSlotsForDate(date: Date): string[] {
  if (date.getDay() === 0) return [];

  const slots: string[] = [];
  for (let hour = 10; hour < 19; hour += 1) {
    slots.push(`${pad(hour)}:00`);
  }
  return slots;
}

function buildCalendarDays(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);
  const days: (Date | null)[] = Array(first.getDay()).fill(null);

  for (let day = 1; day <= last.getDate(); day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

export default function AppointmentBookingForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [bookedTimes, setBookedTimes] = useState<Record<string, string[]>>({});
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [appointmentType, setAppointmentType] = useState<AppointmentType>("studio_visit");
  const [date, setDate] = useState<Date | undefined>();
  const [visibleMonth, setVisibleMonth] = useState(() => startOfDay(new Date()));
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadAppointments() {
      setLoadingMeta(true);
      try {
        const response = await fetch("/api/appointment", { cache: "no-store" });
        const payload = await response.json();
        setBookedTimes(payload.bookedTimes ?? {});
      } catch {
        setBookedTimes({});
      } finally {
        setLoadingMeta(false);
      }
    }

    loadAppointments();
  }, []);

  useEffect(() => {
    const currentSession = session as { email?: string; user?: { name?: string | null; email?: string | null } } | null;
    const sessionEmail = currentSession?.email ?? currentSession?.user?.email ?? "";
    const sessionName = currentSession?.user?.name ?? "";

    if (sessionEmail) setEmail((current) => current || sessionEmail);
    if (sessionName) setName((current) => current || sessionName);
  }, [session]);

  const selectedType = APPOINTMENT_TYPES.find((type) => type.value === appointmentType) ?? APPOINTMENT_TYPES[0];
  const today = startOfDay(new Date());
  const maxDate = addDays(today, HORIZON_DAYS);
  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);

  const isDateDisabled = (candidate: Date) => {
    const day = startOfDay(candidate);
    if (day < today || day > maxDate) return true;

    const slots = buildSlotsForDate(candidate);
    if (slots.length === 0) return true;

    const taken = bookedTimes[dateKey(candidate)] ?? [];
    return taken.length >= slots.length;
  };

  const dailySlots: Slot[] = useMemo(() => {
    if (!date) return [];

    const taken = new Set(bookedTimes[dateKey(date)] ?? []);
    const now = new Date();

    return buildSlotsForDate(date).map((slot) => {
      const [hours, minutes] = slot.split(":").map(Number);
      const slotDate = new Date(date);
      slotDate.setHours(hours, minutes, 0, 0);

      return {
        time: slot,
        taken: taken.has(slot) || (sameDay(date, now) && slotDate <= now),
      };
    });
  }, [bookedTimes, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMessage("");

    if (status === "unauthenticated") {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent("/appointment")}`);
      return;
    }

    if (!date || !time) {
      setErrorMessage("Choose a date and time.");
      return;
    }

    setSubmitting(true);

    const response = await fetch("/api/appointment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        appointmentType,
        appointmentLabel: selectedType.label,
        duration: selectedType.duration,
        date: dateKey(date),
        time,
        name,
        phone,
        email,
        notes,
      }),
    });

    const payload = await response.json().catch(() => ({}));
    setSubmitting(false);

    if (!response.ok) {
      if (response.status === 401) {
        router.push(`/auth/login?callbackUrl=${encodeURIComponent("/appointment")}`);
        return;
      }

      setErrorMessage(payload.error ?? "Could not request appointment. Please try again.");

      if (response.status === 409) {
        setBookedTimes((current) => ({
          ...current,
          [dateKey(date)]: Array.from(new Set([...(current[dateKey(date)] ?? []), time])),
        }));
        setTime(null);
      }
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="container mx-auto px-4 py-20 md:py-24 text-center">
        <p className="text-xs tracking-[0.3em] uppercase font-body text-gold mb-3">Privae Studio</p>
        <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-4 heading-rule">Thank You</h1>
        <p className="text-muted-foreground font-body text-sm max-w-md mx-auto mb-8 leading-relaxed">
          Your appointment request has been received. We&apos;ll confirm within 24 hours.
        </p>

        <div className="max-w-md mx-auto border border-border bg-card p-6 mb-6 text-left">
          <p className="text-[11px] tracking-[0.22em] uppercase font-body text-gold mb-3 text-center">
            {selectedType.label} · {date && formatDisplayDate(date)} · {time}
          </p>
          <p className="text-sm font-body text-foreground/90 leading-relaxed text-center mb-2">
            125, Gole Market Link Rd,
            <br />
            Gole Market, Jawahar Nagar
            <br />
            Jaipur, Rajasthan 302004
          </p>
          <p className="text-xs font-body text-muted-foreground text-center mb-5">10 AM - 7 PM · By Appointment</p>
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

        <Link href="/profile" className="text-primary font-body text-sm underline">
          Go to my profile
        </Link>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-12 md:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase font-body text-gold mb-2">Privae Studio</p>
          <h1 className="font-heading text-3xl md:text-4xl text-foreground mb-3 heading-rule">Book Your Appointment</h1>
          <p className="text-sm text-muted-foreground font-body max-w-lg mx-auto leading-relaxed">
            Choose a service, date and time. We&apos;ll confirm your visit within 24 hours.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mb-5">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <MapPin size={14} className="text-gold" /> Jaipur, Rajasthan
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <Clock size={14} className="text-gold" /> 10 AM - 7 PM
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <CalIcon size={14} className="text-gold" /> By Appointment
          </div>
        </div>
        <div className="text-center mb-10">
          <p className="text-xs font-body text-foreground/70 leading-relaxed mb-2">{STUDIO_ADDRESS}</p>
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

        <form onSubmit={handleSubmit} className="space-y-6 bg-card p-6 md:p-8 border border-border">
          <div>
            <label className="block text-xs font-body uppercase tracking-[0.15em] text-muted-foreground mb-3">
              1 · Choose Service
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {APPOINTMENT_TYPES.map((type) => {
                const active = appointmentType === type.value;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      setAppointmentType(type.value);
                      setTime(null);
                    }}
                    className={cn(
                      "text-left border p-3 transition-colors",
                      active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <p className="text-sm font-body text-foreground">{type.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{type.duration} min</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{type.blurb}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-body uppercase tracking-[0.15em] text-muted-foreground mb-3">
              2 · Pick a Date
            </label>
            {loadingMeta ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={14} className="animate-spin" /> Loading availability...
              </div>
            ) : (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "w-full md:w-[280px] justify-start text-left font-normal rounded-none",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalIcon className="mr-2 h-4 w-4" />
                    {date ? formatDisplayDate(date) : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[286px] p-3 rounded-none" align="start">
                  <div className="flex items-center justify-between mb-3">
                    <button
                      type="button"
                      aria-label="Previous month"
                      onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <p className="text-sm font-body text-foreground">{formatMonth(visibleMonth)}</p>
                    <button
                      type="button"
                      aria-label="Next month"
                      onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}
                      className="p-1 text-muted-foreground hover:text-foreground"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground mb-1">
                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                      <span key={day}>{day}</span>
                    ))}
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((candidate, index) => {
                      if (!candidate) return <span key={`blank-${index}`} className="h-9" />;

                      const disabled = isDateDisabled(candidate);
                      const active = sameDay(candidate, date);

                      return (
                        <button
                          key={dateKey(candidate)}
                          type="button"
                          disabled={disabled}
                          onClick={() => {
                            setDate(candidate);
                            setTime(null);
                          }}
                          className={cn(
                            "h-9 text-sm transition-colors",
                            active && "bg-primary text-primary-foreground",
                            !active && !disabled && "hover:bg-accent",
                            disabled && "text-muted-foreground/40 cursor-not-allowed line-through"
                          )}
                        >
                          {candidate.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>

          {date && (
            <div>
              <label className="block text-xs font-body uppercase tracking-[0.15em] text-muted-foreground mb-3">
                3 · Pick a Time
              </label>
              {dailySlots.length === 0 ? (
                <p className="text-sm text-muted-foreground">No slots available on this day.</p>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {dailySlots.map((slot) => {
                    const active = time === slot.time;
                    return (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={slot.taken}
                        onClick={() => setTime(slot.time)}
                        className={cn(
                          "text-sm py-2 border transition-colors",
                          slot.taken && "border-border text-muted-foreground/50 line-through cursor-not-allowed",
                          active && "border-primary bg-primary text-primary-foreground",
                          !slot.taken && !active && "border-border hover:border-primary"
                        )}
                      >
                        {slot.time}
                        {active && <Check size={12} className="inline-block ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <label className="block text-xs font-body uppercase tracking-[0.15em] text-muted-foreground mb-3">
              4 · Your Details
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Full name"
                className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body"
              />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-border bg-background px-3 py-2.5 text-sm font-body"
              />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full mt-3 border border-border bg-background px-3 py-2.5 text-sm font-body"
            />
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything we should know - occasion, preferences, who's joining..."
              className="w-full mt-3 border border-border bg-background px-3 py-2.5 text-sm font-body resize-none"
            />
          </div>

          {errorMessage && <p className="text-sm text-red-600 text-center">{errorMessage}</p>}

          <button
            type="submit"
            disabled={submitting || status === "loading" || !date || !time}
            className="w-full bg-primary text-primary-foreground py-3.5 text-xs tracking-[0.2em] uppercase font-body hover:bg-maroon-light transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Requesting..." : "Request Appointment"}
          </button>
          {status === "unauthenticated" && (
            <p className="text-[11px] text-center text-muted-foreground">
              You&apos;ll be asked to sign in so we can save this to your account.
            </p>
          )}
        </form>

        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-[11px] tracking-[0.22em] uppercase font-body text-muted-foreground mb-4">Need Assistance?</p>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3">
            <a href="tel:+917023117408" className="flex items-center gap-2 text-sm font-body text-foreground/80 hover:text-primary transition-colors">
              <Phone size={14} className="text-gold" /> +91 7023117408
            </a>
            <a href="mailto:queries.hausofprivae@gmail.com" className="flex items-center gap-2 text-sm font-body text-foreground/80 hover:text-primary transition-colors">
              <Mail size={14} className="text-gold" /> queries.hausofprivae@gmail.com
            </a>
            <a
              href="https://wa.me/917023117408"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-body text-foreground/80 hover:text-primary transition-colors"
            >
              <MessageCircle size={14} className="text-gold" /> Privae Concierge
            </a>
          </div>
        </div>
      </div>
    </main>
  );
}
