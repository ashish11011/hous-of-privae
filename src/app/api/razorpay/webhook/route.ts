import { NextResponse } from "next/server";
import { parsePaymentEvent, validSignature } from "@/lib/payments/razorpay-events";
import { processPaymentWebhook } from "@/lib/payments/webhook";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ success: false }, { status: 503 });
  }
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-razorpay-signature"), secret)) {
    return NextResponse.json({ success: false, msg: "Invalid webhook signature." }, { status: 401 });
  }
  let payment;
  try {
    payment = parsePaymentEvent(rawBody);
  } catch {
    return NextResponse.json({ success: false, msg: "Invalid webhook payload." }, { status: 400 });
  }
  if (!payment) return NextResponse.json({ success: true, ignored: true });
  try {
    await processPaymentWebhook(payment);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Razorpay webhook processing failed:", error);
    // Non-2xx makes Razorpay retry database and email failures.
    return NextResponse.json({ success: false, msg: "Webhook processing failed. Retry required." }, { status: 500 });
  }
}
