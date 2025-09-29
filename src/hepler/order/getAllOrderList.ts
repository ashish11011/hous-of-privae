"use server";

import { orderTable } from "@/db/schema";
import { db } from "@/lib/db";

export const useGetAllOrderList = async () => {
  return await db.select().from(orderTable);
};
