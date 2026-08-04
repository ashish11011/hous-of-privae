"use server";

import { orderTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

export const useGetAllOrderList = async () => {
  try {
    return await db.select().from(orderTable);
  } catch (error) {
    console.error("Failed to fetch orders", error);
    return [];
  }
};

export async function getUserOrderData() {
  const session = await getServerSession(authOptions);
  const userId = session?.id;
  if (!userId) return [];
  try {
    return await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.userId, userId));
  } catch (error) {
    console.error("Failed to fetch user orders", error);
    return [];
  }
}
