import { orderItemsTable, orderTable } from "@/db/schema";
import { db } from "./db";

export const createNewMasterOrder = async (order: any) => {
  try {
    const result = await db
      .insert(orderTable)
      .values({ totalAmountPaid: 0, ...order })
      .returning();
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
