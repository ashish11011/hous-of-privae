import { NextResponse } from "next/server";

// The old browser endpoint must never confirm an order or send email.
export async function POST() {
  return NextResponse.json({
    success: false,
    msg: "Start checkout at /api/razorpay/create-order. Orders are confirmed by the payment webhook.",
  }, { status: 410 });
}
