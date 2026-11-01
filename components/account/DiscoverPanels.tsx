"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Check,
  Copy,
  Gift,
  Heart,
  RefreshCw,
  Scissors,
  Share2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import ProductCard from "@/components/ProductCard";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import type { ProductRecord } from "@/lib/productAdapter";
import type { Appointment, Bespoke } from "@/lib/account/types";
import { BESPOKE_LABELS, BESPOKE_STAGES } from "@/lib/account/rules";
import {
  AccountState,
  accountAction,
  accountDate,
  accountMoney,
  accountRequest,
  EmptyState,
  useAccount,
} from "./shared";
export function StylistPanel() {
  const state = useAccount<{ products: ProductRecord[]; generatedAt: string }>(
    "stylist",
  );
  const [refreshing, setRefreshing] = useState(false);
  async function refresh() {
    setRefreshing(true);
    try {
      const edit = await accountRequest<typeof state.data>("stylist", {});
      state.setData(edit);
      toast.success(
        "Your stylist’s edit is ready. Edits refresh at most once an hour.",
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setRefreshing(false);
    }
  }
  return (
    <div className="space-y-8">
      <header className="text-center space-y-3 pb-4 border-b border-primary/15">
        <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-primary/70">
          <Sparkles size={12} />
          Privae Atelier
          <Sparkles size={12} />
        </p>
        <h2 className="font-heading text-3xl md:text-4xl text-primary">
          The Stylist’s Edit
        </h2>
        <p className="text-sm text-muted-foreground italic">
          An edit curated from your fit preferences, wishlist, and discoveries.
        </p>
        <button
          type="button"
          onClick={refresh}
          disabled={state.loading || refreshing || Boolean(state.error)}
          className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary/70 hover:text-primary disabled:opacity-50"
        >
          <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Curating" : "Refresh edit"}
        </button>
      </header>
      <AccountState {...state} retry={state.reload}>
        {state.data?.products.length ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-10 md:gap-x-6 md:gap-y-12">
              {state.data.products.map((product) => (
                <ProductCard
                  key={product.variantId ?? product.id}
                  product={product}
                />
              ))}
            </div>
            <p className="text-center text-[10px] uppercase tracking-[0.25em] text-muted-foreground/60 pt-4">
              Curated {accountDate(state.data.generatedAt)}
            </p>
          </>
        ) : (
          <EmptyState
            icon={<Sparkles />}
            title="Your edit is still being shaped."
            body="Add a few pieces to your wishlist or share your fit preferences so the atelier can curate with intent."
          />
        )}
      </AccountState>
    </div>
  );
}
export function WishlistPanel() {
  const state = useAccount<{ products: ProductRecord[]; ids: string[] }>(
    "wishlist",
  );
  const saved = userWishlistStore((current) => current.productWishlist);
  useEffect(() => {
    const refresh = () => {
      void state.reload();
    };
    window.addEventListener("hop-wishlist-synced", refresh);
    return () => window.removeEventListener("hop-wishlist-synced", refresh);
  }, [state.reload]);
  const products =
    state.data?.products.filter((product) =>
      saved.some((item) => item.id === product.variantId),
    ) ?? [];
  return (
    <AccountState {...state} retry={state.reload}>
      {products.length ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.variantId ?? product.id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Heart />}
          title="Your wishlist is empty"
          body="Save pieces you love for later."
        >
          <Link href="/collection" className={accountAction}>
            Browse Collections
          </Link>
        </EmptyState>
      )}
    </AccountState>
  );
}
export function ReferralPanel() {
  const state = useAccount<{
    code: string;
    totalReferred: number;
    creditEarned: number;
    pending: number;
  }>("referrals");
  const link =
    state.data && typeof window !== "undefined"
      ? `${window.location.origin}/?ref=${state.data.code}`
      : "";
  async function share(copyOnly = false) {
    try {
      if (!copyOnly && navigator.share)
        await navigator.share({
          title: "Haus of Privae",
          text: "Discover Haus of Privae with me. After your first order, we both receive ₹2,000 wardrobe credit in Circle Points.",
          url: link,
        });
      else {
        await navigator.clipboard.writeText(link);
        toast.success("Referral link copied.");
      }
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError"))
        toast.error("Unable to share. You can select and copy your link.");
    }
  }
  return (
    <AccountState {...state} retry={state.reload}>
      <div className="space-y-6 max-w-2xl">
        <section className="bg-card p-6 md:p-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex size-10 rounded-full bg-primary text-white items-center justify-center">
              <Gift size={18} strokeWidth={1.5} />
            </span>
            <h2 className="font-heading text-2xl">Refer a friend</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5">
            Share your link. When a friend joins and places their first order,
            you both receive{" "}
            <span className="text-foreground">₹2,000 wardrobe credit</span>.
          </p>
          <div className="flex gap-2 items-center bg-background border p-3 mb-4">
            <p className="flex-1 text-sm truncate select-all">{link}</p>
            <button
              type="button"
              onClick={() => share(true)}
              aria-label="Copy referral link"
              className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"
            >
              <Copy size={14} />
            </button>
            <button
              type="button"
              onClick={() => share()}
              aria-label="Share referral link"
              className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center"
            >
              <Share2 size={14} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="border p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Friends referred
              </p>
              <p className="font-heading text-3xl mt-1">
                {state.data?.totalReferred ?? 0}
              </p>
            </div>
            <div className="border p-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                Credit earned
              </p>
              <p className="font-heading text-3xl text-primary mt-1">
                {accountMoney(state.data?.creditEarned ?? 0)}
              </p>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground mt-4">
            Each ₹2,000 credit is 20,000 Circle Points, added automatically
            after the first successful garment order. Normal redemption and
            expiry rules apply. Returned orders reverse the credit.
          </p>
        </section>
        <section className="bg-card p-6">
          <h3 className="font-heading text-lg mb-3">How it works</h3>
          <ol className="space-y-3">
            {[
              "Share your unique referral link with friends and family.",
              "Your friend follows it, joins, and places their first order.",
              "You both receive ₹2,000 wardrobe credit in your Circle balance.",
            ].map((text, index) => (
              <li key={text} className="flex gap-3 text-sm">
                <span className="inline-flex size-6 rounded-full bg-primary text-white items-center justify-center text-[11px] shrink-0">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>
        </section>
      </div>
    </AccountState>
  );
}
export function AppointmentPanel({
  onCount,
}: {
  onCount: (count: number) => void;
}) {
  const state = useAccount<Appointment[]>("appointments");
  const [busy, setBusy] = useState("");
  async function cancel(id: string) {
    setBusy(id);
    try {
      await accountRequest("appointments", { id }, "DELETE");
      const rows = await state.reload({ throwOnError: true });
      onCount(rows?.length ?? 0);
      toast.success("Appointment cancelled.");
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy("");
    }
  }
  return (
    <AccountState {...state} retry={state.reload}>
      {state.data?.length ? (
        <div className="space-y-3">
          <div className="text-right">
            <Link href="/appointment" className={accountAction}>
              Book Studio Appointment
            </Link>
          </div>
          {state.data.map((appointment) => (
            <article
              key={appointment.id}
              className="bg-card p-5 flex justify-between gap-3"
            >
              <div>
                <p className="text-sm">{appointment.service}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {accountDate(appointment.scheduledFor, true)}
                </p>
                {appointment.notes && (
                  <p className="text-xs text-muted-foreground mt-1 italic whitespace-pre-wrap">
                    {appointment.notes}
                  </p>
                )}
                {["requested", "confirmed"].includes(appointment.status) &&
                  new Date(appointment.scheduledFor).getTime() > Date.now() &&
                  !appointment.id.startsWith("legacy:") && (
                    <button
                      type="button"
                      disabled={Boolean(busy)}
                      onClick={() => cancel(appointment.id)}
                      className="text-[10px] uppercase tracking-widest text-muted-foreground underline mt-4"
                    >
                      {busy === appointment.id
                        ? "Cancelling…"
                        : "Cancel appointment"}
                    </button>
                  )}
              </div>
              <span className="h-fit text-[10px] uppercase tracking-[0.15em] bg-secondary px-2 py-1">
                {appointment.status}
              </span>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar />}
          title="No appointments booked"
          body="Book a private session at our Jaipur studio."
        >
          <Link href="/appointment" className={accountAction}>
            Book Studio Appointment
          </Link>
        </EmptyState>
      )}
    </AccountState>
  );
}
export function BespokePanel() {
  const state = useAccount<Bespoke[]>("bespoke");
  return (
    <AccountState {...state} retry={state.reload}>
      {state.data?.length ? (
        <div className="space-y-3">
          {state.data.map((request) => (
            <details key={request.id} className="bg-card border">
              <summary className="p-5 cursor-pointer flex justify-between gap-3">
                <div>
                  <p className="text-sm">{request.garmentType}</p>
                  {request.occasion && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {request.occasion}
                    </p>
                  )}
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Submitted {accountDate(request.createdAt)}
                  </p>
                  <p className="text-xs text-primary mt-1.5">
                    Current stage:{" "}
                    {BESPOKE_LABELS[
                      request.currentMilestone as keyof typeof BESPOKE_LABELS
                    ] ?? request.currentMilestone}
                  </p>
                  {request.estimatedDeliveryDate && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Estimated delivery:{" "}
                      {accountDate(request.estimatedDeliveryDate)}
                    </p>
                  )}
                </div>
                <span className="h-fit text-[10px] uppercase tracking-[0.15em] bg-secondary px-2 py-1">
                  {request.status.replaceAll("_", " ")}
                </span>
              </summary>
              <div className="border-t p-5">
                <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Production Timeline
                </p>
                <div className="flex gap-1 flex-wrap mb-6">
                  {BESPOKE_STAGES.map((stage) => (
                    <span
                      key={stage}
                      title={BESPOKE_LABELS[stage]}
                      className={`inline-flex size-5 rounded-full items-center justify-center ${request.milestones.some((row) => row.milestone === stage) ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}
                    >
                      <Check size={10} />
                    </span>
                  ))}
                </div>
                <ol className="border-l pl-5 space-y-4">
                  {request.milestones.map((milestone) => (
                    <li key={milestone.id}>
                      <p className="text-sm">
                        {BESPOKE_LABELS[
                          milestone.milestone as keyof typeof BESPOKE_LABELS
                        ] ?? milestone.milestone}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {accountDate(milestone.createdAt, true)}
                      </p>
                      {milestone.note && (
                        <p className="text-xs italic text-foreground/80 mt-1.5 whitespace-pre-wrap">
                          {milestone.note}
                        </p>
                      )}
                      {milestone.imageUrl && (
                        <a
                          href={milestone.imageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={milestone.imageUrl}
                            alt="Atelier progress"
                            className="mt-2 size-32 object-cover border"
                          />
                        </a>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            </details>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<Scissors />}
          title="No bespoke commissions yet"
          body="Begin a custom commission and follow every milestone — from fabric sourcing to dispatch."
        >
          <Link href="/bespoke" className={accountAction}>
            Start a Commission
          </Link>
        </EmptyState>
      )}
    </AccountState>
  );
}
