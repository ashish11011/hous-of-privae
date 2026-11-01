"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Bell, Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Circle, StockAlert } from "@/lib/account/types";
import { CIRCLE_TIERS } from "@/lib/account/rules";
import {
  AccountState,
  accountDate,
  accountMoney,
  accountRequest,
  StatCard,
  useAccount,
} from "./shared";
export default function CirclePanel({
  onUpdated,
}: {
  onUpdated: (circle: Circle) => void;
}) {
  const state = useAccount<Circle>("circle");
  const alerts =
    useAccount<(StockAlert & { productName?: string; slug?: string })[]>(
      "stock-alerts",
    );
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);
  const attempt = useRef({ input: "", id: "" });
  async function send(event: React.FormEvent) {
    event.preventDefault();
    const input = `${email.toLowerCase().trim()}:${amount}`;
    if (attempt.current.input !== input)
      attempt.current = { input, id: crypto.randomUUID() };
    setSending(true);
    try {
      const result = await accountRequest<{ status: string }>("transfers", {
        id: attempt.current.id,
        email: email.trim(),
        points: Number(amount),
      });
      setEmail("");
      setAmount("");
      const circle = await state.reload({ throwOnError: true });
      if (circle) onUpdated(circle);
      toast.success(
        result.status === "claimed"
          ? "Circle Points sent."
          : "Circle Points reserved until they join with this email.",
      );
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setSending(false);
    }
  }
  async function removeAlert(id: string) {
    try {
      await accountRequest("stock-alerts", { id }, "DELETE");
      await alerts.reload({ throwOnError: true });
    } catch (error) {
      toast.error((error as Error).message);
    }
  }
  const circle = state.data;
  return (
    <AccountState {...state} retry={state.reload}>
      {circle && (
        <div className="space-y-8">
          <section className="bg-card p-6 md:p-8">
            <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
              Current Tier
            </p>
            <div className="flex items-end justify-between gap-4 mt-2 flex-wrap">
              <h2 className="font-heading text-3xl md:text-4xl">
                {circle.current.name}
              </h2>
              <p className="font-heading text-2xl text-primary">
                {circle.availablePoints.toLocaleString("en-IN")}{" "}
                <span className="text-sm text-muted-foreground font-body">
                  pts
                </span>
              </p>
            </div>
            {circle.next ? (
              <div className="mt-5">
                <div className="h-1.5 bg-secondary overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${circle.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-muted-foreground mt-2">
                  {accountMoney(circle.remaining)} eligible spend to{" "}
                  <span className="text-foreground">{circle.next.name}</span>
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-primary mt-3">
                You’ve reached our highest tier — thank you.
              </p>
            )}
            <div className="mt-5 pt-5 border-t">
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Your perks
              </p>
              <ul className="space-y-1.5">
                {circle.current.perks.map((perk) => (
                  <li key={perk} className="text-sm flex gap-2">
                    <span className="text-primary">•</span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
              <StatCard
                label="Available"
                value={`${circle.availablePoints.toLocaleString("en-IN")} pts`}
              />
              <StatCard
                label="Pending"
                value={`${circle.pendingPoints.toLocaleString("en-IN")} pts`}
              />
              <StatCard
                label="Expiring soon"
                value={`${circle.expiringPoints.toLocaleString("en-IN")} pts`}
              />
              <StatCard
                label="24-month spend"
                value={accountMoney(circle.qualifyingSpend)}
              />
            </div>
            {circle.nextExpiry && (
              <p className="text-[11px] text-muted-foreground mt-3">
                Next expiry: {accountDate(circle.nextExpiry)}
              </p>
            )}
            <p className="text-[11px] text-muted-foreground mt-2">
              Your {circle.current.name} rate is {circle.current.multiplier}×:
              ₹1 spent earns {circle.current.multiplier} point
              {circle.current.multiplier === 1 ? "" : "s"}.
            </p>
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
              Eligible programme purchases qualify five days after delivery and
              determine your tier for 24 months. Points expire 24 months after
              they become available. Existing balances retain their original
              expiry.
            </p>
            {circle.adjustmentPoints > 0 && (
              <p className="text-xs text-primary mt-3">
                {circle.adjustmentPoints.toLocaleString("en-IN")} points are
                awaiting adjustment after a return. Future credits first cover
                this adjustment.
              </p>
            )}
          </section>
          <section className="border-t pt-6">
            <h3 className="font-heading text-2xl mb-3">
              Your milestone bonuses
            </h3>
            <p className="text-xs text-muted-foreground mb-5">
              Additional to normal points. Each tier has its own cumulative
              ₹50,000 counter, starting with new purchases under this programme.
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  name: "Lumiere",
                  rate: "2.5%",
                  spend: circle.lumiereMilestoneSpend,
                  points: 12500,
                },
                {
                  name: "Royale",
                  rate: "5%",
                  spend: circle.royaleMilestoneSpend,
                  points: 25000,
                },
              ].map((tier) => (
                <div key={tier.name} className="border p-5">
                  <h4 className="font-heading text-xl">
                    {tier.name} · {tier.rate}
                  </h4>
                  <p className="text-sm text-primary mt-2">
                    {tier.points.toLocaleString("en-IN")} bonus points per
                    ₹50,000
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {Math.floor(tier.spend / 50000)} milestones ·{" "}
                    {accountMoney(tier.spend)} qualifying purchases
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {accountMoney(50000 - (tier.spend % 50000))} to the next
                    milestone in this tier
                  </p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
              Smaller purchases count together in the tier held when you place
              an order. Bonuses become available after the five-day return
              window and expire 24 months later. Returns may reverse a
              milestone. Royale earns its 5% bonus instead of the Lumiere bonus.
            </p>
          </section>
          <section className="bg-card border p-6 md:p-8">
            <div className="flex justify-between items-start gap-5 flex-wrap">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
                  Share the Circle
                </p>
                <h3 className="font-heading text-2xl mt-1">
                  Send Circle Points
                </h3>
              </div>
              <div className="text-right">
                <p className="font-heading text-3xl text-primary">
                  {circle.availablePoints.toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Available Circle Points
                </p>
              </div>
            </div>
            <form
              onSubmit={send}
              className="grid md:grid-cols-[minmax(0,1fr)_170px_auto] gap-4 items-end mt-6"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="circle-recipient"
                  className="text-[11px] uppercase tracking-[0.12em]"
                >
                  Member email
                </Label>
                <Input
                  id="circle-recipient"
                  required
                  type="email"
                  maxLength={254}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="circle-transfer-points"
                  className="text-[11px] uppercase tracking-[0.12em]"
                >
                  Points
                </Label>
                <Input
                  id="circle-transfer-points"
                  required
                  type="number"
                  min={1000}
                  max={circle.availablePoints}
                  step={1}
                  value={amount}
                  onChange={(event) => setAmount(event.target.value)}
                  placeholder="1,000"
                />
              </div>
              <button
                type="submit"
                disabled={sending || circle.availablePoints < 1000}
                className="bg-primary text-white px-5 h-9 text-[11px] uppercase tracking-[0.12em] inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                Send Circle Points
              </button>
            </form>
            <p className="text-[11px] text-muted-foreground mt-3">
              Minimum 1,000 points. If they aren’t a member yet, points are
              reserved until they join with this email. Original expiry dates
              apply.
            </p>
            {circle.transfers.length > 0 && (
              <div className="mt-6 pt-5 border-t">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                  Recently sent
                </p>
                <div className="divide-y">
                  {circle.transfers.slice(0, 4).map((transfer) => (
                    <div
                      key={transfer.id}
                      className="flex justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="text-sm truncate">
                          {transfer.recipientEmail}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {transfer.status === "pending"
                            ? "Awaiting membership"
                            : transfer.status === "claimed"
                              ? "Received"
                              : "Expired"}{" "}
                          · {accountDate(transfer.createdAt)}
                        </p>
                      </div>
                      <p className="font-heading text-base whitespace-nowrap">
                        {transfer.points.toLocaleString("en-IN")} pts
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
          <section className="bg-card p-6">
            <h3 className="font-heading text-xl mb-4">All tiers</h3>
            <div className="space-y-4">
              {CIRCLE_TIERS.map((tier) => (
                <div
                  key={tier.key}
                  className={`border-l-2 pl-4 ${tier.key === circle.current.key ? "border-primary" : "border-border"}`}
                >
                  <div className="flex items-baseline justify-between gap-3 flex-wrap">
                    <p className="font-heading text-lg">{tier.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {tier.spendLabel}
                    </p>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {tier.perks.join(" • ")}
                  </p>
                </div>
              ))}
            </div>
          </section>
          <section className="bg-card p-6">
            <h3 className="font-heading text-xl mb-4">Points history</h3>
            {!circle.entries.length ? (
              <p className="text-sm text-muted-foreground">
                You haven’t earned points yet. Muse members earn 1 point for
                every ₹1 of eligible spend.{" "}
                <Link href="/collection" className="text-primary underline">
                  Explore the collection
                </Link>
              </p>
            ) : (
              <div className="divide-y">
                {circle.entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex justify-between gap-4 py-3"
                  >
                    <div>
                      <p className="text-sm">{entry.description}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {accountDate(entry.createdAt)}
                      </p>
                    </div>
                    <p
                      className={`font-heading text-lg whitespace-nowrap ${entry.points > 0 ? "text-primary" : "text-muted-foreground"}`}
                    >
                      {entry.points > 0 ? "+" : ""}
                      {entry.points.toLocaleString("en-IN")} pts
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className="bg-card p-6">
            <h3 className="font-heading text-xl mb-2 flex items-center gap-2">
              <Bell size={16} />
              Back-in-stock alerts
            </h3>
            <AccountState {...alerts} retry={alerts.reload}>
              {!alerts.data?.length ? (
                <p className="text-sm text-muted-foreground">
                  You aren’t tracking any pieces yet. On a sold-out product, tap
                  “Notify me” to hear from the atelier.
                </p>
              ) : (
                <div className="divide-y">
                  {alerts.data.map((alert) => (
                    <div
                      key={alert.id}
                      className="flex justify-between items-center gap-3 py-3"
                    >
                      <div>
                        <Link
                          href={`/product/${alert.slug ?? alert.productId}`}
                          className="text-sm hover:text-primary hover:underline"
                        >
                          {alert.productName || alert.productId}
                        </Link>
                        {alert.size && (
                          <span className="text-[11px] text-muted-foreground ml-2">
                            Size {alert.size}
                          </span>
                        )}
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {alert.notifiedAt
                            ? `Notification sent ${accountDate(alert.notifiedAt)}`
                            : "Watching for availability"}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAlert(alert.id)}
                        className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </AccountState>
          </section>
        </div>
      )}
    </AccountState>
  );
}
