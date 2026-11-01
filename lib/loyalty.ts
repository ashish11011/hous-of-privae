import { loyaltyTransactionsTable, orderTable, userTable } from "@/db/schema";
import { calculateOrderRewardPoints, loyaltyPointsToRupees, maximumRedeemablePoints } from "@/lib/loyaltyRewards";
import type { LoyaltyDatabaseTransaction } from "@/lib/loyaltyBalance";
import { eq } from "drizzle-orm";
import { settleCircleOrder, settleLegacyOrderInCircle } from "@/lib/account/circle";

// Called only inside the captured-payment transaction, after locking the order.
export async function settleOrderLoyalty(
  tx: LoyaltyDatabaseTransaction,
  order: typeof orderTable.$inferSelect,
  totalAmountPaid: number,
  circleAvailable = false,
) {
  if (order.checkoutSnapshot?.circle?.programVersion === 1) {
    await settleCircleOrder(tx, order);
    return;
  }
  if (circleAvailable) {
    await settleLegacyOrderInCircle(tx, order, totalAmountPaid);
    return;
  }
  const [user] = await tx.select().from(userTable).where(eq(userTable.id, order.userId)).for("update");
  if (!user) throw new Error("Order account not found");
  const redeemed = order.loyaltyPointsRedeemed;
  const earned = calculateOrderRewardPoints(totalAmountPaid);
  let balance = user.loyaltyPoints;
  if (redeemed > 0) {
    if (order.loyaltyPointsStatus !== "reserved" || redeemed % 10 !== 0 || redeemed > maximumRedeemablePoints(order.subtotalAmount, balance) ||
        order.discountAmount !== loyaltyPointsToRupees(redeemed))
      throw new Error("Invalid order points reservation");
    balance -= redeemed;
    await tx.insert(loyaltyTransactionsTable).values({
      userId: user.id, type: "redemption", points: -redeemed, balanceAfter: balance,
      orderId: order.id, description: `Used points for order ${order.id}`,
      referenceKey: `order:${order.id}:redemption`,
    });
  }
  if (earned > 0) {
    balance += earned;
    await tx.insert(loyaltyTransactionsTable).values({
      userId: user.id, type: "order_reward", points: earned, balanceAfter: balance,
      orderId: order.id, description: `Earned points from order ${order.id}`,
      referenceKey: `order:${order.id}:reward`,
    });
  }
  await tx.update(userTable).set({ loyaltyPoints: balance, updatedAt: new Date() }).where(eq(userTable.id, user.id));
}
