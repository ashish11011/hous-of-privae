"use client";

import { useState, useEffect, useTransition, Suspense, useCallback } from "react";
import {
  CheckCircle2,
  Clock,
  Package,
  ScissorsLineDashed,
  Truck,
  ShoppingBag,
  MapPin,
  AlertCircle,
  Copy,
  Check,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Mail,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getTrackOrderDetails, type TrackedOrder } from "@/src/hepler/order";
import { convertS3ToImageKit } from "@/src/hepler/convertS3toImagekit";

const stages = [
  { key: "confirmed", label: "Confirmed", subtext: "Received by atelier", Icon: ShoppingBag },
  { key: "stitching", label: "Stitching", subtext: "Handcrafted in atelier", Icon: ScissorsLineDashed },
  { key: "dispatched", label: "Dispatched", subtext: "In transit", Icon: Truck },
  { key: "delivered", label: "Delivered", subtext: "Delivered to doorstep", Icon: CheckCircle2 },
];

function getStageIndex(status: string): number {
  switch (status) {
    case "pending":
    case "pending_payment":
    case "payment_failed":
    case "confirmed":
      return 0;
    case "stitching":
    case "processing":
      return 1;
    case "dispatched":
    case "shipped":
    case "out_for_delivery":
      return 2;
    case "delivered":
      return 3;
    default:
      return 0;
  }
}

function getProgressWidth(stageIndex: number, isTerminalSpecial: boolean): string {
  if (isTerminalSpecial) return "100%";
  switch (stageIndex) {
    case 0:
      return "15%";
    case 1:
      return "45%";
    case 2:
      return "75%";
    case 3:
      return "100%";
    default:
      return "15%";
  }
}

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialOrderId = searchParams.get("orderid") || "";

  const [orderIdInput, setOrderIdInput] = useState<string>(initialOrderId);
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [hasCopied, setHasCopied] = useState(false);

  const handleTrack = useCallback((idToTrack: string) => {
    const trimmed = idToTrack.trim();
    if (!trimmed) {
      setErrorMessage("Please enter an Order ID to track.");
      return;
    }

    setErrorMessage(null);
    startTransition(async () => {
      const response = await getTrackOrderDetails(trimmed);
      if (response.success) {
        setTrackedOrder(response.order);
        setErrorMessage(null);
      } else {
        setTrackedOrder(null);
        setErrorMessage(response.error);
      }
    });
  }, []);

  // Track automatically if orderid is present in searchParams on load
  useEffect(() => {
    if (initialOrderId) {
      handleTrack(initialOrderId);
    }
  }, [initialOrderId, handleTrack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    // Update query param seamlessly
    router.replace(`/track?orderid=${encodeURIComponent(orderIdInput.trim())}`);
    handleTrack(orderIdInput);
  };

  const copyOrderId = () => {
    if (!trackedOrder) return;
    navigator.clipboard.writeText(trackedOrder.id);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  const isCancelled = trackedOrder?.status === "cancelled";
  const isReturned = trackedOrder?.status === "returned";
  const isSpecialStatus = isCancelled || isReturned;
  const currentStageIndex = trackedOrder ? getStageIndex(trackedOrder.status) : 0;

  return (
    <div className="container mx-auto max-w-3xl">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex p-3 rounded-full bg-primary/5 text-primary mb-3">
          <Package size={32} strokeWidth={1.25} />
        </div>
        <p className="eyebrow mb-2">Order Tracking</p>
        <h1 className="font-heading text-4xl md:text-5xl heading-rule">
          Atelier Status
        </h1>
        <p className="mx-auto mt-7 text-sm font-body text-muted-foreground max-w-lg">
          Follow your bespoke piece on its journey from our master craftspeople in
          Jaipur directly to your wardrobe.
        </p>
      </div>

      {/* Tracking Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card border border-border p-6 md:p-8 shadow-sm space-y-4"
      >
        <label className="block text-xs uppercase tracking-[0.18em] font-medium text-foreground">
          Track Your Order
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="flex-1 px-4 py-3 bg-background border border-border focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-colors"
            placeholder="Enter Order ID (e.g. 550e8400-e29b-41d4-a716-446655440000)"
            required
            value={orderIdInput}
            onChange={(e) => setOrderIdInput(e.target.value)}
          />
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary text-primary-foreground px-8 py-3 text-xs tracking-[0.2em] uppercase font-medium hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            {isPending ? (
              <>
                <Clock className="animate-spin" size={14} />
                Tracking...
              </>
            ) : (
              <>
                Track Order
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
        <p className="text-[11px] text-muted-foreground">
          You can find your Order ID in your confirmation email or under your{" "}
          <Link href="/profile" className="text-primary underline underline-offset-4 hover:opacity-80">
            Account Dashboard
          </Link>
          .
        </p>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive p-4 mt-6 flex items-start gap-3 text-sm">
          <AlertCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Unable to find order</p>
            <p className="text-xs mt-1 text-muted-foreground">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Tracking Result View */}
      {trackedOrder && (
        <div className="mt-8 space-y-6">
          {/* Order Header Card */}
          <div className="bg-card border border-border p-6 md:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
              <div>
                <span className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Order Details
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <h2 className="font-heading text-xl md:text-2xl">
                    #{trackedOrder.id.slice(0, 8)}...{trackedOrder.id.slice(-6)}
                  </h2>
                  <button
                    type="button"
                    onClick={copyOrderId}
                    title="Copy Full Order ID"
                    className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {hasCopied ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Placed on{" "}
                  {new Date(trackedOrder.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: "Asia/Kolkata",
                  })}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1.5 text-[11px] tracking-[0.15em] uppercase font-medium border ${
                    isCancelled
                      ? "bg-destructive/10 border-destructive/30 text-destructive"
                      : isReturned
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
                      : trackedOrder.status === "delivered"
                      ? "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-400"
                      : "bg-primary/10 border-primary/20 text-primary"
                  }`}
                >
                  {trackedOrder.statusLabel}
                </span>

                {trackedOrder.totalAmountPaid !== null && (
                  <span className="px-3 py-1.5 text-[11px] tracking-[0.1em] uppercase font-medium bg-secondary text-secondary-foreground">
                    ₹{trackedOrder.totalAmountPaid.toLocaleString("en-IN")}
                  </span>
                )}
              </div>
            </div>

            {/* Special Status Alert (Cancelled / Returned) */}
            {isSpecialStatus ? (
              <div
                className={`mt-6 p-4 border flex items-start gap-3 ${
                  isCancelled
                    ? "bg-destructive/10 border-destructive/20 text-destructive"
                    : "bg-amber-500/10 border-amber-500/20 text-amber-800 dark:text-amber-300"
                }`}
              >
                {isCancelled ? (
                  <XCircle size={20} className="shrink-0 mt-0.5" />
                ) : (
                  <RotateCcw size={20} className="shrink-0 mt-0.5" />
                )}
                <div>
                  <h3 className="text-sm font-medium">{trackedOrder.statusLabel}</h3>
                  <p className="text-xs mt-1 opacity-90">{trackedOrder.statusMessage}</p>
                </div>
              </div>
            ) : (
              /* Atelier Journey Visual Stepper */
              <div className="mt-8">
                <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-6 flex items-center justify-between">
                  <span>Atelier Journey</span>
                  <span className="text-[11px] text-primary flex items-center gap-1">
                    <Sparkles size={12} />
                    {trackedOrder.statusLabel}
                  </span>
                </div>

                <div className="relative">
                  {/* Background Track Line */}
                  <div className="absolute top-5 left-0 right-0 h-0.5 bg-secondary -z-0" />

                  {/* Active Progress Line */}
                  <div
                    className="absolute top-5 left-0 h-0.5 bg-primary transition-all duration-500 -z-0"
                    style={{ width: getProgressWidth(currentStageIndex, isSpecialStatus) }}
                  />

                  {/* Stage Points */}
                  <div className="flex justify-between relative z-10">
                    {stages.map(({ label, subtext, Icon }, index) => {
                      const isCompleted = index <= currentStageIndex;
                      const isCurrent = index === currentStageIndex;

                      return (
                        <div
                          key={label}
                          className="flex flex-col items-center text-center flex-1 max-w-[120px]"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-background ${
                              isCurrent
                                ? "border-primary text-primary ring-4 ring-primary/10 scale-110 shadow-sm"
                                : isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-muted-foreground/40"
                            }`}
                          >
                            <Icon size={18} strokeWidth={isCurrent ? 2 : 1.5} />
                          </div>
                          <span
                            className={`text-[11px] tracking-[0.12em] uppercase font-medium mt-3 leading-tight ${
                              isCurrent
                                ? "text-primary font-semibold"
                                : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground/60"
                            }`}
                          >
                            {label}
                          </span>
                          <span className="text-[9px] text-muted-foreground mt-1 hidden sm:block">
                            {subtext}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status Message Banner */}
                <div className="mt-8 p-4 bg-secondary/40 border border-border/80 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-foreground">
                      {trackedOrder.statusMessage}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Last updated:{" "}
                      {new Date(trackedOrder.updatedAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {trackedOrder.address.city && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                      <MapPin size={14} className="text-primary" />
                      <span>
                        {trackedOrder.address.city}, {trackedOrder.address.pincode}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Ordered Pieces */}
          {trackedOrder.items && trackedOrder.items.length > 0 && (
            <div className="bg-card border border-border p-6 md:p-8">
              <h2 className="text-xs uppercase tracking-[0.18em] font-medium text-foreground mb-4">
                Pieces in this Order ({trackedOrder.items.length})
              </h2>

              <div className="divide-y divide-border">
                {trackedOrder.items.map((item, idx) => {
                  const imageSrc = item.image
                    ? convertS3ToImageKit(item.image)
                    : "/refined/shyama-purple-sharara.jpg";

                  return (
                    <div
                      key={item.id || idx}
                      className="py-4 first:pt-0 last:pb-0 flex items-center gap-4"
                    >
                      <div className="relative w-16 h-20 bg-secondary shrink-0 overflow-hidden border border-border">
                        <Image
                          src={imageSrc}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-heading text-base truncate">{item.name}</h3>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span>Qty: {item.quantity}</span>
                          {item.size && <span>Size: {item.size}</span>}
                          {item.variant && (
                            <span className="capitalize">
                              Style: {item.variant.replace("_", " ")}
                            </span>
                          )}
                          {item.color && <span>Color: {item.color}</span>}
                        </div>
                      </div>
                      {item.unitPrice && (
                        <p className="text-sm font-medium text-right shrink-0">
                          ₹{item.unitPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Status Timeline History (if any recorded events) */}
          {trackedOrder.history && trackedOrder.history.length > 0 && (
            <div className="bg-card border border-border p-6 md:p-8">
              <h2 className="text-xs uppercase tracking-[0.18em] font-medium text-foreground mb-4">
                Tracking History
              </h2>
              <div className="space-y-4">
                {trackedOrder.history.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 text-xs border-l-2 border-primary/40 pl-4 py-1"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        Status updated to{" "}
                        <span className="text-primary uppercase tracking-wider text-[11px]">
                          {event.toStatus.replace(/_/g, " ")}
                        </span>
                      </p>
                      <p className="text-muted-foreground text-[11px] mt-0.5">
                        {new Date(event.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Concierge Assistance */}
          <div className="bg-secondary/30 border border-border p-6 text-center space-y-3">
            <h2 className="font-heading text-lg">Need Assistance with your Order?</h2>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Our atelier concierge is at your service for any questions regarding
              sizing, alterations, or delivery scheduling.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Link
                href="/contact-us"
                className="inline-flex items-center gap-2 border border-primary px-5 py-2.5 text-xs uppercase tracking-[0.15em] text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Mail size={13} />
                Contact Concierge
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <main className="bg-background px-4 py-16 md:py-24 min-h-[70vh]">
      <Suspense
        fallback={
          <div className="container mx-auto max-w-2xl text-center py-20">
            <Clock className="animate-spin mx-auto text-primary mb-3" size={28} />
            <p className="text-sm text-muted-foreground">Loading tracking service...</p>
          </div>
        }
      >
        <TrackOrderContent />
      </Suspense>
    </main>
  );
}
