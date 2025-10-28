"use server";

import { orderTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

export const useGetAllOrderList = async () => {
  return await db.select().from(orderTable);
};

export async function getUserOrderData() {
  const session = await getServerSession(authOptions);
  const userId = session?.id;
  return await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.userId, userId));
}
