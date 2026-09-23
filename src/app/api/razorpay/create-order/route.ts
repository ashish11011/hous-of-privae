import { NextResponse } from "next/server";
import razorpay from "@/lib/razorpay";

export async function POST(request: Request) {
  try {
    const { amount, currency = "INR" } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json(
        { success: false, msg: "Amount must be at least 100 paise (₹1)." },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${Date.now()}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error: any) {
    console.error("Razorpay create-order error:", error);
    return NextResponse.json(
      { success: false, msg: error.message || "Failed to create Razorpay order." },
      { status: 500 }
    );
  }
}
