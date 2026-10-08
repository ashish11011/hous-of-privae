import { NextResponse } from "next/server";
import { checkoutSchema, createCheckout } from "@/lib/payments/checkout";
import { CheckoutError } from "@/lib/payments/checkout-error";

export async function POST(request: Request) {
  let input;
  try {
    input = checkoutSchema.parse(await request.json());
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        success: false,
        msg: "Valid customer, address and cart details are required.",
      },
      { status: 400 },
    );
  }
  try {
    return NextResponse.json(await createCheckout(input));
  } catch (error) {
    if (error instanceof CheckoutError)
      return NextResponse.json({ success: false, msg: error.message }, { status: error.status });
    console.error("Razorpay checkout creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        msg: "Unable to start checkout. Please check your cart and try again.",
      },
      { status: 500 },
    );
  }
}
