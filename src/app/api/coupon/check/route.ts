import { NextResponse } from "next/server";
import { getUserId } from "@/lib/userHelper";
import { validateCouponForOrder } from "@/src/hepler/coupons/coupon.helper";

export async function POST(req: Request) {
  try {
    const { couponCode, subtotal, user } = await req.json();
    const userId = await getUserId(user);

    if (!userId || typeof userId !== "string") {
      return NextResponse.json({ success: false, msg: "User details are required." }, { status: 400 });
    }

    const result = await validateCouponForOrder({
      couponCode,
      subtotal: Number(subtotal) || 0,
      userId,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, msg: error instanceof Error ? error.message : "Failed to check coupon" },
      { status: 400 }
    );
  }
}
