"use server";

import { userTable } from "@/db/schema";
import { db } from "@/lib/db";
import { calculateOrderRewardPoints } from "@/lib/loyaltyRewards";
import { eq, sql } from "drizzle-orm";

export async function awardOrderRewardPoints({
  totalAmountPaid,
  userId,
}: {
  totalAmountPaid: number;
  userId: string;
}) {
  const points = calculateOrderRewardPoints(totalAmountPaid);
  if (points <= 0) return { points, user: null };

  const [user] = await db
    .update(userTable)
    .set({
      loyaltyPoints: sql`${userTable.loyaltyPoints} + ${points}`,
      updatedAt: new Date(),
    })
    .where(eq(userTable.id, userId))
    .returning();

  return { points, user };
}
