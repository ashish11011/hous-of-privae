"use client";

import { useState } from "react";
import Link from "next/link";
import { CreditCard, Gift, Heart, Mail, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import DigitalGiftCard from "./DigitalGiftCard";
import GiftCardPurchaseDrawer from "./GiftCardPurchaseDrawer";
import {
  GIFT_CARD_AMOUNTS,
  GIFT_CARD_MAX,
  GIFT_CARD_MIN,
} from "@/lib/gift-cards/validation";

export default function GiftingPage() {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>();
  const [custom, setCustom] = useState("");
  function purchase(value?: number) {
    setAmount(value);
    setOpen(true);
  }
  const presentation = [
    {
      icon: CreditCard,
      title: "Digital Card",
      description:
        "A beautifully considered digital card with a unique, secure code, ready after payment confirmation.",
    },
    {
      icon: Mail,
      title: "Chosen Recipient",
      description:
        "Send their card by email, or share it yourself for a more personal reveal.",
    },
    {
      icon: Sparkles,
      title: "Personalized Note",
      description:
        "A few warm words, held alongside a gift chosen with intention.",
    },
  ];
  return (
    <main className="min-h-screen bg-background">
      <section className="py-20 md:py-28 px-5 bg-primary text-center text-primary-foreground">
        <Gift
          size={36}
          className="mx-auto text-white/80 mb-6"
          strokeWidth={1.25}
        />
        <p className="text-xs tracking-[0.3em] uppercase font-body text-gold mb-4">
          The Art of Thoughtful Gifting
        </p>
        <h1 className="font-heading text-4xl md:text-6xl mb-6">
          Privae Experience — Gift Card
        </h1>
        <div className="h-px w-14 mx-auto bg-gold/60 mb-6" />
        <p className="text-white/80 font-body text-sm md:text-base max-w-2xl mx-auto leading-relaxed mb-4">
          An invitation into the world of Haus of Privae. A gift of elegance,
          thoughtfulness, and the joy of discovering a piece that feels entirely
          their own.
        </p>
        <p className="text-white/60 font-body text-xs md:text-sm italic max-w-xl mx-auto mb-10">
          “Because luxury, when shared, becomes even more beautiful.”
        </p>
        <button
          type="button"
          onClick={() => purchase()}
          className="border border-white px-9 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-white hover:text-primary transition-colors"
        >
          Gift an Experience
        </button>
      </section>
      <section className="px-5 py-14 md:py-20">
        <div className="container mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1.05fr_0.95fr]">
          <DigitalGiftCard
            amount={0}
            recipientName="Someone special"
            senderName="With love"
            message="For a piece that feels entirely your own."
          />
          <div className="text-center md:text-left">
            <p className="eyebrow mb-3">The digital card</p>
            <h2 className="font-heading text-3xl md:text-4xl">
              A keepsake before it is spent
            </h2>
            <p className="mt-4 font-body text-sm leading-relaxed text-muted-foreground">
              Handmade-paper depth, heritage maroon, and delicate gold detailing
              make every Experience Card feel considered from the first reveal.
            </p>
            <Button
              className="mt-7 rounded-sm px-7 text-xs uppercase tracking-[0.16em]"
              onClick={() => purchase(25000)}
            >
              Personalize this card
            </Button>
          </div>
        </div>
      </section>
      <section className="py-14 md:py-20 px-5">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="font-heading text-3xl md:text-4xl mb-4">
            Card Values
          </h2>
          <p className="text-muted-foreground text-xs tracking-[0.15em] uppercase font-body mb-10">
            Choose a denomination, or choose a custom value
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {GIFT_CARD_AMOUNTS.map((value) => (
              <button
                key={value}
                onClick={() => purchase(value)}
                className="border border-border p-6 hover:border-primary hover:text-primary transition-colors font-heading text-2xl md:text-3xl"
              >
                ₹{value.toLocaleString("en-IN")}
              </button>
            ))}
          </div>
          <form
            className="max-w-md mx-auto border border-border p-6 bg-card"
            onSubmit={(event) => {
              event.preventDefault();
              const value = Number(custom);
              if (
                !Number.isInteger(value) ||
                value < GIFT_CARD_MIN ||
                value > GIFT_CARD_MAX
              ) {
                toast.error("Choose a value between ₹1,000 and ₹5,00,000.");
                return;
              }
              purchase(value);
            }}
          >
            <label
              htmlFor="gift-value"
              className="block text-xs font-body uppercase tracking-[0.2em] mb-3"
            >
              Or Choose a Custom Value
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  ₹
                </span>
                <input
                  id="gift-value"
                  type="number"
                  min={GIFT_CARD_MIN}
                  max={GIFT_CARD_MAX}
                  step={1}
                  required
                  value={custom}
                  onChange={(event) => setCustom(event.target.value)}
                  placeholder="e.g. 75000"
                  className="w-full border border-border bg-background pl-7 pr-3 py-2.5 text-sm font-body focus:outline-primary"
                />
              </div>
              <Button
                type="submit"
                className="h-auto rounded-none px-5 text-[10px] uppercase tracking-[0.15em]"
              >
                Gift Now
              </Button>
            </div>
            {custom && (
              <p className="text-xs text-muted-foreground mt-3">
                You’re gifting ₹{Number(custom).toLocaleString("en-IN")}
              </p>
            )}
          </form>
          <p className="text-xs font-body text-muted-foreground mt-6">
            Choose a value from ₹1,000 to ₹5,00,000. Any remaining balance stays
            on the card.
          </p>
        </div>
      </section>
      <section className="py-16 md:py-20 px-5 bg-secondary">
        <div className="container mx-auto max-w-5xl">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-4">
            Presentation & Format
          </h2>
          <p className="text-center text-muted-foreground text-xs tracking-[0.15em] uppercase font-body mb-14">
            Crafted for the act of giving
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {presentation.map((item) => (
              <div key={item.title} className="text-center">
                <span className="size-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                  <item.icon size={22} />
                </span>
                <h3 className="font-heading text-xl mb-2">{item.title}</h3>
                <p className="text-sm font-body text-muted-foreground leading-relaxed max-w-xs mx-auto">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 md:py-20 px-5">
        <div className="container mx-auto max-w-5xl grid md:grid-cols-2 gap-8">
          {[
            {
              title: "Redemption Experience",
              items: [
                "Sign in and claim your secure card code in your account or at checkout",
                "Use the available balance across multiple orders",
                "Pay any remaining amount securely with Razorpay",
                "A fully covered order is confirmed directly with your gift card",
              ],
            },
            {
              title: "A gift within Privae Circle",
              items: [
                "Gift card purchases do not earn Privae Points",
                "Use a gift card alongside your available loyalty points",
                "Earn the usual rewards when you shop for pieces",
                "Your card balance and history are always in My Account → Gift Cards",
              ],
            },
          ].map((section) => (
            <div
              key={section.title}
              className="border border-border p-7 md:p-8"
            >
              <h3 className="font-heading text-2xl mb-5">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((text) => (
                  <li
                    key={text}
                    className="text-sm font-body text-muted-foreground flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-gold shrink-0">✦</span>
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="py-16 md:py-20 px-5 text-center bg-secondary">
        <Heart
          size={28}
          className="mx-auto text-primary mb-5"
          strokeWidth={1.25}
        />
        <h2 className="font-heading text-3xl md:text-4xl mb-6 max-w-2xl mx-auto">
          Give an experience tailored with care.
        </h2>
        <p className="text-muted-foreground font-body text-sm italic mb-10">
          “From you, to them — the elegance of Haus of Privae.”
        </p>
        <Button
          className="rounded-none px-9 py-6 text-xs uppercase tracking-[0.18em]"
          onClick={() => purchase()}
        >
          Purchase an Experience Card
        </Button>
        <p className="text-xs text-muted-foreground mt-6">
          Already have a card?{" "}
          <Link
            href="/profile#gift-cards"
            className="text-primary underline underline-offset-4"
          >
            Claim it in your account
          </Link>
          .
        </p>
      </section>
      <GiftCardPurchaseDrawer
        open={open}
        onOpenChange={setOpen}
        initialAmount={amount}
      />
    </main>
  );
}
