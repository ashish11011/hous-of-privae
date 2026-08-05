import { sendOrderNotificationEmails } from "@/lib/email/ses";
import {
  createNewMasterOrder,
  createProductOrder,
} from "../../../../../lib/orderHelper";
import { getUserId } from "../../../../../lib/userHelper";

export async function POST(request: Request) {
  const body = await request.json();
  const user = body.user;

  const userId = await getUserId(user);
  console.log(userId)

  const orderMasterId = await createNewMasterOrder({
    userId: userId,
    ...body,
  });
  console.log(orderMasterId)

  const orderDetails = await createProductOrder({
    productDetails: body.productDetails,
    orderId: orderMasterId,
  });

  await sendOrderNotificationEmails({
    orderId: orderMasterId,
    user:{
      name: body.name,
      email: body.email,
      number: body.number,
    },
    address:{
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
    ...body,
  })

  console.log(orderDetails)

  return new Response(
    JSON.stringify({ msg: "order created successfully", success: true })
  );
}
