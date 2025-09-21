"use client";
import { LabelInput } from "@/components";
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
import { user } from "../../../../db/userSchema";
import { useStore } from "@/src/hepler/store/zustand";
import { Button } from "@/components/ui/button";
import { getColorNameByHex } from "@/src/hepler";

const Page = () => {
  const { productStore } = useStore();

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
    <div className=" mx-auto max-w-4xl">
      <h1 className=" text-2xl">Checkout</h1>
      <div className=" grid grid-cols-2  gap-3   divide-x-2 ">
        <div>
          <Formik
            initialValues={userDetailInitialValues}
            onSubmit={handlePlaceOrder}
          >
            <Form className=" space-y-4">
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
              <Button type="submit" className=" w-full" size={"lg"}>
                Place Order
              </Button>
            </Form>
          </Formik>
        </div>
        <div className=" space-y-4">
          {productStore.map((item) => (
            <div className="  flex gap-4" key={item.id}>
              <div className="relative w-16 h-auto shrink-0 rounded-lg md:w-20">
                {/* image of product */}
                <Image
                  // src={}
                  // src={convertS3ToImageKit(item.image)}
                  src={item.bannerImage}
                  alt={item.name}
                  height={100}
                  width={100}
                  className="rounded object-cover"
                />
                <div className=" flex flex-col justify-between gap-2">
                  <p className=" p-1.5 size-7 flex items-center justify-center rounded-full bg-neutral-100 border absolute -top-2 -right-2 cursor-pointer">
                    {item.quantity}
                  </p>
                </div>
              </div>

              {/* product details */}
              <div className=" text-sm space-y-2">
                <p className=" font-medium text-lg leading-6">{item.name}</p>
                <div>
                  <p>color: {getColorNameByHex(item.color)}</p>
                  <p>size: {item.size}</p>
                </div>
              </div>
              <p className=" text-right ml-auto whitespace-nowrap">
                Rs: {item.basePrice}
              </p>
            </div>
          ))}

          <div className=" sticky top-40">
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

          <div></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
