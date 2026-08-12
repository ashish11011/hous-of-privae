"use server";

import { subscriptionTable } from "@/db/schema";
import { db } from "@/lib/db";
import { desc } from "drizzle-orm";

export const useGetSubscriptionsPaginated = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  try {
    const subscriptions = await db
      .select()
      .from(subscriptionTable)
      .orderBy(desc(subscriptionTable.createdAt))
      .limit(pageSize)
      .offset(offset);

    const totalResult = await db.$count(subscriptionTable);
    const total = Number(totalResult);

    return { subscriptions, total };
  } catch (error) {
    console.error("Failed to fetch subscriptions", error);
    return { subscriptions: [], total: 0 };
  }
};

export const useGetAllSubscriptions = async () => {
  try {
    return await db
      .select()
      .from(subscriptionTable)
      .orderBy(desc(subscriptionTable.createdAt));
  } catch (error) {
    console.error("Failed to fetch all subscriptions", error);
    return [];
  }
};
