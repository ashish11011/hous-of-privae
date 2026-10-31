"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Copy, Gift, Loader2, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import DigitalGiftCard from "./DigitalGiftCard";
import { formatGiftCardAmount } from "@/lib/gift-cards/validation";
import {
  giftCardRequest,
  payForGiftCard,
  type GiftCardGatewayOrder,
} from "@/lib/gift-cards/client";

type Card = {
  id: string;
  amountPaise: number;
  balancePaise: number;
  availablePaise: number;
  senderName: string;
  recipientName: string;
  recipientEmail: string | null;
  message: string;
  paymentStatus: string;
  code: string | null;
  isPurchased: boolean;
  isClaimed: boolean;
  isMine: boolean;
  emailDelivered: boolean | null;
  createdAt: string;
  transactions: {
    id: string;
    type: string;
    amountPaise: number;
    balanceAfterPaise: number;
    orderId: string | null;
    createdAt: string;
  }[];
};
export default function AccountGiftCards() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Received" | "Purchased">("All");
  const load = useCallback(async () => {
    try {
      const data = await giftCardRequest<{ cards: Card[] }>("");
      setCards(data.cards);
      setError("");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Unable to load gift cards.",
      );
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const hasPending = cards.some((card) => card.paymentStatus !== "paid");
  useEffect(() => {
    if (!hasPending) return;
    const timer = setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(timer);
  }, [hasPending, load]);

  async function claim(event: React.FormEvent) {
    event.preventDefault();
    setBusy("claim");
    try {
      await giftCardRequest("/claim", { code });
      setCode("");
      toast.success("Gift card added to your account.");
      await load();
    } catch (failure) {
      toast.error(
        failure instanceof Error
          ? failure.message
          : "Unable to claim this card.",
      );
    } finally {
      setBusy(null);
    }
  }
  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Gift card code copied.");
    } catch {
      toast.error("Could not copy. Select the card code to copy it manually.");
    }
  }
  async function share(card: Card) {
    const text = `A Privae Experience Gift Card for ${card.recipientName}, from ${card.senderName}. Gift value: ${formatGiftCardAmount(card.amountPaise)}. Code: ${card.code}. Sign in at ${window.location.origin}/profile#gift-cards to claim your card.`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Privae Experience Gift Card", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Gift message copied. Share it with someone special.");
      }
    } catch (failure) {
      if (!(failure instanceof Error && failure.name === "AbortError"))
        toast.error("Unable to share. You can copy the card code instead.");
    }
  }
  async function resume(card: Card) {
    setBusy(card.id);
    try {
      const payment = await giftCardRequest<GiftCardGatewayOrder>("/resume", {
        id: card.id,
      });
      const result = await payForGiftCard(payment, { name: card.senderName });
      toast.info(
        result.confirmed
          ? "Gift card activated."
          : result.cancelled
            ? "Payment closed. You can resume it here."
            : "Payment is being confirmed. Please do not pay again.",
      );
      await load();
    } catch (failure) {
      toast.error(
        failure instanceof Error
          ? failure.message
          : "Unable to resume payment.",
      );
    } finally {
      setBusy(null);
    }
  }
  async function retryDelivery(id: string) {
    setBusy(id);
    try {
      await giftCardRequest("/delivery", { id });
      toast.success("Gift card email delivered.");
      await load();
    } catch (failure) {
      toast.error(
        failure instanceof Error
          ? failure.message
          : "Email delivery is pending. Try again shortly.",
      );
    } finally {
      setBusy(null);
    }
  }
  const visible = cards.filter(
    (card) =>
      filter === "All" ||
      (filter === "Purchased" ? card.isPurchased : card.isMine),
  );
  return (
    <section className="space-y-6">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="font-heading text-3xl">Your gift cards</h2>
          <p className="font-body text-sm text-muted-foreground mt-2">
            A little luxury, given and received. Your cards, balances, and
            moments of thoughtfulness.
          </p>
        </div>
        <Button asChild className="text-xs rounded-sm">
          <Link href="/gifting">
            <Gift size={14} />
            Gift an Experience
          </Link>
        </Button>
      </header>
      <form onSubmit={claim} className="border bg-secondary/30 p-5 space-y-3">
        <Label htmlFor="claim-gift-code" className="font-heading text-xl">
          Received a gift?
        </Label>
        <p className="text-xs font-body text-muted-foreground">
          Add your code to claim the card for this account. Once claimed, only
          you can spend its balance.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            id="claim-gift-code"
            required
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={80}
            placeholder="Enter your gift card code"
            autoComplete="off"
            className="font-mono text-xs"
          />
          <Button type="submit" disabled={Boolean(busy) || Boolean(error)}>
            {busy === "claim" ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Add Gift Card"
            )}
          </Button>
        </div>
      </form>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-4" aria-label="Filter gift cards">
          {(["All", "Received", "Purchased"] as const).map((value) => (
            <button
              type="button"
              key={value}
              onClick={() => setFilter(value)}
              aria-pressed={filter === value}
              className={`text-[10px] uppercase tracking-[0.15em] pb-2 border-b ${filter === value ? "border-primary text-primary" : "border-transparent text-muted-foreground"}`}
            >
              {value}
            </button>
          ))}
        </div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          disabled={Boolean(busy)}
          onClick={() => {
            setLoading(true);
            void load();
          }}
        >
          <RefreshCw size={13} />
          Refresh
        </Button>
      </div>
      {error && (
        <p role="status" className="border p-4 text-sm text-muted-foreground">
          {error}
        </p>
      )}
      {loading ? (
        <p role="status" className="text-sm text-muted-foreground">
          Loading your gift cards…
        </p>
      ) : !error && !visible.length ? (
        <div className="bg-secondary/50 p-10 text-center">
          <Gift
            size={30}
            className="mx-auto text-primary mb-4"
            strokeWidth={1}
          />
          <h3 className="font-heading text-2xl">
            {cards.length ? "No cards in this view" : "No gift cards yet"}
          </h3>
          <p className="text-sm text-muted-foreground my-4">
            Gift an experience, or add a card someone shared with you.
          </p>
          <Link
            href="/gifting"
            className="text-xs uppercase tracking-[0.15em] text-primary underline underline-offset-4"
          >
            Discover Experience Cards
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {visible.map((card) => {
            const paid = card.paymentStatus === "paid";
            const reserved = card.balancePaise - card.availablePaise;
            return (
              <article
                key={card.id}
                className="border bg-card p-4 sm:p-5 min-w-0"
              >
                <DigitalGiftCard
                  amount={card.amountPaise / 100}
                  recipientName={card.recipientName}
                  senderName={card.senderName}
                  message={card.message}
                  suffix={card.code?.slice(-4)}
                  status={
                    !paid
                      ? "pending"
                      : card.balancePaise === 0
                        ? "spent"
                        : "active"
                  }
                  compact
                />
                <div className="flex justify-between flex-wrap gap-2 mt-5">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                      For
                    </p>
                    <p className="text-sm mt-1 break-words">
                      {card.recipientName}
                      {card.recipientEmail && (
                        <span className="text-muted-foreground block break-all text-xs mt-1">
                          {card.recipientEmail}
                        </span>
                      )}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {new Date(card.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="h-fit bg-primary/5 text-primary px-2 py-1 text-[9px] uppercase tracking-widest">
                    {!paid
                      ? card.paymentStatus === "authorized"
                        ? "Confirming payment"
                        : "Payment pending"
                      : card.balancePaise === 0
                        ? "Fully used"
                        : card.isMine
                          ? "In your account"
                          : card.isClaimed
                            ? "Claimed by recipient"
                            : "Ready to gift"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-5">
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Value
                    </p>
                    <p className="font-heading text-2xl mt-1">
                      {formatGiftCardAmount(card.amountPaise)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Available balance
                    </p>
                    <p className="font-heading text-2xl text-primary mt-1">
                      {paid ? formatGiftCardAmount(card.availablePaise) : "—"}
                    </p>
                  </div>
                </div>
                {paid && reserved > 0 && (
                  <p className="text-xs bg-secondary/50 p-3 mt-4">
                    {formatGiftCardAmount(reserved)} reserved for a pending
                    order.{" "}
                    {card.isMine && (
                      <Link href="/checkout" className="text-primary underline">
                        Resume checkout
                      </Link>
                    )}
                  </p>
                )}
                {paid && card.code && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                      Secure card code
                    </p>
                    <div className="flex items-center gap-2 bg-background border p-2.5">
                      <code className="flex-1 text-[10px] sm:text-xs text-primary break-all select-all">
                        {card.code}
                      </code>
                      <button
                        type="button"
                        aria-label={`Copy gift card code for ${card.recipientName}`}
                        onClick={() => copy(card.code!)}
                        className="text-muted-foreground hover:text-primary shrink-0"
                      >
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2">
                      {card.isMine
                        ? "Your card is claimed and ready to use at checkout."
                        : card.isClaimed
                          ? "This card has been claimed by its recipient."
                          : "Share this code privately. The first account to claim it owns the card."}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {!card.isClaimed && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => share(card)}
                        >
                          <Share2 size={13} />
                          Share card
                        </Button>
                      )}
                      {card.isMine && card.availablePaise > 0 && (
                        <Button asChild size="sm" variant="outline">
                          <Link href="/collection">Find your piece</Link>
                        </Button>
                      )}
                      {card.isPurchased &&
                        card.recipientEmail &&
                        !card.emailDelivered && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            disabled={Boolean(busy)}
                            onClick={() => retryDelivery(card.id)}
                          >
                            Retry email delivery
                          </Button>
                        )}
                    </div>
                  </div>
                )}
                {!paid && card.isPurchased && (
                  <div className="border-t pt-4 mt-4">
                    <p className="text-xs text-muted-foreground">
                      Your code becomes available after payment capture. No
                      balance is issued before then.
                    </p>
                    {card.paymentStatus !== "authorized" && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-3"
                        disabled={Boolean(busy)}
                        onClick={() => resume(card)}
                      >
                        {busy === card.id ? (
                          <Loader2 className="animate-spin" size={14} />
                        ) : (
                          "Resume payment"
                        )}
                      </Button>
                    )}
                  </div>
                )}
                {card.transactions.length > 0 && (
                  <details className="border-t mt-5 pt-4">
                    <summary className="text-xs cursor-pointer text-primary">
                      Balance history
                    </summary>
                    <ul className="mt-3 divide-y">
                      {card.transactions.map((transaction) => (
                        <li
                          key={transaction.id}
                          className="py-3 flex justify-between gap-3 text-xs"
                        >
                          <div>
                            <p>
                              {transaction.type === "purchase"
                                ? "Card activated"
                                : "Used for an order"}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              {new Date(
                                transaction.createdAt,
                              ).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                          <div className="text-right">
                            <p>
                              {formatGiftCardAmount(transaction.amountPaise)}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-1">
                              Balance{" "}
                              {formatGiftCardAmount(
                                transaction.balanceAfterPaise,
                              )}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
