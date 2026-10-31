"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, Gift, Loader2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import DigitalGiftCard from "./DigitalGiftCard";
import {
  GIFT_CARD_AMOUNTS,
  GIFT_CARD_MAX,
  GIFT_CARD_MIN,
  giftCardPurchaseSchema,
} from "@/lib/gift-cards/validation";
import {
  giftCardRequest,
  payForGiftCard,
  type GiftCardGatewayOrder,
} from "@/lib/gift-cards/client";

export default function GiftCardPurchaseDrawer({
  open,
  onOpenChange,
  initialAmount,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialAmount?: number;
}) {
  const { data: session, status } = useSession();
  const [step, setStep] = useState<1 | 2 | 3 | "done">(1);
  const [amount, setAmount] = useState(0);
  const [recipientName, setRecipientName] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [senderName, setSenderName] = useState("");
  const [buyerEmail, setBuyerEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [reference, setReference] = useState("");
  const attempt = useRef({ fingerprint: "", id: "" });
  useEffect(() => {
    if (!open) return;
    setAmount(initialAmount ?? 0);
    setStep(initialAmount ? 2 : 1);
    setReference("");
    setConfirmed(false);
  }, [open, initialAmount]);
  useEffect(() => {
    if (!open || status !== "authenticated") return;
    const controller = new AbortController();
    fetch("/api/profile", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user?.name)
          setSenderName((current) => current || data.user.name);
        if (data?.user?.email) setBuyerEmail(data.user.email);
      })
      .catch(() => {});
    return () => controller.abort();
  }, [open, status]);

  function next() {
    if (step === 1) {
      if (
        !Number.isInteger(amount) ||
        amount < GIFT_CARD_MIN ||
        amount > GIFT_CARD_MAX
      ) {
        toast.error("Choose a value between ₹1,000 and ₹5,00,000.");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const checked = giftCardPurchaseSchema.safeParse({
        requestId: crypto.randomUUID(),
        amount,
        senderName,
        recipientName,
        recipientEmail,
        message,
      });
      if (!checked.success) {
        toast.error(checked.error.issues[0].message);
        return;
      }
      setStep(3);
    }
  }
  async function purchase() {
    const details = {
      amount,
      senderName: senderName.trim(),
      recipientName: recipientName.trim(),
      recipientEmail: recipientEmail.trim(),
      message: message.trim(),
    };
    const fingerprint = JSON.stringify(details);
    if (attempt.current.fingerprint !== fingerprint)
      attempt.current = { fingerprint, id: crypto.randomUUID() };
    setBusy(true);
    try {
      const payment = await giftCardRequest<GiftCardGatewayOrder>("/purchase", {
        ...details,
        requestId: attempt.current.id,
      });
      setReference(payment.id);
      // Close the modal sheet before Razorpay opens its own payment dialog.
      // This releases Radix's focus trap for the external checkout iframe.
      flushSync(() => setGatewayOpen(true));
      const result = await payForGiftCard(payment, {
        name: senderName,
        email: buyerEmail || session?.user?.email || undefined,
      });
      if (result.cancelled) {
        toast.info(
          "Payment closed. You can resume this gift card purchase from your account.",
        );
        return;
      }
      setConfirmed(result.confirmed);
      setStep("done");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to purchase this gift card.",
      );
    } finally {
      setGatewayOpen(false);
      setBusy(false);
    }
  }
  return (
    <Sheet
      open={open && !gatewayOpen}
      onOpenChange={(value) => {
        if (!busy) onOpenChange(value);
      }}
    >
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto p-6 gap-0"
      >
        <SheetHeader className="p-0 pr-4 text-left">
          <SheetTitle className="flex items-center gap-2 font-heading text-2xl">
            <Gift size={18} className="text-primary" />
            Gift an Experience
          </SheetTitle>
          <SheetDescription className="font-body text-xs">
            Privae Experience Gift Card — crafted for the act of giving.
          </SheetDescription>
        </SheetHeader>
        {step !== "done" && (
          <div className="flex gap-1.5 mt-5" aria-label={`Step ${step} of 3`}>
            {[1, 2, 3].map((index) => (
              <div
                key={index}
                className={`h-1 flex-1 ${index <= step ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
        )}
        <div className="mt-6 space-y-5">
          {step !== "done" && (
            <DigitalGiftCard
              amount={amount}
              recipientName={recipientName}
              senderName={senderName}
              message={message}
              compact
            />
          )}
          {step === 1 && (
            <>
              <Label>Choose value</Label>
              <div className="grid grid-cols-2 gap-2">
                {GIFT_CARD_AMOUNTS.map((value) => (
                  <button
                    type="button"
                    key={value}
                    onClick={() => setAmount(value)}
                    className={`border p-4 font-heading text-xl ${amount === value ? "border-primary bg-primary/5 text-primary" : "border-border"}`}
                  >
                    ₹{value.toLocaleString("en-IN")}
                  </button>
                ))}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-custom-amount">Or custom value (₹)</Label>
                <Input
                  id="gift-custom-amount"
                  type="number"
                  min={GIFT_CARD_MIN}
                  max={GIFT_CARD_MAX}
                  step={1}
                  value={amount || ""}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  placeholder="e.g. 75000"
                />
                <p className="text-[11px] text-muted-foreground">
                  Between ₹1,000 and ₹5,00,000
                </p>
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <div className="border p-3 flex justify-between items-center">
                <span className="font-heading text-xl">
                  ₹{amount.toLocaleString("en-IN")}
                </span>
                <button
                  type="button"
                  className="text-xs text-primary underline"
                  onClick={() => setStep(1)}
                >
                  Change value
                </button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-recipient">Recipient name</Label>
                <Input
                  id="gift-recipient"
                  maxLength={120}
                  value={recipientName}
                  onChange={(event) => setRecipientName(event.target.value)}
                  placeholder="Someone special"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-recipient-email">
                  Recipient email (optional)
                </Label>
                <Input
                  id="gift-recipient-email"
                  type="email"
                  maxLength={254}
                  value={recipientEmail}
                  onChange={(event) => setRecipientEmail(event.target.value)}
                  placeholder="their@email.com"
                />
                <p className="text-[11px] text-muted-foreground">
                  We’ll email their card after payment is confirmed. Leave blank
                  to share it yourself.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-sender">Your name</Label>
                <Input
                  id="gift-sender"
                  maxLength={120}
                  value={senderName}
                  onChange={(event) => setSenderName(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gift-message">
                  Personal message (optional)
                </Label>
                <Textarea
                  id="gift-message"
                  rows={3}
                  maxLength={500}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  placeholder="A few warm words to accompany the gift…"
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {message.length}/500
                </p>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="space-y-4 font-body text-sm">
              <div className="border p-5">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                  Card value
                </p>
                <p className="font-heading text-3xl mt-2">
                  ₹{amount.toLocaleString("en-IN")}
                </p>
              </div>
              <p>
                <span className="text-muted-foreground">To:</span>{" "}
                {recipientName}
              </p>
              <p>
                <span className="text-muted-foreground">Delivery:</span>{" "}
                {recipientEmail || "Share it yourself from your account"}
              </p>
              <p>
                <span className="text-muted-foreground">From:</span>{" "}
                {senderName}
              </p>
              {message && (
                <p className="whitespace-pre-wrap italic">“{message}”</p>
              )}
              <p className="border-t pt-4 text-xs text-muted-foreground leading-relaxed">
                Pay securely with Razorpay. Your card activates after payment
                confirmation. Gift card purchases do not earn loyalty points.
                The code can be claimed by one account and used across multiple
                orders.
              </p>
            </div>
          )}
          {step === "done" && (
            <div className="text-center space-y-5">
              <span className="size-14 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary">
                {confirmed ? (
                  <Check size={26} />
                ) : (
                  <Loader2 className="animate-spin" size={26} />
                )}
              </span>
              <h3 className="font-heading text-3xl">
                {confirmed ? "Your gift is ready" : "Confirming your gift"}
              </h3>
              <p className="text-sm font-body text-muted-foreground">
                {confirmed
                  ? "Your digital card is ready in your account. Copy its code or share it with someone special."
                  : "Your payment is being confirmed. Your card will activate automatically; please do not pay again."}
              </p>
              <p className="font-mono text-[10px] break-all">
                Reference: {reference}
              </p>
              <Button asChild className="w-full">
                <Link href="/profile#gift-cards">View My Gift Cards</Link>
              </Button>
            </div>
          )}
        </div>
        {step !== "done" && (
          <div className="mt-8 space-y-4">
            {status === "unauthenticated" ? (
              <Button asChild className="w-full">
                <Link href="/auth/login?callbackUrl=/gifting">
                  Sign in to purchase
                </Link>
              </Button>
            ) : (
              <div className="flex gap-2">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    disabled={busy}
                    onClick={() => setStep(step === 3 ? 2 : 1)}
                  >
                    Back
                  </Button>
                )}
                <Button
                  type="button"
                  className="flex-1"
                  disabled={busy || status === "loading"}
                  onClick={step === 3 ? purchase : next}
                >
                  {busy ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Confirming payment…
                    </>
                  ) : step === 3 ? (
                    `Pay ₹${amount.toLocaleString("en-IN")}`
                  ) : (
                    "Continue"
                  )}
                </Button>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground text-center">
              Keep your gift card code private until you are ready to share it.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
