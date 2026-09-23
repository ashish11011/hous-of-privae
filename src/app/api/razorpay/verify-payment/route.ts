import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, verified: false, msg: "Missing required payment fields." },
        { status: 400 }
      );
    }

    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpay_signature;

    if (!isValid) {
      return NextResponse.json(
        { success: false, verified: false, msg: "Payment verification failed." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch (error: any) {
    console.error("Razorpay verify-payment error:", error);
    return NextResponse.json(
      { success: false, verified: false, msg: "Verification error." },
      { status: 500 }
    );
  }
}
