"use client";

import { useEffect, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { CalendarDays, Gem, Heart, LayoutGrid, LogOut, MapPin, Package } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Signout } from "@/src/hepler/auth";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import { loyaltyPointsToRupees } from "@/lib/loyaltyRewards";
import AddressForm from "./AddressForm";

export type ProfileUser = {
  name: string | null; email: string; number: string | null;
  addressLine1: string | null; addressLine2: string | null;
  city: string | null; state: string | null; pincode: string | null; loyaltyPoints: number;
};
type Order = { id: string; status: string; totalAmountPaid: number | null; createdAt: string };
type Appointment = { id: string; service: string; scheduled: string };
const tabs = [
  { label: "Overview", icon: LayoutGrid }, { label: "Orders", icon: Package },
  { label: "Privae Circle", icon: Gem }, { label: "Wishlist", icon: Heart },
  { label: "Addresses", icon: MapPin }, { label: "Appointments", icon: CalendarDays },
] as const;
type Tab = typeof tabs[number]["label"];
const tiers = [
  { name: "Member", min: 0, range: "Welcome to Privae Circle", benefits: "Free shipping on every order · Birthday gift" },
  { name: "Éclat", min: 50000, range: "50,000–99,999 pts", benefits: "Welcome gift · Early access to new launches" },
  { name: "Lumière", min: 100000, range: "1,00,000–1,99,999 pts", benefits: "All Éclat perks · Alterations on every order" },
  { name: "Royale", min: 200000, range: "2,00,000 pts and above", benefits: "All Lumière perks · Private trunk shows" },
];
const format = (value: number) => value.toLocaleString("en-IN");
const linkStyle = "text-primary underline underline-offset-4 hover:opacity-75";

function TierTable() {
  return <section className="bg-secondary/50 p-6 sm:p-7">
    <h2 className="text-xl mb-3">All Privae Circle tiers</h2>
    <ul className="divide-y divide-border">{tiers.map(tier => <li key={tier.name} className="py-3">
      <div className="flex flex-wrap justify-between gap-1 text-xs"><span className="font-medium">{tier.name}</span><span className="text-muted-foreground text-[10px]">{tier.range}</span></div>
      <p className="text-[11px] text-muted-foreground mt-1">{tier.benefits}</p>
    </li>)}</ul>
  </section>;
}

function OrderSummary({ order }: { order: Order }) {
  return <div className="space-y-4 text-sm">
    <div className="flex flex-wrap justify-between gap-3">
      <p className="font-medium">Order #{order.id.slice(0, 8).toUpperCase()}</p>
      <span className="bg-primary/10 text-primary px-3 py-1 text-[10px] tracking-wider uppercase">{order.status.replace(/_/g, " ")}</span>
    </div>
    <p className="text-muted-foreground">{new Date(order.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })}</p>
    <p>{order.totalAmountPaid === null ? "Payment pending" : `₹${format(order.totalAmountPaid)}`}</p>
    <Link href="/track" className={linkStyle}>Track your order →</Link>
  </div>;
}

export default function ProfileDashboard({ userData, orders, appointments }: {
  userData: ProfileUser; orders: Order[]; appointments: Appointment[];
}) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [mounted, setMounted] = useState(false);
  const wishlistCount = userWishlistStore(state => state.productWishlist.length);
  useEffect(() => setMounted(true), []);
  const points = Math.max(0, userData.loyaltyPoints);
  const tierIndex = tiers.reduce((current, tier, index) => points >= tier.min ? index : current, 0);
  const tier = tiers[tierIndex];
  const nextTier = tiers[tierIndex + 1];
  const progress = nextTier ? Math.min(100, (points - tier.min) / (nextTier.min - tier.min) * 100) : 100;
  const stats = [
    { label: "Lifetime Points", value: format(points), tab: "Privae Circle" },
    { label: "Orders", value: format(orders.length), tab: "Orders" },
    { label: "Wishlist", value: mounted ? format(wishlistCount) : "—", tab: "Wishlist" },
    { label: "Appointments", value: format(appointments.length), tab: "Appointments" },
  ] as const;
  function navigateTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let target = index;
    if (event.key === "ArrowRight") target = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") target = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") target = 0;
    else if (event.key === "End") target = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[target].label);
    document.getElementById(`account-tab-${target}`)?.focus();
  }
  return <main className="bg-background">
    <Toaster position="top-right" />
    <header className="bg-primary text-primary-foreground">
      <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-12">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/65">My account</p>
        <div className="flex flex-wrap items-end justify-between gap-5 mt-2">
          <div className="min-w-0"><h1 className="text-4xl sm:text-5xl break-words">Greetings, {userData.name || "Member"}</h1><p className="text-xs text-white/70 mt-2 break-all">{userData.email}</p></div>
          <button onClick={Signout} className="inline-flex items-center gap-2 border border-white/35 px-4 py-2 text-[10px] uppercase tracking-[0.15em] hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4"><LogOut size={13} /> Sign out</button>
        </div>
        <section className="mt-8 border border-white/25 bg-white/10 p-5 sm:p-6" aria-label="Your Privae Circle membership">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div><p className="text-[9px] uppercase tracking-[0.22em] text-white/65">Privae Circle</p><p className="font-heading text-3xl mt-1">{tier.name} <span className="text-sm text-white/75">— {format(points)} pts</span></p></div>
            <button onClick={() => setActiveTab("Privae Circle")} className="text-[10px] uppercase tracking-[0.15em] underline underline-offset-4 hover:text-white/75">View benefits →</button>
          </div>
          <div role="progressbar" aria-label="Progress to next loyalty tier" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)} aria-valuetext={nextTier ? `${format(nextTier.min - points)} points to ${nextTier.name}` : "Highest tier reached"} className="h-1.5 bg-white/20 mt-4"><div className="h-full bg-white/75 transition-all" style={{ width: `${progress}%` }} /></div>
          <p className="text-[10px] text-white/70 mt-2">{nextTier ? `${format(nextTier.min - points)} pts to ${nextTier.name}` : "Royale — our highest circle of privileges"}</p>
        </section>
      </div>
    </header>
    <div className="border-b border-border">
      <div role="tablist" aria-label="Account sections" className="flex overflow-x-auto max-w-6xl mx-auto px-6 sm:px-10">
        {tabs.map(({ label, icon: Icon }, index) => <button key={label} id={`account-tab-${index}`} role="tab" aria-selected={activeTab === label} aria-controls={`account-panel-${index}`} tabIndex={activeTab === label ? 0 : -1} onKeyDown={event => navigateTab(event, index)} onClick={() => setActiveTab(label)} className={`flex shrink-0 flex-1 items-center justify-center gap-2 whitespace-nowrap border-b-2 px-4 py-4 text-[10px] uppercase tracking-[0.12em] transition-colors focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-[-4px] ${activeTab === label ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-primary"}`}><span className={`rounded-full p-1 ${activeTab === label ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}><Icon size={12} /></span>{label}</button>)}
      </div>
    </div>
    <div className="max-w-6xl mx-auto px-6 py-10 sm:px-10 sm:py-12">
      {tabs.map(({ label }, index) => <div key={label} role="tabpanel" id={`account-panel-${index}`} aria-labelledby={`account-tab-${index}`} hidden={activeTab !== label} tabIndex={0} className="focus-visible:outline-primary">
        {label === "Overview" && <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{stats.map(stat => <button key={stat.label} onClick={() => setActiveTab(stat.tab)} className="bg-secondary/50 p-5 text-left hover:bg-secondary transition-colors"><span className="block text-[9px] uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</span><span className="block font-heading text-3xl mt-3">{stat.value}</span></button>)}</div>
          <div className="grid md:grid-cols-2 gap-6"><TierTable /><section className="bg-secondary/50 p-6 sm:p-7"><h2 className="text-xl mb-4">Most recent order</h2>{orders[0] ? <><OrderSummary order={orders[0]} /><button className={`${linkStyle} text-xs mt-6`} onClick={() => setActiveTab("Orders")}>View all orders →</button></> : <p className="text-xs text-muted-foreground">No orders yet. <Link href="/collections" className={linkStyle}>Start exploring →</Link></p>}</section></div>
        </div>}
        {label === "Orders" && <section><h2 className="text-3xl mb-6">Your orders</h2>{orders.length ? <div className="grid md:grid-cols-2 gap-5">{orders.map(order => <article key={order.id} className="bg-secondary/50 p-6"><OrderSummary order={order} /></article>)}</div> : <div className="bg-secondary/50 p-8"><p className="mb-3">Your first discovery awaits.</p><Link href="/collections" className={linkStyle}>Explore the collection →</Link></div>}</section>}
        {label === "Privae Circle" && <div className="grid md:grid-cols-2 gap-6"><section className="bg-primary text-white p-8"><p className="text-[10px] uppercase tracking-[0.2em] text-white/70">Your membership</p><h2 className="text-4xl mt-4">{tier.name}</h2><p className="font-heading text-3xl mt-6">{format(points)} points</p><p className="text-sm text-white/75 mt-2">Worth ₹{format(loyaltyPointsToRupees(points))} · 10 points = ₹1</p><p className="text-sm mt-6">{tier.benefits}</p><Link href="/loyalty-points" className="inline-block text-xs underline underline-offset-4 mt-8">Manage & share your points →</Link></section><TierTable /></div>}
        {label === "Wishlist" && <section className="bg-secondary/50 p-8"><Heart className="text-primary mb-4" size={24} strokeWidth={1} /><h2 className="text-3xl">Your wishlist</h2><p className="text-sm text-muted-foreground my-4">{mounted ? wishlistCount ? `${wishlistCount} treasured ${wishlistCount === 1 ? "piece" : "pieces"}, saved for another moment.` : "A place for the pieces you love." : "Loading your saved pieces…"}</p><Link href="/my-wishlist" className={linkStyle}>View your wishlist →</Link></section>}
        {label === "Addresses" && <AddressForm userData={userData} />}
        {label === "Appointments" && <section><div className="flex flex-wrap items-center justify-between gap-4 mb-6"><h2 className="text-3xl">Your appointments</h2><Link href="/appointment" className={`${linkStyle} text-sm`}>Book an appointment →</Link></div>{appointments.length ? <div className="grid md:grid-cols-2 gap-5">{appointments.map(appointment => <article key={appointment.id} className="bg-secondary/50 p-6"><p className="text-[9px] uppercase tracking-widest text-primary mb-3">Appointment requested</p><h3 className="text-2xl">{appointment.service}</h3><p className="text-sm text-muted-foreground mt-3">{appointment.scheduled}</p></article>)}</div> : <div className="bg-secondary/50 p-8"><p className="text-sm text-muted-foreground">No appointment requests yet. Discover a personal styling experience, made just for you.</p></div>}</section>}
      </div>)}
    </div>
  </main>;
}
