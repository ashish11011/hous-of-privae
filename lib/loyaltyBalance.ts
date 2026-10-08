import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";

export type LoyaltyDatabaseTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
type LoyaltyDatabase = typeof db | LoyaltyDatabaseTransaction;

// Balance-changing callers must lock the user row before checking reservations.
export async function getLoyaltyAvailability(userId: string, balance: number, database: LoyaltyDatabase = db) {
  const reservations = await database.select({
    id: orderTable.id,
    points: orderTable.loyaltyPointsRedeemed,
    subtotalAmount: orderTable.subtotalAmount,
    amount: orderTable.expectedAmountPaise,
  }).from(orderTable).where(and(
    eq(orderTable.userId, userId), eq(orderTable.loyaltyPointsStatus, "reserved"),
  )).orderBy(desc(orderTable.createdAt));
  const reservedPoints = reservations.reduce((sum, order) => sum + order.points, 0);
  return {
    availablePoints: Math.max(0, balance - reservedPoints),
    reservedPoints,
    pendingCheckout: reservations[0] ?? null,
  };
}
