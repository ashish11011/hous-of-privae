import { sendOrderNotificationEmails } from "@/lib/email/ses";
import {
  createNewMasterOrder,
  createProductOrder,
} from "../../../../../lib/orderHelper";
import { getUserId } from "../../../../../lib/userHelper";
import { awardOrderRewardPoints } from "@/lib/loyalty";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const user = body.user;

    if (!body.email || !body.name || !body.number || !body.productDetails?.length) {
      return new Response(
        JSON.stringify({ success: false, msg: "Order details are required." }),
        { status: 400 }
      );
    }

    const userId = await getUserId(user);

    if (!userId || typeof userId !== "string") {
      throw new Error("Could not resolve user for order.");
    }

    const orderMasterId = await createNewMasterOrder({
      userId: userId,
      ...body,
    });

    if (!orderMasterId || typeof orderMasterId !== "string") {
      throw new Error("Could not create order.");
    }

    await createProductOrder({
      productDetails: body.productDetails,
      orderId: orderMasterId,
    });

    const loyaltyReward = await awardOrderRewardPoints({
      totalAmountPaid: body.totalAmountPaid,
      userId,
    });

    await sendOrderNotificationEmails({
      orderId: orderMasterId,
      user: {
        name: body.name,
        email: body.email,
        number: body.number,
      },
      address: {
        addressLine1: body.addressLine1,
        addressLine2: body.addressLine2,
        city: body.city,
        state: body.state,
        pincode: body.pincode,
      },
      items: body.productDetails,
      subtotalAmount: body.totalAmountPaid,
      deliveryCharge: body.deliveryCharge,
      discountAmount: body.discountAmount,
      totalAmountPaid: body.totalAmountPaid,
      couponCode: body.couponCode,
    });

    return new Response(
      JSON.stringify({
        msg: "Order created successfully.",
        success: true,
        orderId: orderMasterId,
        loyaltyPointsEarned: loyaltyReward.points,
      })
    );
  } catch (error) {
    console.error("Order create error:", error);
    return new Response(
      JSON.stringify({ success: false, msg: "Failed to place order. Please try again." }),
      { status: 500 }
    );
  }
}
