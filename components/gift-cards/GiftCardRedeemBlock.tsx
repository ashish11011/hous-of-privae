"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Check, Gift, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { giftCardRequest } from "@/lib/gift-cards/client";
import { formatGiftCardAmount } from "@/lib/gift-cards/validation";

export type AppliedGiftCard = {
  code: string;
  id: string;
  suffix: string;
  balancePaise: number;
};
export default function GiftCardRedeemBlock({
  applied,
  onChange,
  payablePaise,
  disabled,
}: {
  applied: AppliedGiftCard | null;
  onChange: (card: AppliedGiftCard | null) => void;
  payablePaise: number;
  disabled?: boolean;
}) {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  async function apply() {
    setBusy(true);
    try {
      const result = await giftCardRequest<{
        card: Omit<AppliedGiftCard, "code">;
      }>("/check", { code: code.trim() });
      onChange({ ...result.card, code: code.trim() });
      setCode("");
      setOpen(false);
      toast.success(
        "Gift card applied. Your balance will be checked again when you place the order.",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to apply this card.",
      );
    } finally {
      setBusy(false);
    }
  }
  if (applied) {
    const amount = Math.min(applied.balancePaise, payablePaise);
    return (
      <section className="border border-primary/20 p-4 flex items-center justify-between gap-3">
        <Check className="text-primary shrink-0" size={18} />
        <div className="flex-1 min-w-0">
          <p className="text-sm">Gift card •••• {applied.suffix}</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Applied {formatGiftCardAmount(amount)} · Balance after{" "}
            {formatGiftCardAmount(applied.balancePaise - amount)}
          </p>
        </div>
        <button
          type="button"
          aria-label="Remove gift card"
          disabled={disabled}
          onClick={() => onChange(null)}
        >
          <X size={16} />
        </button>
      </section>
    );
  }
  if (!open)
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="w-full border border-dashed p-3.5 flex items-center justify-center gap-2 text-xs tracking-[0.15em] uppercase font-body hover:border-primary hover:text-primary disabled:opacity-50"
      >
        <Gift size={14} />
        Apply a Gift Card
      </button>
    );
  return (
    <section className="border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <Label
          htmlFor="checkout-gift-code"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.15em]"
        >
          <Gift size={14} />
          Privae Experience Card
        </Label>
        <button
          type="button"
          aria-label="Close gift card entry"
          disabled={disabled || busy}
          onClick={() => setOpen(false)}
        >
          <X size={14} />
        </button>
      </div>
      {status === "unauthenticated" ? (
        <p className="text-xs text-muted-foreground">
          <Link
            href="/auth/login?callbackUrl=/checkout"
            className="text-primary underline"
          >
            Sign in
          </Link>{" "}
          to use your gift card.
        </p>
      ) : (
        <>
          <Input
            id="checkout-gift-code"
            placeholder="Enter your gift card code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            maxLength={80}
            autoComplete="off"
            className="font-mono text-xs"
            disabled={disabled || busy}
          />
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={apply}
            disabled={disabled || busy || !code.trim() || status === "loading"}
          >
            {busy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "Apply Gift Card"
            )}
          </Button>
          <p className="text-[10px] text-muted-foreground">
            Placing the order claims this card for your account. The remaining
            balance stays on your card.
          </p>
        </>
      )}
    </section>
  );
}
