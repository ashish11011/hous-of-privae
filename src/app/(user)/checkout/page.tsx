"use client";
import { Field, Form, Formik, useFormikContext } from "formik";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/src/hepler/store/zustand";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/const";
import { convertS3ToImageKit } from "@/src/hepler";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, CheckCircle2, ShieldCheck, MapPin, Sparkles, CreditCard } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { calculateOrderRewardPoints, loyaltyPointsToRupees, maximumRedeemablePoints } from "@/lib/loyaltyRewards";
import Link from "next/link";
import GiftWrapOption from "@/components/cart/GiftWrapOption";
import { ATELIER_NOTE_LIMIT } from "@/lib/orders/atelierNote";
import { GIFT_WRAP_CHARGE } from "@/lib/giftWrap";
import GiftCardRedeemBlock, { type AppliedGiftCard } from "@/components/gift-cards/GiftCardRedeemBlock";
import { giftCardRequest } from "@/lib/gift-cards/client";
import { circleMaximumPoints, circleRewardPoints } from "@/lib/account/rules";
import type { Address, Circle } from "@/lib/account/types";

type CheckoutPayment = {
  orderId: string; internalOrderId: string; amount: number; currency: string;
  loyaltyPointsRedeemed: number;
  giftCardAmount?: number;
};
type PendingCheckout = { id: string; points: number; amount: number | null; subtotalAmount: number; giftCardAmountPaise?: number };
const formatINR = (amount: number) => amount.toLocaleString("en-IN");

const getColorNameByHex = (hex: string) => {
  return (
    COLORS.find((item) => item.hex.toLowerCase() === hex.toLowerCase())
      ?.label ?? hex
  );
};

const userDetailInitialValues = {
  name: "",
  number: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
};

const Page = () => {
  const router = useRouter();
  const {
    productStore,
    increaseQuantity,
    decreaseQuantity,
    removeItemFromStore,
    clearCart,
    giftWrap,
    giftWrapNote,
  } = useStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);
  const [loyaltyPending, setLoyaltyPending] = useState(false);
  const [circle, setCircle] = useState<Circle | null>(null);
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePoints, setAvailablePoints] = useState<number | null>(null);
  const [pendingCheckout, setPendingCheckout] = useState<PendingCheckout | null>(null);
  const [pointsInput, setPointsInput] = useState("0");
  const [pointsLoading, setPointsLoading] = useState(true);
  const [pointsLoadError, setPointsLoadError] = useState(false);
  const [pointsUsed, setPointsUsed] = useState(0);
  const [appliedGiftCard, setAppliedGiftCard] = useState<AppliedGiftCard | null>(null);
  const [editingBag, setEditingBag] = useState(false);
  const [atelierNote, setAtelierNote] = useState("");
  const [emailPending, setEmailPending] = useState(false);
  const checkoutAttempt = useRef({ fingerprint: "", id: "" });
  const [checkoutInitialValues, setCheckoutInitialValues] = useState(
    userDetailInitialValues,
  );

  const loadProfile = useCallback(async (prefill = false, signal?: AbortSignal) => {
    try {
      const response = await fetch("/api/profile", { cache: "no-store", signal });
      if (signal?.aborted) return;
      if (response.status === 401 || response.status === 404) {
        setPointsLoadError(false);
        setAvailablePoints(null); setCircle(null); setSavedAddresses([]); setPendingCheckout(null); return;
      }
      if (!response.ok) throw new Error("Failed to load profile");
      const payload = await response.json();
      const user = payload.user;
      if (!user || signal?.aborted) return;
      setPointsLoadError(false);
      setAvailablePoints(payload.availablePoints ?? 0);
      setCircle(payload.circle ?? null);
      setSavedAddresses(payload.addresses ?? []);
      setPendingCheckout(payload.pendingCheckout ?? null);
      const address = payload.addresses?.find((row: Address) => row.isDefault);
      if (prefill) setCheckoutInitialValues({
        name: address?.recipientName || user.name || "", number: address?.phone || user.number || "", email: user.email || "",
        addressLine1: address?.line1 || user.addressLine1 || "", addressLine2: address?.line2 || user.addressLine2 || "",
        city: address?.city || user.city || "", state: address?.state || user.state || "", pincode: address?.pincode || user.pincode || "",
      });
    } catch (error) {
      if (signal?.aborted) return;
      setPointsLoadError(true);
      console.error("Failed to load checkout profile:", error);
    } finally {
      if (!signal?.aborted) setPointsLoading(false);
    }
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    void loadProfile(true, controller.signal);
    return () => controller.abort();
  }, [loadProfile]);

  if (productStore.length === 0 && !showSuccess && !pendingCheckout) {
    return (
      <main className="bg-background px-4 py-12 md:py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-heading text-3xl md:text-4xl mb-4">
          Your Bag is Empty
        </h1>
        <p className="text-neutral-500 mb-8 max-w-md">
          You haven't added any products to your bag yet. Browse our collections
          to find something you love.
        </p>
        <Button
          onClick={() => router.push("/")}
          className="rounded-none tracking-widest uppercase text-xs px-8 py-3"
        >
          Continue Shopping
        </Button>
      </main>
    );
  }

  const cartTotal = productStore.reduce(
    (total, item) => total + item.basePrice * item.quantity,
    0,
  );

  const deliveryCharge = circle || cartTotal === 0 || cartTotal >= 1199 ? 0 : 60;
  const eligibleAmount = productStore.filter(item => item.isFullPrice !== false).reduce((sum,item) => sum + item.basePrice * item.quantity, 0);
  const maximumPoints = circle ? circleMaximumPoints(eligibleAmount, availablePoints ?? 0) : maximumRedeemablePoints(cartTotal, availablePoints ?? 0);
  const redemptionStep = circle ? 100 : 10;
  const selectedPoints = Math.min(Math.max(0, Math.floor((Number(pointsInput) || 0) / redemptionStep) * redemptionStep), maximumPoints);
  const appliedPoints = circle && selectedPoints < 1000 ? 0 : selectedPoints;
  const pointsDiscount = loyaltyPointsToRupees(appliedPoints);
  const giftWrapCharge = giftWrap && productStore.length > 0 ? GIFT_WRAP_CHARGE : 0;
  const totalBeforeGiftCard = cartTotal + deliveryCharge + giftWrapCharge - pointsDiscount;
  const giftCardAmount = appliedGiftCard ? Math.min(appliedGiftCard.balancePaise / 100, totalBeforeGiftCard) : 0;
  const finalTotal = totalBeforeGiftCard - giftCardAmount;
  const estimatedLoyaltyPoints = circle ? circleRewardPoints(Math.max(0, eligibleAmount - pointsDiscount - giftCardAmount), circle.current.key) : calculateOrderRewardPoints(totalBeforeGiftCard);

  const handlePlaceOrder = async (values: typeof userDetailInitialValues) => {
    setIsSubmitting(true);
    try {
      const orderPayload = {
        ...values,
        number: values.number !== undefined && values.number !== null ? String(values.number) : "",
        pincode: values.pincode !== undefined && values.pincode !== null ? String(values.pincode) : "",
        productDetails: productStore,
        loyaltyPointsToRedeem: appliedPoints,
        giftWrap,
        giftWrapNote: giftWrap ? giftWrapNote : "",
        atelierNote: atelierNote.trim() || undefined,
        giftCardCode: appliedGiftCard?.code || "",
      };
      const fingerprint = JSON.stringify(orderPayload);
      if (checkoutAttempt.current.fingerprint !== fingerprint) checkoutAttempt.current = { fingerprint, id: crypto.randomUUID() };

      // 1. Create Razorpay order
      const rzpOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...orderPayload, requestId: checkoutAttempt.current.id }),
      });

      const rzpOrderData = await rzpOrderRes.json();

      if (!rzpOrderRes.ok || !rzpOrderData.success) {
        toast.error(rzpOrderData.msg || "Failed to initiate payment.");
        setIsSubmitting(false);
        await loadProfile();
        return;
      }

      await loadProfile();
      setPointsInput("0");
      if (rzpOrderData.confirmed) {
        setOrderId(rzpOrderData.internalOrderId);
        setPaymentConfirmed(true); setShowSuccess(true);
        setPointsUsed(rzpOrderData.loyaltyPointsRedeemed || 0);
        setLoyaltyPointsEarned(rzpOrderData.circle?.normalPoints ?? calculateOrderRewardPoints(rzpOrderData.totalAmountPaid ?? totalBeforeGiftCard));
        setLoyaltyPending(Boolean(rzpOrderData.circle));
        setEmailPending(Boolean(rzpOrderData.emailPending));
        clearCart(); setAppliedGiftCard(null); setAtelierNote(""); setIsSubmitting(false);
        return;
      }
      openPayment(rzpOrderData, values);
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
      void loadProfile();
      setIsSubmitting(false);
    }
  };

  const openPayment = (rzpOrderData: CheckoutPayment, values: typeof userDetailInitialValues, clearPaidCart = true) => {
    const options: any = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: rzpOrderData.amount,
      currency: rzpOrderData.currency,
      name: "Haus of Privae",
      description: "Order Payment",
      order_id: rzpOrderData.orderId,
      prefill: {
        name: values.name,
        email: values.email,
        contact: values.number !== undefined && values.number !== null ? String(values.number) : "",
      },
      theme: { color: "#1a1a1a" },
      handler: async (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) => {
        try {
          setOrderId(rzpOrderData.internalOrderId);
          setPaymentConfirmed(false);
          setShowSuccess(true);
          // Only the webhook confirms an order. Poll its saved result briefly;
          // payment can still complete if the customer closes this browser.
          for (let attempt = 0; attempt < 15; attempt++) {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verifyRes.json();
            if (verifyRes.ok && result.verified) {
              if (clearPaidCart) { clearCart(); setAppliedGiftCard(null); setAtelierNote(""); }
              if (result.confirmed) {
                setPaymentConfirmed(true);
                setLoyaltyPointsEarned(result.loyaltyPointsEarned || 0);
                setLoyaltyPending(Boolean(result.loyaltyPointsPending));
                setPointsUsed(result.loyaltyPointsRedeemed || 0);
                void loadProfile();
                break;
              }
            } else if (verifyRes.status === 400) {
              toast.error(
                "Payment verification failed. Please contact support with your order reference.",
              );
              break;
            }
            if (attempt < 14)
              await new Promise((resolve) => setTimeout(resolve, 2000));
          }
        } catch (error) {
          console.error("Post-payment error:", error);
          toast.error(
            "Something went wrong after payment. Please contact support.",
          );
        } finally {
          setIsSubmitting(false);
        }
      },
      modal: {
        ondismiss: () => {
          toast.info(rzpOrderData.loyaltyPointsRedeemed > 0 || (rzpOrderData.giftCardAmount ?? 0) > 0
            ? "Payment closed. Your points or gift card credit are reserved for this order; use Resume payment to continue."
            : "Payment was cancelled.");
          void loadProfile();
          setIsSubmitting(false);
        },
      },
    };

    const rzp = new (window as any).Razorpay(options);

    rzp.on("payment.failed", (response: any) => {
      toast.error(
        response.error?.description || "Payment failed. Please try again.",
      );
      void loadProfile();
    });

    rzp.open();
  };

  const resumePayment = async () => {
    if (!pendingCheckout) return;
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/razorpay/resume-order", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: pendingCheckout.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.msg || "Unable to resume payment.");
      const matchesCurrentCart = Boolean(result.giftWrap) === giftWrap &&
        (result.giftWrapNote ?? "") === (giftWrap ? giftWrapNote.trim() : "") &&
        result.items?.length === productStore.length && result.items.every(
        (ordered: { productId: string; variantId: string; size?: string; variant?: string; quantity: number }) =>
          productStore.some(item => item.id === ordered.productId && item.variantId === ordered.variantId &&
            (item.variant === "unstitched" ? "" : (item.size || "").toLowerCase()) === (ordered.size || "").toLowerCase() &&
            (item.variant || "stitched") === (ordered.variant || "stitched") && item.quantity === ordered.quantity),
      );
      openPayment(result, { ...userDetailInitialValues, ...result.prefill }, matchesCurrentCart);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to resume payment.");
      setIsSubmitting(false);
      await loadProfile();
    }
  };

  return (
    <main data-checkout className="bg-[#f7f4ef] px-4 py-8 text-[#302725] md:px-8 md:py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-[#ded5c9] pb-6">
          <div>
            <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-[#906622]">Secure checkout</p>
            <h1 className="font-heading text-4xl md:text-5xl">Complete your order</h1>
          </div>
          <p className="flex items-center gap-2 text-xs text-stone-600">
            <ShieldCheck size={15} className="text-[#906622]" aria-hidden="true" /> Secure payment at checkout
          </p>
        </header>
        <Formik initialValues={checkoutInitialValues} enableReinitialize onSubmit={handlePlaceOrder}>
          <Form className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,3fr)] lg:gap-8">
            <div className="min-w-0 space-y-6">
              <section className={checkoutPanel}>
                <CheckoutSectionHeading number={1} title="Delivery address" description="Where should we send your pieces?" icon={<MapPin size={15} />} />
                <fieldset disabled={isSubmitting} className="grid gap-3 sm:grid-cols-2">
                  {savedAddresses.length > 0 && <div className="sm:col-span-2"><SavedAddressPicker addresses={savedAddresses} disabled={isSubmitting} /></div>}
                  <CheckoutField name="name" label="Recipient name" autoComplete="shipping name" required />
                  <CheckoutField name="number" label="Phone" type="tel" autoComplete="shipping tel" />
                  <CheckoutField name="email" label="Email for order confirmation" type="email" autoComplete="email" wide required />
                  <CheckoutField name="addressLine1" label="Address line 1" autoComplete="shipping address-line1" wide required />
                  <CheckoutField name="addressLine2" label="Address line 2 (optional)" autoComplete="shipping address-line2" wide />
                  <CheckoutField name="city" label="City" autoComplete="shipping address-level2" required />
                  <CheckoutField name="state" label="State" autoComplete="shipping address-level1" required />
                  <CheckoutField name="pincode" label="Pincode" autoComplete="shipping postal-code" inputMode="numeric" />
                  <input aria-label="Country" value="India" readOnly className={checkoutInput} />
                </fieldset>
              </section>

              <section className={checkoutPanel}>
                <CheckoutSectionHeading number={2} title="Rewards & gift cards" description="Both may be used on the same order." icon={<Sparkles size={15} />} />
                <div className="grid gap-3 lg:grid-cols-2">
                  <div className="min-w-0 space-y-2 border border-[#d6b77a] bg-[#eee5d4]/55 p-4">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-stone-600">Privae points</p>
                    {pointsLoading ? (
                      <p className="text-sm text-muted-foreground">Loading your points…</p>
                    ) : pointsLoadError ? (
                      <div className="text-sm text-muted-foreground">
                        Points balance unavailable. <button type="button" className="underline" onClick={() => void loadProfile()}>Refresh balance</button>
                      </div>
                    ) : availablePoints === null ? (
                      <p className="text-sm text-muted-foreground">
                        <Link href="/auth/login?callbackUrl=/checkout" className="underline">Sign in</Link> to use your points.
                      </p>
                    ) : (
                      <>
                        <p className="font-heading text-xl">{formatINR(availablePoints)} available</p>
                        <p className="text-xs text-stone-600">
                          100 points = ₹10{circle && " · Minimum 1,000 points"}
                        </p>
                        {maximumPoints > 0 ? (
                          <>
                            <Label htmlFor="checkout-points">Points to use (in multiples of {redemptionStep})</Label>
                            <div className="flex flex-wrap gap-2">
                              <input id="checkout-points" type="number" min="0" max={maximumPoints} step={redemptionStep}
                                value={pointsInput} disabled={isSubmitting || !!pendingCheckout}
                                onChange={event => setPointsInput(event.target.value)}
                                onBlur={() => setPointsInput(String(appliedPoints))}
                                className={checkoutInput} />
                              <Button type="button" variant="outline" disabled={isSubmitting || !!pendingCheckout}
                                onClick={() => setPointsInput(String(maximumPoints))} className="h-9 rounded-none text-xs">Use maximum</Button>
                            </div>
                            <p className="text-xs text-muted-foreground">Maximum for this cart: {formatINR(maximumPoints)} points (₹{formatINR(loyaltyPointsToRupees(maximumPoints))}).</p>
                          </>
                        ) : (
                          <p className="text-xs text-stone-600">No points are redeemable on this order yet.</p>
                        )}
                      </>
                    )}
                  </div>
                  <div className="min-w-0 space-y-3 border border-[#ded5c9] p-4">
                    <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-stone-600">
                      <CreditCard size={14} className="text-[#906622]" aria-hidden="true" /> Privae Experience Card
                    </p>
                    <GiftCardRedeemBlock applied={appliedGiftCard} onChange={setAppliedGiftCard} payablePaise={totalBeforeGiftCard * 100} disabled={isSubmitting || Boolean(pendingCheckout)} />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-stone-600">
                  {circle ? "Redeem up to 20% of full-price merchandise in multiples of 100 points. Sale pieces, shipping, gift wrapping and services are excluded." : "Cover up to 20% of your cart value with points. Delivery and gift wrapping are excluded. 10 points = ₹1."}
                </p>
                {pendingCheckout && (
                  <div className="mt-4 space-y-2 border-t border-[#ded5c9] pt-3">
                    <p className="text-sm">{pendingCheckout.giftCardAmountPaise ? `₹${formatINR(pendingCheckout.giftCardAmountPaise / 100)} in gift card credit${pendingCheckout.points ? ` and ${formatINR(pendingCheckout.points)} points` : ""}` : `${formatINR(pendingCheckout.points)} points`} reserved for your pending order. Amount due: ₹{formatINR((pendingCheckout.amount ?? 0) / 100)}.</p>
                    <Button type="button" variant="outline" disabled={isSubmitting} onClick={resumePayment}>Resume payment for pending order</Button>
                  </div>
                )}
              </section>

              {productStore.length > 0 && <GiftWrapOption disabled={isSubmitting} />}
              <section className={checkoutPanel}>
                <label htmlFor="atelier-note" className="mb-3 block font-heading text-2xl">Notes for the atelier</label>
                <textarea id="atelier-note" name="atelierNote" rows={3} maxLength={ATELIER_NOTE_LIMIT}
                  value={atelierNote} onChange={event => setAtelierNote(event.target.value)} disabled={isSubmitting}
                  placeholder="Delivery preferences, occasion date, anything we should know."
                  className={checkoutInput + " resize-y"} />
              </section>
            </div>

            <aside className={checkoutPanel} aria-label="Your bag">
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#ded5c9] pb-3">
                <h2 className="font-heading text-2xl">Your bag</h2>
                <button type="button" disabled={isSubmitting || !productStore.length} aria-expanded={editingBag}
                  onClick={() => setEditingBag(value => !value)}
                  className="min-h-8 text-[10px] uppercase tracking-[0.16em] text-primary underline-offset-4 hover:underline disabled:opacity-50">
                  {editingBag ? "Done" : "Edit bag"}
                </button>
              </div>
              <div className="space-y-4">
                {productStore.map(item => {
                  const selection = { id: item.id, variantId: item.variantId, size: item.size, color: item.color, variant: item.variant };
                  return (
                    <div className="flex gap-3" key={JSON.stringify(selection)}>
                      <Image src={convertS3ToImageKit(item.bannerImage)} alt="" height={80} width={64} className="h-20 w-16 shrink-0 object-cover" />
                      <div className="min-w-0 space-y-1">
                        <p className="font-heading text-base leading-tight">{item.name}</p>
                        <p className="text-xs text-stone-600">
                          {[item.variant !== "unstitched" ? item.size : "", getColorNameByHex(item.color), item.variant ?? "stitched"].filter(Boolean).join(" · ")}
                          {item.quantity > 1 && ` · Qty ${item.quantity}`}
                        </p>
                        <p className="text-xs">₹{formatINR(item.basePrice * item.quantity)}</p>
                        {editingBag && (
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={isSubmitting || item.quantity <= 1} onClick={() => decreaseQuantity(selection)} className={quantityControl}><Minus size={13} /></button>
                            <span className="text-xs">{item.quantity}</span>
                            <button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={isSubmitting || item.quantity >= 100} onClick={() => increaseQuantity(selection)} className={quantityControl}><Plus size={13} /></button>
                            <button type="button" aria-label={`Remove ${item.name}`} disabled={isSubmitting} onClick={() => removeItemFromStore(selection)} className={quantityControl}><Trash2 size={13} /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <dl className="mt-5 space-y-2 border-t border-[#ded5c9] pt-4 text-sm text-stone-600">
                <SummaryRow label="Subtotal" value={`₹${formatINR(cartTotal)}`} />
                <SummaryRow label="Shipping" value={deliveryCharge ? `₹${formatINR(deliveryCharge)}` : "Complimentary"} />
                {giftWrapCharge > 0 && <SummaryRow label="Gift wrapping" value={`₹${formatINR(giftWrapCharge)}`} />}
                {appliedPoints > 0 && <SummaryRow label="Points discount" value={`− ₹${formatINR(pointsDiscount)}`} />}
                {giftCardAmount > 0 && <SummaryRow label={`Gift card •••• ${appliedGiftCard?.suffix}`} value={`− ₹${formatINR(giftCardAmount)}`} />}
                <SummaryRow label="Total" value={`₹${formatINR(finalTotal)}`} total />
              </dl>
              {estimatedLoyaltyPoints > 0 && (
                <div className="my-4 border border-[#d6b77a] bg-[#eee5d4]/55 p-3 text-xs">
                  <p className="font-medium">Estimated reward: {formatINR(estimatedLoyaltyPoints)} Privae Points</p>
                  {circle && <p className="mt-1 leading-relaxed text-stone-600">Points become available five days after delivery.</p>}
                </div>
              )}
              <Button type="submit"
                disabled={isSubmitting || productStore.length === 0 || Boolean(pendingCheckout?.giftCardAmountPaise)}
                className="mt-4 w-full rounded-none bg-[#620e26] uppercase tracking-[0.18em] text-white hover:bg-[#4e0b1e]">
                {isSubmitting ? "Processing…" : finalTotal === 0 && appliedGiftCard ? "Place order with gift card" : "Place order"}
              </Button>
              <p className="mt-3 text-center text-xs leading-relaxed text-stone-600">We’ll email your order confirmation after payment is confirmed.</p>
            </aside>
          </Form>
        </Formik>
      </div>
      <Dialog open={showSuccess} onOpenChange={() => {}}>
        <DialogContent
          className="max-w-md bg-white border border-border p-8 text-center flex flex-col items-center justify-center rounded-none shadow-2xl"
          showCloseButton={false}
        >
          <DialogHeader className="flex flex-col items-center justify-center space-y-4">
            <div className="size-20 rounded-full bg-neutral-50 border border-neutral-100 flex items-center justify-center mb-2 shadow-inner">
              <CheckCircle2
                size={40}
                className="text-neutral-800 animate-in zoom-in-50 duration-500"
                strokeWidth={1}
              />
            </div>
            <p className="eyebrow text-xs tracking-[0.2em] text-neutral-400">
              Thank You
            </p>
            <DialogTitle className="font-heading text-3xl text-neutral-900 tracking-tight">
              {paymentConfirmed ? "Order Confirmed" : "Confirming Your Payment"}
            </DialogTitle>
            <DialogDescription className="text-neutral-500 font-body text-sm max-w-xs leading-relaxed">
              {paymentConfirmed
                ? "Your payment is confirmed. Your order confirmation will arrive by email."
                : "We are waiting for payment confirmation. You can safely leave this page. We will email you once your order is confirmed; please do not pay again."}
            </DialogDescription>
          </DialogHeader>

          {orderId && (
            <div className="my-6 bg-neutral-50 border border-neutral-100 py-3 px-4 w-full flex justify-between items-center text-xs">
              <span className="text-neutral-400 uppercase tracking-[0.15em] text-[10px]">
                Order Reference
              </span>
              <span className="font-mono font-medium text-neutral-800 select-all">
                {orderId}
              </span>
            </div>
          )}

          {pointsUsed > 0 && (
            <div className="bg-neutral-50 border border-neutral-100 py-3 px-4 w-full flex justify-between items-center text-xs">
              <span>Loyalty Used</span><span>{formatINR(pointsUsed)} pts · ₹{formatINR(loyaltyPointsToRupees(pointsUsed))}</span>
            </div>
          )}
          {emailPending && <Button type="button" variant="outline" onClick={async () => {
            try { await giftCardRequest("/complete-order", { id: orderId }); setEmailPending(false); toast.success("Confirmation email sent."); }
            catch { toast.error("Email delivery is still pending. Please try again shortly."); }
          }}>Retry confirmation email</Button>}
          {loyaltyPointsEarned > 0 && (
            <div className="bg-neutral-50 border border-neutral-100 py-3 px-4 w-full flex justify-between items-center text-xs">
              <span className="text-neutral-400 uppercase tracking-[0.15em] text-[10px]">
                {loyaltyPending ? "Pending Circle Points" : "Loyalty Earned"}
              </span>
              <span className="font-medium text-neutral-800">
                {loyaltyPointsEarned} pts
              </span>
            </div>
          )}

          <div className="w-full space-y-3 mt-4">
            <Button
              onClick={() => {
                setShowSuccess(false);
                router.push("/track");
              }}
              className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
            >
              Track Order
            </Button>
            <Button
              onClick={() => {
                setShowSuccess(false);
                router.push("/");
              }}
              variant="outline"
              className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs border-neutral-300 hover:bg-neutral-50 text-neutral-800"
            >
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Toaster position="top-right" />
    </main>
  );
};

export default Page;

function SavedAddressPicker({ addresses, disabled }: { addresses: Address[]; disabled: boolean }) {
  const { setFieldValue } = useFormikContext<typeof userDetailInitialValues>();
  return <div className="space-y-2"><Label htmlFor="checkout-saved-address">Delivery address</Label><select id="checkout-saved-address" defaultValue={addresses.find(row => row.isDefault)?.id ?? ""} disabled={disabled} className="w-full border border-border bg-background px-3 py-2 text-sm" onChange={event => {
    const address = addresses.find(row => row.id === event.target.value); if (!address) return;
    for (const [field,value] of Object.entries({ name: address.recipientName, number: address.phone, addressLine1: address.line1, addressLine2: address.line2, city: address.city, state: address.state, pincode: address.pincode })) void setFieldValue(field,value);
  }}><option value="">Enter a different address</option>{addresses.map(address => <option key={address.id} value={address.id}>{address.label || address.recipientName} · {address.city}{address.isDefault ? " (Default)" : ""}</option>)}</select></div>;
}

const checkoutPanel = "min-w-0 border border-[#ded5c9] bg-[#f2eee7] p-5 lg:p-7";
const checkoutInput = "min-h-10 w-full border border-[#d9d0c4] bg-[#f8f5ef] px-3 py-2 text-sm text-[#302725] placeholder:text-stone-500 focus-visible:outline focus-visible:outline-1 focus-visible:outline-[#906622] disabled:opacity-60";
const quantityControl = "grid size-8 place-items-center border border-[#ded5c9] hover:bg-[#eae2d6] disabled:opacity-50";

function CheckoutSectionHeading({ number, title, description, icon }: {
  number: number; title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start gap-3 border-b border-[#ded5c9] pb-4">
      <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border border-[#ad7a28] text-xs text-[#906622]" aria-hidden="true">{number}</span>
      <div>
        <h2 className="flex items-center gap-2 font-heading text-2xl">
          <span className="text-[#906622]" aria-hidden="true">{icon}</span>{title}
        </h2>
        <p className="mt-1 text-xs text-stone-600">{description}</p>
      </div>
    </div>
  );
}

function CheckoutField({ name, label, wide, ...props }: {
  name: string; label: string; wide?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={wide ? "sm:col-span-2" : "min-w-0"}>
      <span className="sr-only">{label}</span>
      <Field name={name} placeholder={label} className={checkoutInput} {...props} />
    </label>
  );
}

function SummaryRow({ label, value, total = false }: { label: string; value: string; total?: boolean }) {
  return (
    <div className={`flex justify-between gap-3 ${total ? "mt-4 border-t border-[#ded5c9] pt-4 font-heading text-xl text-[#302725]" : ""}`}>
      <dt>{label}</dt><dd className="shrink-0">{value}</dd>
    </div>
  );
}
