"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Package, Truck } from "lucide-react";

const stages = [
  { label: "Cutting", Icon: Clock },
  { label: "Hand-finishing", Icon: Clock },
  { label: "Despatched", Icon: Truck },
  { label: "Delivered", Icon: CheckCircle2 },
];

export default function TrackOrderPage() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <main className="bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-10">
          <Package size={36} className="mx-auto text-primary mb-3" strokeWidth={1.25} />
          <p className="eyebrow mb-3">Order Tracking</p>
          <h1 className="font-heading text-4xl md:text-5xl heading-rule">Atelier Status</h1>
          <p className="mx-auto mt-7 text-sm font-body text-muted-foreground">
            Enter your order details and our team will help you follow your piece from atelier to doorstep.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setSubmitted(true);
          }}
          className="bg-card border border-border p-6 space-y-4"
        >
          <input className="w-full px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm" placeholder="Order Number" required />
          <input className="w-full px-4 py-3 bg-background border border-border focus:border-primary outline-none text-sm" placeholder="Email used at checkout" type="email" required />
          <button className="w-full bg-primary text-primary-foreground py-3 text-xs tracking-[0.2em] uppercase">
            Track Order
          </button>
          {submitted && (
            <p className="text-center text-xs text-muted-foreground">
              We could not verify an order directly here. Please check your email/WhatsApp tracking link or contact concierge with this order number.
            </p>
          )}
        </form>

        <div className="bg-card border border-border p-6 mt-6">
          <div className="flex justify-between gap-2">
            {stages.map(({ label, Icon }, index) => (
              <div key={label} className="flex flex-col items-center gap-2 flex-1">
                <Icon size={20} className={index === 0 ? "text-primary" : "text-muted-foreground/40"} />
                <span className="text-[10px] tracking-[0.15em] uppercase text-center leading-snug text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 h-1 bg-secondary">
            <div className="h-full w-1/4 bg-primary" />
          </div>
        </div>
      </div>
    </main>
  );
}
