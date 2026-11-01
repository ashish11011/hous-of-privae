"use client";
import { LabelInput } from "@/components/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Form, Formik, useFormikContext } from "formik";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/src/hepler/store/zustand";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/const";
import { convertS3ToImageKit } from "@/src/hepler";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
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
        clearCart(); setAppliedGiftCard(null); setIsSubmitting(false);
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
              if (clearPaidCart) { clearCart(); setAppliedGiftCard(null); }
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
    <main className="bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Secure Checkout</p>
          <h1 className="font-heading text-4xl md:text-5xl heading-rule">
            Complete Your Order
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-6">
          <div className="order-2 md:order-none border border-border bg-card p-5 md:p-7">
            <Formik
              initialValues={checkoutInitialValues}
              enableReinitialize
              onSubmit={handlePlaceOrder}
            >
              <Form className="space-y-4">
                {savedAddresses.length > 0 && <SavedAddressPicker addresses={savedAddresses} disabled={isSubmitting} />}
                <LabelInput labelName="Name" name="name" />
                <LabelInput labelName="Email" name="email" type="email" />
                <LabelInput
                  labelName="Mobile Number"
                  name="number"
                  type="number"
                />
                <LabelInput labelName="Address Line 1" name="addressLine1" />
                <LabelInput
                  labelName="Address Line 2 (0ptional)"
                  name="addressLine2"
                />
                <div className=" grid grid-cols-2 w-full gap-4">
                  <LabelInput labelName="City" name="city" />
                  <LabelInput labelName="State" name="state" />
                </div>
                <LabelInput labelName="Pincode" name="pincode" type="number" />
                <GiftCardRedeemBlock applied={appliedGiftCard} onChange={setAppliedGiftCard} payablePaise={totalBeforeGiftCard * 100} disabled={isSubmitting || Boolean(pendingCheckout)} />
                {productStore.length > 0 && <GiftWrapOption disabled={isSubmitting} />}
                <section className="border border-border p-4 space-y-3" aria-label="Use loyalty points">
                  <h2 className="font-heading text-lg">Use your loyalty points</h2>
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
                      <p className="text-sm text-muted-foreground">
                        {formatINR(availablePoints)} points available · Worth ₹{formatINR(loyaltyPointsToRupees(availablePoints))}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {circle ? "Redeem at least 1,000 points in multiples of 100, up to 20% of full-price merchandise. Sale pieces, shipping, gift wrap and services are excluded. 100 points = ₹10." : "Cover up to 20% of your cart value with points. Delivery and gift wrapping are excluded. 10 points = ₹1."}
                      </p>
                      <Label htmlFor="checkout-points">Points to use (in multiples of {redemptionStep})</Label>
                      <div className="flex gap-2">
                        <input id="checkout-points" type="number" min="0" max={maximumPoints} step={redemptionStep}
                          value={pointsInput} disabled={isSubmitting || !!pendingCheckout}
                          onChange={event => setPointsInput(event.target.value)}
                          onBlur={() => setPointsInput(String(appliedPoints))}
                          className="min-w-0 w-full border border-border bg-background px-3 py-2" />
                        <Button type="button" variant="outline" disabled={isSubmitting || maximumPoints === 0 || !!pendingCheckout}
                          onClick={() => setPointsInput(String(maximumPoints))}>Use maximum</Button>
                      </div>
                      <p className="text-xs text-muted-foreground">Maximum for this cart: {formatINR(maximumPoints)} points (₹{formatINR(loyaltyPointsToRupees(maximumPoints))}).</p>
                    </>
                  )}
                  {pendingCheckout && (
                    <div className="space-y-2 border-t border-border pt-3">
                      <p className="text-sm">{pendingCheckout.giftCardAmountPaise ? `₹${formatINR(pendingCheckout.giftCardAmountPaise / 100)} in gift card credit${pendingCheckout.points ? ` and ${formatINR(pendingCheckout.points)} points` : ""}` : `${formatINR(pendingCheckout.points)} points`} reserved for your pending order. Amount due: ₹{formatINR((pendingCheckout.amount ?? 0) / 100)}.</p>
                      <Button type="button" variant="outline" disabled={isSubmitting} onClick={resumePayment}>Resume payment for pending order</Button>
                    </div>
                  )}
                </section>
                <Button
                  type="submit"
                  disabled={isSubmitting || productStore.length === 0 || Boolean(pendingCheckout?.giftCardAmountPaise)}
                  className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
                  size={"lg"}
                >
                  {isSubmitting ? "Processing..." : finalTotal === 0 && appliedGiftCard ? "Place Order with Gift Card" : "Pay & Place Order"}
                </Button>
              </Form>
            </Formik>
          </div>
          <div className="order-1 md:order-none space-y-4 border border-border bg-card p-5 md:p-7 h-fit">
            <h2 className="font-heading text-2xl mb-4">Order Summary</h2>
            {productStore.map((item, idx) => (
              <div className="flex gap-4 border-b border-border pb-4" key={idx}>
                <div className="relative w-16 h-auto shrink-0 rounded-lg md:w-20">
                  {/* image of product */}
                  <Image
                    src={convertS3ToImageKit(item.bannerImage)}
                    alt={item.name}
                    height={100}
                    width={100}
                    className="rounded object-cover"
                  />
                  <div className=" flex flex-col justify-between gap-2">
                    <p className=" p-1.5 size-7 flex items-center justify-center rounded-full bg-neutral-100 border absolute -top-2 -right-2 select-none">
                      {item.quantity}
                    </p>
                  </div>
                </div>

                {/* product details */}
                <div className="text-sm space-y-2">
                  <p className="font-heading text-lg leading-6">{item.name}</p>
                  <div>
                    <p>
                      {item.variant !== "unstitched" && item.size
                        ? `${item.size} - `
                        : ""}
                      {getColorNameByHex(item.color)} -{" "}
                      {item.variant ?? "stitched"}
                    </p>
                  </div>
                  {/* Quantity Controls and Remove button */}
                  <div className="flex items-center gap-2 mt-2 pt-1">
                    <div className="flex items-center border border-neutral-300 bg-background h-8 px-1">
                      <button
                        type="button"
                        onClick={() =>
                          decreaseQuantity({
                            id: item.id,
                            variantId: item.variantId,
                            size: item.size,
                            color: item.color,
                            variant: item.variant,
                          })
                        }
                        className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors flex items-center justify-center"
                        aria-label="Decrease quantity"
                      >
                        {item.quantity === 1 ? (
                          <Trash2 size={12} className="text-red-500" />
                        ) : (
                          <Minus size={12} />
                        )}
                      </button>
                      <span className="text-xs font-semibold px-2 min-w-[20px] text-center select-none">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          increaseQuantity({
                            id: item.id,
                            variantId: item.variantId,
                            size: item.size,
                            color: item.color,
                            variant: item.variant,
                          })
                        }
                        className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors flex items-center justify-center"
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    {item.quantity > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          removeItemFromStore({
                            id: item.id,
                            variantId: item.variantId,
                            size: item.size,
                            color: item.color,
                            variant: item.variant,
                          })
                        }
                        className="text-xs text-neutral-400 hover:text-red-500 font-medium transition-colors ml-2 uppercase tracking-wider text-[10px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-right ml-auto whitespace-nowrap text-primary">
                  Rs: {item.basePrice}
                </p>
              </div>
            ))}

            <div className="sticky top-40">
              <Table>
                <TableBody>
                  <TableRow className=" ">
                    <TableHead>Cart Total</TableHead>
                    <TableCell className=" text-right w-52 text-lg">
                      Rs. {cartTotal}
                    </TableCell>
                  </TableRow>
                  <TableRow className=" ">
                    <TableHead>Taxes</TableHead>
                    <TableCell className="text-right w-52  text-base">
                      <p> 0</p>
                    </TableCell>
                  </TableRow>

                  <TableRow className=" ">
                    <TableHead>Delivery Charges</TableHead>
                    <TableCell className="text-right w-52  text-base">
                      {deliveryCharge}
                    </TableCell>
                  </TableRow>
                  {appliedPoints > 0 && (
                    <TableRow>
                      <TableHead>Points discount ({formatINR(appliedPoints)} pts)</TableHead>
                      <TableCell className="text-right">− ₹{formatINR(pointsDiscount)}</TableCell>
                    </TableRow>
                  )}
                  {giftWrapCharge > 0 && <TableRow>
                    <TableHead>Gift wrapping</TableHead>
                    <TableCell className="text-right">₹{formatINR(giftWrapCharge)}</TableCell>
                  </TableRow>}
                  {giftCardAmount > 0 && <TableRow><TableHead>Gift card •••• {appliedGiftCard?.suffix}</TableHead><TableCell className="text-right">− ₹{formatINR(giftCardAmount)}</TableCell></TableRow>}
                  <TableRow className=" ">
                    <TableHead>Amount due</TableHead>
                    <TableCell className="text-right w-52 text-xl">
                      Rs. {finalTotal}
                    </TableCell>
                  </TableRow>
                  <TableRow className=" ">
                    <TableHead>{circle ? "Pending Circle Points" : "Loyalty Reward"}</TableHead>
                    <TableCell className="text-right w-52 text-base">
                      {estimatedLoyaltyPoints} pts
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
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
