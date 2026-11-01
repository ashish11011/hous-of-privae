"use client";
import { useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  Calendar,
  Gift,
  Heart,
  LogOut,
  MapPin,
  Package,
  Ruler,
  Scissors,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { Signout } from "@/src/hepler/auth";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import AccountGiftCards from "@/components/gift-cards/AccountGiftCards";
import AddressBook from "@/components/account/AddressBook";
import Measurements from "@/components/account/Measurements";
import Dossier from "@/components/account/Dossier";
import CirclePanel from "@/components/account/CirclePanel";
import {
  AppointmentPanel,
  BespokePanel,
  ReferralPanel,
  StylistPanel,
  WishlistPanel,
} from "@/components/account/DiscoverPanels";
import {
  accountAction,
  accountDate,
  accountMoney,
  EmptyState,
  StatCard,
  useAccount,
} from "@/components/account/shared";
import { CIRCLE_TIERS, circleProgress } from "@/lib/account/rules";
import type { AccountOrder, Circle } from "@/lib/account/types";
export type ProfileUser = {
  name: string | null;
  email: string;
  number: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  loyaltyPoints: number;
};
const tabs = [
  { key: "overview", label: "Overview", icon: Sparkles },
  { key: "foryou", label: "For You", icon: Sparkles },
  { key: "orders", label: "Orders", icon: Package },
  { key: "circle", label: "Privae Circle", icon: Sparkles },
  { key: "referrals", label: "Refer a Friend", icon: Gift },
  { key: "giftcards", label: "Gift Cards", icon: Gift },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "appointments", label: "Appointments", icon: Calendar },
  { key: "bespoke", label: "Bespoke", icon: Scissors },
  { key: "measurements", label: "Measurements", icon: Ruler },
  { key: "profile", label: "Profile", icon: User },
] as const;
type Tab = (typeof tabs)[number]["key"];
export default function ProfileDashboard({
  userData,
  orders,
  appointments,
  isAdmin = false,
}: {
  userData: ProfileUser;
  orders: AccountOrder[];
  appointments: { id: string; service: string; scheduled: string }[];
  isAdmin?: boolean;
}) {
  const [tab, setTab] = useState<Tab>("overview");
  const [name, setName] = useState(
    userData.name || userData.email.split("@")[0] || "Friend",
  );
  const [mounted, setMounted] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(160);
  const [counts, setCounts] = useState({
    addresses: 0,
    measurements: 0,
    appointments: appointments.length,
  });
  const overview = useAccount<typeof counts>("overview");
  const circleState = useAccount<Circle>("circle");
  const wishlist = userWishlistStore((state) => state.productWishlist.length);
  useEffect(() => {
    setMounted(true);
    function readTab() {
      const hash = window.location.hash.slice(1);
      const key = hash === "gift-cards" ? "giftcards" : hash;
      if (tabs.some((row) => row.key === key)) setTab(key as Tab);
    }
    readTab();
    window.addEventListener("hashchange", readTab);
    const header = document.querySelector("[data-storefront-header]");
    const observer = new ResizeObserver(() => {
      if (header) setHeaderHeight(header.getBoundingClientRect().height);
    });
    if (header) {
      setHeaderHeight(header.getBoundingClientRect().height);
      observer.observe(header);
    }
    return () => {
      window.removeEventListener("hashchange", readTab);
      observer.disconnect();
    };
  }, []);
  useEffect(() => {
    if (overview.data) setCounts(overview.data);
  }, [overview.data]);
  function selectTab(key: Tab) {
    setTab(key);
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${key === "giftcards" ? "gift-cards" : key}`,
    );
  }
  function keys(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    selectTab(tabs[next].key);
    document.getElementById(`account-tab-${tabs[next].key}`)?.focus();
  }
  const circle = circleState.data;
  const progress = circle ?? circleProgress(0);
  const points = circle?.availablePoints ?? userData.loyaltyPoints;
  const displayName = name
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
  const count: Record<string, number> = {
    orders: orders.length,
    wishlist: mounted ? wishlist : 0,
    ...counts,
  };
  return (
    <main className="account-dashboard min-h-screen bg-background font-body">
      <section className="bg-primary text-primary-foreground">
        <div className="account-container py-10 md:py-14">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase text-white/70 mb-2">
                My Account
              </p>
              <h1 className="font-heading text-3xl md:text-5xl">
                Greetings, {displayName}
              </h1>
              <p className="text-sm text-white/80 mt-2">{userData.email}</p>
            </div>
            <div className="self-start md:self-end flex items-center gap-2">
              {isAdmin && (
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] border border-white/30 px-4 py-2 hover:bg-white/10"
                >
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              <button
                type="button"
                onClick={Signout}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] border border-white/30 px-4 py-2 hover:bg-white/10"
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          </div>
          <div className="mt-8 border border-white/20 bg-white/10 p-4 md:p-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/60">
                  Privae Circle
                </p>
                <p className="font-heading text-2xl md:text-3xl mt-1">
                  {progress.current.name}{" "}
                  <span className="text-base text-white/70">
                    — {points.toLocaleString("en-IN")} available pts
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => selectTab("circle")}
                className="text-[11px] uppercase font-bold underline underline-offset-4 self-start md:self-auto"
              >
                View benefits →
              </button>
            </div>
            {progress.next && (
              <div className="mt-4">
                <div
                  role="progressbar"
                  aria-label="Progress to next Circle tier"
                  aria-valuenow={Math.round(progress.percent)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="h-1.5 bg-white/15 overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all"
                    style={{ width: `${progress.percent}%` }}
                  />
                </div>
                <p className="text-[11px] text-white/70 mt-2">
                  {accountMoney(progress.remaining)} eligible spend to{" "}
                  <span className="text-white">{progress.next.name}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
      <div
        className="sticky z-30 border-b bg-background border-border"
        style={{ top: headerHeight }}
      >
        <div className="account-container overflow-x-auto">
          <div
            role="tablist"
            aria-label="Account sections"
            className="flex gap-1 md:gap-2 min-w-max"
          >
            {tabs.map((item, index) => {
              const active = tab === item.key;
              return (
                <button
                  type="button"
                  key={item.key}
                  role="tab"
                  id={`account-tab-${item.key}`}
                  aria-controls={`account-panel-${item.key}`}
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onKeyDown={(event) => keys(event, index)}
                  onClick={() => selectTab(item.key)}
                  className={`flex items-center gap-1.5 px-3 md:px-4 py-3 text-[11px] uppercase tracking-[0.15em] border-b-2 transition-colors whitespace-nowrap ${active ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <span
                    className={`inline-flex size-6 rounded-full items-center justify-center ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}
                  >
                    <item.icon size={14} />
                  </span>
                  {item.label}
                  {count[item.key] > 0 && (
                    <span
                      className={`text-[10px] px-1.5 ${active ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}
                    >
                      {count[item.key]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      <div className="account-container py-10 md:py-14">
        <div
          role="tabpanel"
          id={`account-panel-${tab}`}
          aria-labelledby={`account-tab-${tab}`}
          tabIndex={0}
        >
          {tab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {[
                  {
                    label: "Available Points",
                    value: points.toLocaleString("en-IN"),
                  },
                  { label: "Orders", value: String(orders.length) },
                  {
                    label: "Wishlist",
                    value: mounted ? String(wishlist) : "—",
                  },
                  { label: "Appointments", value: String(counts.appointments) },
                ].map((stat) => (
                  <StatCard key={stat.label} {...stat} />
                ))}
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <section className="bg-card p-6">
                  <h2 className="font-heading text-xl mb-3">
                    All Privae Circle tiers
                  </h2>
                  <div className="space-y-3">
                    {CIRCLE_TIERS.map((tier) => (
                      <div
                        key={tier.key}
                        className="flex items-start justify-between gap-3 border-b pb-3 last:border-0"
                      >
                        <div>
                          <p className="text-sm">{tier.name}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {tier.perks.slice(0, 2).join(" • ")}
                          </p>
                        </div>
                        <p className="text-xs text-muted-foreground whitespace-nowrap">
                          {tier.spendLabel}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
                <section className="bg-card p-6">
                  <h2 className="font-heading text-xl mb-3">
                    Most recent order
                  </h2>
                  {orders[0] ? (
                    <div>
                      <p className="text-sm">#{orders[0].id}</p>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {orders[0].status.replaceAll("_", " ")}
                      </p>
                      <p className="font-heading text-2xl text-primary mt-3">
                        {accountMoney(orders[0].totalAmount ?? 0)}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {accountDate(orders[0].createdAt)}
                      </p>
                      <Link
                        href={`/track?orderid=${orders[0].id}`}
                        className="inline-block text-xs text-primary underline mt-4"
                      >
                        Track your order →
                      </Link>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No orders yet.{" "}
                      <Link
                        href="/collection"
                        className="text-primary underline"
                      >
                        Start exploring →
                      </Link>
                    </p>
                  )}
                </section>
              </div>
            </div>
          )}
          {tab === "foryou" && <StylistPanel />}
          {tab === "orders" &&
            (orders.length ? (
              <div className="space-y-4">
                {orders.map((order) => (
                  <article key={order.id} className="bg-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Order #{order.id}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-1">
                          {accountDate(order.createdAt)}
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-[0.15em] bg-secondary px-2 py-1">
                        {order.status.replaceAll("_", " ")}
                      </span>
                      <p className="font-heading text-xl text-primary">
                        {accountMoney(order.totalAmount ?? 0)}
                      </p>
                    </div>
                    {order.items.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {order.items.map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3 text-sm"
                          >
                            {item.image && (
                              <img
                                src={item.image}
                                alt=""
                                className="size-12 object-cover"
                              />
                            )}
                            <div className="flex-1">
                              <p>{item.name}</p>
                              <p className="text-[11px] text-muted-foreground">
                                Qty {item.quantity}
                                {item.size ? ` • ${item.size}` : ""}
                                {item.color ? ` • ${item.color}` : ""}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {accountMoney(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    <Link
                      href={`/track?orderid=${order.id}`}
                      className="inline-block text-[11px] text-primary underline mt-4"
                    >
                      Track your order →
                    </Link>
                    {order.pointsPending > 0 &&
                      !["returned", "cancelled"].includes(order.status) && (
                        <p className="text-[11px] text-muted-foreground mt-2">
                          {order.pointsPending.toLocaleString("en-IN")} Circle
                          Points · available five days after delivery
                        </p>
                      )}
                  </article>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Package />}
                title="No orders yet"
                body="Your orders will appear here once you make your first purchase."
              >
                <Link href="/collection" className={accountAction}>
                  Shop Collections
                </Link>
              </EmptyState>
            ))}
          {tab === "circle" && (
            <CirclePanel onUpdated={(value) => circleState.setData(value)} />
          )}
          {tab === "referrals" && <ReferralPanel />}
          {tab === "giftcards" && <AccountGiftCards />}
          {tab === "wishlist" && <WishlistPanel />}
          {tab === "addresses" && (
            <AddressBook
              onChange={(value) =>
                setCounts((current) => ({ ...current, addresses: value }))
              }
            />
          )}
          {tab === "appointments" && (
            <AppointmentPanel
              onCount={(value) =>
                setCounts((current) => ({ ...current, appointments: value }))
              }
            />
          )}
          {tab === "bespoke" && <BespokePanel />}
          {tab === "measurements" && (
            <Measurements
              onChange={(value) =>
                setCounts((current) => ({ ...current, measurements: value }))
              }
            />
          )}
          {tab === "profile" && (
            <Dossier
              onMeasurements={() => selectTab("measurements")}
              onSaved={setName}
            />
          )}
        </div>
      </div>
    </main>
  );
}
