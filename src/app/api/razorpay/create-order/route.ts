import { NextResponse } from "next/server";
import { checkoutSchema, createCheckout } from "@/lib/payments/checkout";

export async function POST(request: Request) {
  let input;
  try {
    input = checkoutSchema.parse(await request.json());
  } catch {
    return NextResponse.json({ success: false, msg: "Valid customer, address and cart details are required." }, { status: 400 });
  }
  try {
    return NextResponse.json(await createCheckout(input));
  } catch (error) {
    console.error("Razorpay checkout creation failed:", error);
    return NextResponse.json({ success: false, msg: "Unable to start checkout. Please check your cart and try again." }, { status: 500 });
  }
}
