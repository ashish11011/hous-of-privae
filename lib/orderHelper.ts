import { orderItemsTable, orderTable } from "@/db/schema";
import { db } from "./db";

export const createNewMasterOrder = async (order: any) => {
  console.log("order data: ",order)
  try {
    const result = await db
      .insert(orderTable)
      .values({ totalAmountPaid: 0, ...order })
      .returning();
      console.log("order insert data: ",result);
      return result ? result[0]?.id : null;
  } catch (error) {
    return { msg: "error: ", error };
  }
};

export const createProductOrder = async (order: any) => {
  const insertOrderDetails = order?.productDetails?.map((item: any) => {
    return {
      orderId: order.orderId as string,
      productId: item.id,
      quantity: item.quantity,
      size: item.size,
      color: item.color,
      variant: item.variant ?? "stitched",
    };
  });
  try {
    const result = await db
      .insert(orderItemsTable)
      .values(insertOrderDetails)
      .returning();
    return result ? result : null;
  } catch (error) {
    return { msg: "error: ", error };
  }
};
