"use client";
import { LabelInput } from "@/components/index";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Form, Formik } from "formik";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { useStore } from "@/src/hepler/store/zustand";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/const";
import { convertS3ToImageKit } from "@/src/hepler";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2, CheckCircle2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { checkCoupon } from "@/src/hepler/coupons/coupon.helper";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { calculateOrderRewardPoints } from "@/lib/loyaltyRewards";

const getColorNameByHex = (hex: string) => {
  return COLORS.find((item) => item.hex.toLowerCase() === hex.toLowerCase())?.label ?? hex;
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
  } = useStore();

  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [orderId, setOrderId] = useState("");
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutInitialValues, setCheckoutInitialValues] = useState(
    userDetailInitialValues,
  );

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await fetch("/api/profile", { cache: "no-store" });

        if (response.status === 401 || response.status === 404) return;
        if (!response.ok) throw new Error("Failed to load profile");

        const payload = await response.json();
        const user = payload.user;

        if (!user || !isMounted) return;

        setCheckoutInitialValues({
          name: user.name || "",
          number: user.number || "",
          email: user.email || "",
          addressLine1: user.addressLine1 || "",
          addressLine2: user.addressLine2 || "",
          city: user.city || "",
          state: user.state || "",
          pincode: user.pincode || "",
        });
      } catch (error) {
        console.error("Failed to prefill checkout details:", error);
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  if (productStore.length === 0 && !showSuccess) {
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

  const deliveryCharge = cartTotal >= 1199 ? 0 : 60;
  const finalTotal = cartTotal + deliveryCharge;
  const estimatedLoyaltyPoints = calculateOrderRewardPoints(finalTotal);

  const handlePlaceOrder = async (values: any, action: any) => {
    setIsSubmitting(true);
    try {
      // 1. Create Razorpay order
      const rzpOrderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, productDetails: productStore }),
      });

      const rzpOrderData = await rzpOrderRes.json();

      if (!rzpOrderRes.ok || !rzpOrderData.success) {
        toast.error(rzpOrderData.msg || "Failed to initiate payment.");
        setIsSubmitting(false);
        return;
      }

      // 2. Open Razorpay checkout modal
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
          contact: values.number,
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
                clearCart();
                if (result.confirmed) {
                  setPaymentConfirmed(true);
                  setLoyaltyPointsEarned(result.loyaltyPointsEarned || 0);
                  break;
                }
              } else if (verifyRes.status === 400) {
                toast.error("Payment verification failed. Please contact support with your order reference.");
                break;
              }
              if (attempt < 14) await new Promise(resolve => setTimeout(resolve, 2000));
            }
          } catch (error) {
            console.error("Post-payment error:", error);
            toast.error("Something went wrong after payment. Please contact support.");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.error("Payment was cancelled.");
            setIsSubmitting(false);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        toast.error(
          response.error?.description || "Payment failed. Please try again."
        );
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (error) {
      console.error("Error initiating payment:", error);
      toast.error("Failed to initiate payment. Please try again.");
      setIsSubmitting(false);
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
                <DiscountInput />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs"
                  size={"lg"}
                >
                  {isSubmitting ? "Processing..." : "Pay & Place Order"}
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
                      {item.size} - {getColorNameByHex(item.color)} -{" "}
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
                  {/* {appliedCoupon && (
                  <TableRow className="   hover:bg-neutral-900">
                    <TableHead>Discount Applied ({appliedCoupon})</TableHead>
                    <TableCell className="text-right w-52  text-base">
                      - ₹ {(cartTotal - discountedTotal).toFixed(2)}
                    </TableCell>
                  </TableRow>
                )}
                {isGiftWrap && (
                  <TableRow className="   hover:bg-neutral-900">
                    <TableHead>Gift Wrap</TableHead>
                    <TableCell className="text-right w-52  text-base">
                      ₹ 40
                    </TableCell>
                  </TableRow>
                )} */}
                  <TableRow className=" ">
                    <TableHead>Total</TableHead>
                    <TableCell className="text-right w-52 text-xl">
                      Rs. {finalTotal}
                    </TableCell>
                  </TableRow>
                  <TableRow className=" ">
                    <TableHead>Loyalty Reward</TableHead>
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

          {loyaltyPointsEarned > 0 && (
            <div className="bg-neutral-50 border border-neutral-100 py-3 px-4 w-full flex justify-between items-center text-xs">
              <span className="text-neutral-400 uppercase tracking-[0.15em] text-[10px]">
                Loyalty Earned
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

function DiscountInput() {
  const [couponCode, setCouponCode] = useState("");
  const [message, setMessage] = useState<any>("");
  async function applyCoupon(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    try {
      const res = await checkCoupon(couponCode);
    } catch (error: any) {
      console.error(error);
      setMessage(error);
    }
  }
  return (
    <div className=" space-y-1">
      <Label>Add Coupon</Label>
      <InputGroup className=" w-full">
        <InputGroupInput
          value={couponCode}
          onChange={(e) => setCouponCode(e.currentTarget.value)}
          placeholder="WELCOME10"
        />
        <InputGroupAddon align={"inline-end"}>
          <InputGroupButton onClick={applyCoupon} className=" cursor-pointer">
            Apply
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <p>{message}</p>
    </div>
  );
}
