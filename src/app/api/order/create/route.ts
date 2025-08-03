import {
  createNewMasterOrder,
  createProductOrder,
} from "../../../../../lib/orderHelper";
import { createNewUser, getUserId } from "../../../../../lib/userHelper";

export async function POST(request: Request) {
  const body = await request.json();
  const user = body.user;

  const userId = await getUserId(user);

  const orderMasterId = await createNewMasterOrder({
    userId: userId,
    ...body,
  });

  const orderDetails = await createProductOrder({
    productDetails: body.productDetails,
    orderId: orderMasterId,
  });

  return new Response(
    JSON.stringify({ msg: "order created successfully", success: true })
  );
}
