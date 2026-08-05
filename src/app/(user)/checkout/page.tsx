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
import React, { useState } from "react";
import { useStore } from "@/src/hepler/store/zustand";
import { Button } from "@/components/ui/button";
import { COLORS } from "@/const";
import { convertS3ToImageKit } from "@/src/hepler";
import { useRouter } from "next/navigation";
import { Plus, Minus, Trash2 } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { checkCoupon } from "@/src/hepler/coupons/coupon.helper";

const getColorNameByHex = (hex: string) => {
  return COLORS.find((item) => item.hex === hex)?.label;
};

const Page = () => {
  const router = useRouter();
  const { productStore, increaseQuantity, decreaseQuantity, removeItemFromStore } = useStore();

  if (productStore.length === 0) {
    return (
      <main className="bg-background px-4 py-12 md:py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="font-heading text-3xl md:text-4xl mb-4">Your Bag is Empty</h1>
        <p className="text-neutral-500 mb-8 max-w-md">
          You haven't added any products to your bag yet. Browse our collections to find something you love.
        </p>
        <Button onClick={() => router.push("/")} className="rounded-none tracking-widest uppercase text-xs px-8 py-3">
          Continue Shopping
        </Button>
      </main>
    );
  }

  const cartTotal = productStore.reduce(
    (total, item) => total + item.basePrice * item.quantity,
    0
  );

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

  // const [appliedCoupon, setAppliedCoupon] = useState("");
  // const [couponError, setCouponError] = useState("");

  // const applyCoupon = (code: string) => {
  //   const coupon = coupons.find((c) => c.code === code.toUpperCase());
  //   if (!coupon) {
  //     setCouponError("Invalid coupon code.");
  //     setAppliedCoupon("");
  //     return;
  //   }

  //   if (cartTotal < coupon.minAmount) {
  //     setCouponError(
  //       `Minimum cart amount of ₹${coupon.minAmount} required for ${code}`
  //     );
  //     setAppliedCoupon("");
  //     return;
  //   }

  //   setCouponError("");
  //   setAppliedCoupon(code.toUpperCase());
  // };

  // const getDiscountedTotal = () => {
  //   const coupon = coupons.find((c) => c.code === appliedCoupon);
  //   const discount = coupon ? (cartTotal * coupon.discountPercent) / 100 : 0;
  //   return cartTotal - discount;
  // };

  // const discountedTotal = getDiscountedTotal();

  const deliveryCharge = cartTotal >= 1199 ? 0 : 60;
  const finalTotal = cartTotal + deliveryCharge;

  const handlePlaceOrder = async (values: any, action: any) => {
    const userData = {
      name: values.name,
      email: values.email,
      number: values.number,
    };
    const response = await fetch("/api/order/create", {
      method: "POST",
      body: JSON.stringify({
        ...values,
        totalAmountPaid: finalTotal,
        productDetails: productStore,
        user: userData,
      }),
      headers: { "Content-Type": "application/json" },
    });
  };

  return (
    <main className="bg-background px-4 py-12 md:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-3">Secure Checkout</p>
          <h1 className="font-heading text-4xl md:text-5xl heading-rule">Complete Your Order</h1>
        </div>
      <div className="grid grid-cols-1 md:grid-cols-[1.15fr_0.85fr] gap-6">
        <div className="order-2 md:order-none border border-border bg-card p-5 md:p-7">
          <Formik
            initialValues={userDetailInitialValues}
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
              <Button type="submit" className="w-full rounded-none h-12 tracking-[0.18em] uppercase text-xs" size={"lg"}>
                Place Order
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
                  <p>color: {getColorNameByHex(item.color)}</p>
                  <p>size: {item.size}</p>
                  <p>variant: {item.variant ?? "stitched"}</p>
                </div>
                {/* Quantity Controls and Remove button */}
                <div className="flex items-center gap-2 mt-2 pt-1">
                  <div className="flex items-center border border-neutral-300 bg-background h-8 px-1">
                    <button
                      type="button"
                      onClick={() =>
                        decreaseQuantity({
                          id: item.id,
                          size: item.size,
                          color: item.color,
                          variant: item.variant,
                        })
                      }
                      className="p-1 hover:bg-neutral-100 text-neutral-600 transition-colors flex items-center justify-center"
                      aria-label="Decrease quantity"
                    >
                      {item.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                    </button>
                    <span className="text-xs font-semibold px-2 min-w-[20px] text-center select-none">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        increaseQuantity({
                          id: item.id,
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
                    ₹ {cartTotal}
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
                    ₹ {finalTotal}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
      </div>
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
      console.log(res);
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
