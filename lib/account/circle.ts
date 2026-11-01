import { randomUUID } from "node:crypto";
import { and, asc, desc, eq, gt, inArray, sql } from "drizzle-orm";
import {
  circleAccount,
  circleOrderReward,
  circlePointLot,
  circleRedemption,
  circleTransfer,
} from "@/db/accountSchema";
import { loyaltyTransactionsTable, orderTable, userTable } from "@/db/schema";
import { db } from "@/lib/db";
import {
  getLoyaltyAvailability,
  type LoyaltyDatabaseTransaction as Tx,
} from "@/lib/loyaltyBalance";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { addCircleMonths, circleProgress, type CircleTierKey } from "./rules";

type Member = typeof userTable.$inferSelect;
export async function circleEnabled() {
  const [row] = await db.execute(
    sql`select to_regclass('public.circle_accounts') is not null and to_regclass('public.circle_point_lots') is not null and to_regclass('public.circle_order_rewards') is not null and to_regclass('public.circle_redemptions') is not null and to_regclass('public.circle_transfers') is not null as enabled`,
  );
  return row?.enabled === true;
}
async function member(tx: Tx, userId: string) {
  const [row] = await tx
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .for("update");
  if (!row) throw new CheckoutError("Account not found.", 404);
  return row;
}
export async function ensureCircleAccount(tx: Tx, user: Member) {
  const created = await tx
    .insert(circleAccount)
    .values({ userId: user.id })
    .onConflictDoNothing()
    .returning();
  if (created.length && user.loyaltyPoints > 0)
    await tx.insert(circlePointLot).values({
      userId: user.id,
      source: "legacy",
      sourceKey: `legacy:${user.id}`,
      points: user.loyaltyPoints,
      remainingPoints: user.loyaltyPoints,
    });
}
async function heldPoints(tx: Tx, userId: string, excludeOrderId?: string) {
  const rows = await tx
    .select({ lotId: circleRedemption.lotId, points: circleRedemption.points })
    .from(circleRedemption)
    .innerJoin(circlePointLot, eq(circleRedemption.lotId, circlePointLot.id))
    .where(
      and(
        eq(circlePointLot.userId, userId),
        eq(circleRedemption.status, "reserved"),
      ),
    );
  const held = new Map<string, number>();
  rows.forEach((row) =>
    held.set(row.lotId, (held.get(row.lotId) ?? 0) + row.points),
  );
  const reservations = await tx
    .select({ id: orderTable.id, points: orderTable.loyaltyPointsRedeemed })
    .from(orderTable)
    .where(
      and(
        eq(orderTable.userId, userId),
        eq(orderTable.loyaltyPointsStatus, "reserved"),
      ),
    );
  let floating =
    reservations
      .filter((row) => row.id !== excludeOrderId)
      .reduce((sum, row) => sum + row.points, 0) -
    [...held.values()].reduce((sum, value) => sum + value, 0);
  if (floating > 0) {
    const lots = await tx
      .select()
      .from(circlePointLot)
      .where(eq(circlePointLot.userId, userId))
      .orderBy(asc(circlePointLot.createdAt), asc(circlePointLot.id));
    for (const lot of lots) {
      const count = Math.min(
        floating,
        lot.remainingPoints - (held.get(lot.id) ?? 0),
      );
      if (count > 0) {
        held.set(lot.id, (held.get(lot.id) ?? 0) + count);
        floating -= count;
      }
      if (floating <= 0) break;
    }
  }
  return held;
}
export async function creditCirclePoints(
  tx: Tx,
  userId: string,
  points: number,
  source: string,
  sourceKey: string,
  expiresAt: Date | null,
  description: string,
  options: {
    tierKey?: string;
    orderId?: string;
    type?: "order_reward" | "transfer_received" | "adjustment";
  } = {},
) {
  if (points <= 0) return;
  const [account] = await tx
    .select()
    .from(circleAccount)
    .where(eq(circleAccount.userId, userId));
  const offset = Math.min(points, account.debtPoints);
  const added = points - offset;
  const created = await tx
    .insert(circlePointLot)
    .values({
      userId,
      source,
      sourceKey,
      points,
      remainingPoints: added,
      expiresAt,
      tierKey: options.tierKey,
      orderId: options.orderId,
    })
    .onConflictDoNothing()
    .returning();
  if (!created.length) return;
  if (offset)
    await tx
      .update(circleAccount)
      .set({ debtPoints: account.debtPoints - offset })
      .where(eq(circleAccount.userId, userId));
  if (added > 0) {
    const [updated] = await tx
      .update(userTable)
      .set({
        loyaltyPoints: sql`${userTable.loyaltyPoints} + ${added}`,
        updatedAt: new Date(),
      })
      .where(eq(userTable.id, userId))
      .returning();
    if (updated.loyaltyPoints > 2147483647)
      throw new Error("Points balance exceeds the supported range");
    await tx.insert(loyaltyTransactionsTable).values({
      userId,
      type: options.type ?? "adjustment",
      points: added,
      balanceAfter: updated.loyaltyPoints,
      orderId: options.orderId,
      description,
      referenceKey: `circle:${sourceKey}`,
    });
  }
}
async function expirePoints(tx: Tx, userId: string, now: Date) {
  const held = await heldPoints(tx, userId);
  const lots = await tx
    .select()
    .from(circlePointLot)
    .where(
      and(
        eq(circlePointLot.userId, userId),
        gt(circlePointLot.remainingPoints, 0),
      ),
    )
    .for("update");
  let expired = 0;
  for (const lot of lots)
    if (lot.expiresAt && lot.expiresAt <= now) {
      const free = lot.remainingPoints - (held.get(lot.id) ?? 0);
      if (free > 0) {
        expired += free;
        await tx
          .update(circlePointLot)
          .set({
            remainingPoints: lot.remainingPoints - free,
            expiredPoints:
              lot.expiredPoints +
              Math.min(free, lot.points - lot.voidedPoints - lot.expiredPoints),
          })
          .where(eq(circlePointLot.id, lot.id));
      }
    }
  if (expired) {
    const [updated] = await tx
      .update(userTable)
      .set({ loyaltyPoints: sql`${userTable.loyaltyPoints} - ${expired}` })
      .where(eq(userTable.id, userId))
      .returning();
    await tx.insert(loyaltyTransactionsTable).values({
      userId,
      type: "adjustment",
      points: -expired,
      balanceAfter: updated.loyaltyPoints,
      description: "Circle Points expired after 24 months",
      referenceKey: `circle:expiry:${randomUUID()}`,
    });
  }
}
// Reversals first remove unreserved available value. Spent/transferred value is
// recorded as a points adjustment and recovered from future earned points.
export async function reverseCirclePoints(
  tx: Tx,
  userId: string,
  amount: number,
  reference: string,
  description: string,
  preferredLotIds: string[] = [],
) {
  const held = await heldPoints(tx, userId);
  const lots = await tx
    .select()
    .from(circlePointLot)
    .where(
      and(
        eq(circlePointLot.userId, userId),
        gt(circlePointLot.remainingPoints, 0),
      ),
    )
    .orderBy(asc(circlePointLot.expiresAt), asc(circlePointLot.createdAt))
    .for("update");
  lots.sort(
    (a, b) =>
      Number(preferredLotIds.includes(b.id)) -
      Number(preferredLotIds.includes(a.id)),
  );
  let remaining = amount;
  for (const lot of lots) {
    const used = Math.min(
      remaining,
      lot.remainingPoints - (held.get(lot.id) ?? 0),
    );
    if (used > 0) {
      await tx
        .update(circlePointLot)
        .set({ remainingPoints: lot.remainingPoints - used })
        .where(eq(circlePointLot.id, lot.id));
      remaining -= used;
    }
    if (!remaining) break;
  }
  if (remaining)
    await tx
      .update(circleAccount)
      .set({ debtPoints: sql`${circleAccount.debtPoints} + ${remaining}` })
      .where(eq(circleAccount.userId, userId));
  const removed = amount - remaining;
  if (removed) {
    const [updated] = await tx
      .update(userTable)
      .set({ loyaltyPoints: sql`${userTable.loyaltyPoints} - ${removed}` })
      .where(eq(userTable.id, userId))
      .returning();
    await tx.insert(loyaltyTransactionsTable).values({
      userId,
      type: "reward_reversal",
      points: -removed,
      balanceAfter: updated.loyaltyPoints,
      description,
      referenceKey: reference,
    });
  }
}
// Expired, unused awards have already left the balance and must not create debt
// when a qualifying purchase is later returned.
export async function reverseCircleAward(
  tx: Tx,
  userId: string,
  amount: number,
  reference: string,
  description: string,
  selector: { sourceKey?: string; source?: string; tierKey?: string },
) {
  const lots = await tx
    .select()
    .from(circlePointLot)
    .where(
      and(
        eq(circlePointLot.userId, userId),
        selector.sourceKey
          ? eq(circlePointLot.sourceKey, selector.sourceKey)
          : undefined,
        selector.source
          ? eq(circlePointLot.source, selector.source)
          : undefined,
        selector.tierKey
          ? eq(circlePointLot.tierKey, selector.tierKey)
          : undefined,
      ),
    )
    .orderBy(desc(circlePointLot.createdAt), desc(circlePointLot.id))
    .for("update");
  let remaining = amount;
  let owed = 0;
  const preferred: string[] = [];
  for (const lot of lots) {
    const take = Math.min(remaining, lot.points - lot.voidedPoints);
    if (take <= 0) continue;
    const expired = Math.min(take, lot.expiredPoints);
    await tx
      .update(circlePointLot)
      .set({
        voidedPoints: lot.voidedPoints + take,
        expiredPoints: lot.expiredPoints - expired,
      })
      .where(eq(circlePointLot.id, lot.id));
    preferred.push(lot.id);
    remaining -= take;
    owed += take - expired;
    if (!remaining) break;
  }
  if (remaining)
    throw new Error("Circle award reversal exceeds the original award");
  if (owed)
    await reverseCirclePoints(
      tx,
      userId,
      owed,
      reference,
      description,
      preferred,
    );
}
async function syncBonuses(tx: Tx, userId: string, availableAt: Date) {
  const rewards = await tx
    .select()
    .from(circleOrderReward)
    .where(
      and(
        eq(circleOrderReward.userId, userId),
        eq(circleOrderReward.status, "available"),
      ),
    );
  for (const tier of ["lumiere", "royale"] as const) {
    const spend = rewards
      .filter((row) => row.tierKey === tier)
      .reduce((sum, row) => sum + row.eligibleAmount, 0);
    const expected =
      Math.floor(spend / 50000) * (tier === "lumiere" ? 12500 : 25000);
    const [account] = await tx
      .select()
      .from(circleAccount)
      .where(eq(circleAccount.userId, userId));
    const field =
      tier === "lumiere" ? "lumiereBonusPoints" : "royaleBonusPoints";
    const change = expected - account[field];
    if (!change) continue;
    const version = account.rewardsVersion + 1;
    const reference = `milestone:${userId}:${tier}:${version}`;
    if (change > 0)
      await creditCirclePoints(
        tx,
        userId,
        change,
        "milestone",
        reference,
        addCircleMonths(availableAt, 24),
        `${tier === "lumiere" ? "Lumiere" : "Royale"} ₹50,000 milestone bonus`,
        { tierKey: tier },
      );
    else
      await reverseCircleAward(
        tx,
        userId,
        -change,
        `circle:${reference}:reversal`,
        "Milestone bonus reversed after a return",
        { source: "milestone", tierKey: tier },
      );
    await tx
      .update(circleAccount)
      .set({ [field]: expected, rewardsVersion: version })
      .where(eq(circleAccount.userId, userId));
  }
}
async function claimTransfers(tx: Tx, user: Member, now: Date) {
  const transfers = await tx
    .select()
    .from(circleTransfer)
    .where(
      and(
        eq(circleTransfer.recipientEmail, user.email.toLowerCase()),
        eq(circleTransfer.status, "pending"),
      ),
    )
    .for("update");
  for (const transfer of transfers) {
    let received = 0;
    for (const [index, slice] of transfer.slices.entries()) {
      const expiry = slice.expiresAt ? new Date(slice.expiresAt) : null;
      if (expiry && expiry <= now) continue;
      received += slice.points;
      await creditCirclePoints(
        tx,
        user.id,
        slice.points,
        "transfer",
        `transfer:${transfer.id}:${index}`,
        expiry,
        "Circle Points received from a member",
        { type: "transfer_received" },
      );
    }
    await tx
      .update(circleTransfer)
      .set({
        recipientId: user.id,
        claimedPoints: received,
        status: received > 0 ? "claimed" : "expired",
      })
      .where(eq(circleTransfer.id, transfer.id));
  }
}
export async function refreshCircleAccount(
  tx: Tx,
  user: Member,
  now = new Date(),
) {
  await ensureCircleAccount(tx, user);
  const rows = await tx
    .select({
      reward: circleOrderReward,
      status: orderTable.status,
      updatedAt: orderTable.updatedAt,
    })
    .from(circleOrderReward)
    .innerJoin(orderTable, eq(circleOrderReward.orderId, orderTable.id))
    .where(eq(circleOrderReward.userId, user.id))
    .orderBy(
      asc(circleOrderReward.qualifyingAt),
      asc(circleOrderReward.createdAt),
    );
  for (const { reward, status, updatedAt } of rows) {
    if (["cancelled", "returned"].includes(status)) {
      if (reward.status === "available")
        await reverseCircleAward(
          tx,
          user.id,
          reward.normalPoints,
          `circle:order:${reward.orderId}:reversal`,
          `Points reversed for returned order ${reward.orderId}`,
          { sourceKey: `order:${reward.orderId}:reward` },
        );
      if (reward.status !== "reversed") {
        await tx
          .update(circleOrderReward)
          .set({ status: "reversed" })
          .where(eq(circleOrderReward.orderId, reward.orderId));
        await syncBonuses(tx, user.id, now);
      }
      continue;
    }
    if (reward.status === "reversed") continue;
    let qualifyingAt = reward.qualifyingAt;
    if (status === "delivered" && !qualifyingAt) {
      qualifyingAt = new Date(updatedAt.getTime() + 5 * 86400000);
      await tx
        .update(circleOrderReward)
        .set({ status: "pending", qualifyingAt })
        .where(eq(circleOrderReward.orderId, reward.orderId));
    }
    if (
      status === "delivered" &&
      qualifyingAt &&
      qualifyingAt <= now &&
      reward.status !== "available"
    ) {
      await creditCirclePoints(
        tx,
        user.id,
        reward.normalPoints,
        "order",
        `order:${reward.orderId}:reward`,
        addCircleMonths(qualifyingAt, 24),
        `Earned points from order ${reward.orderId}`,
        {
          type: "order_reward",
          orderId: reward.orderId,
          tierKey: reward.tierKey,
        },
      );
      await tx
        .update(circleOrderReward)
        .set({ status: "available" })
        .where(eq(circleOrderReward.orderId, reward.orderId));
      await syncBonuses(tx, user.id, qualifyingAt);
    }
  }
  await claimTransfers(tx, user, now);
  await expirePoints(tx, user.id, now);
  return (
    await tx.select().from(userTable).where(eq(userTable.id, user.id))
  )[0];
}
async function pointSlices(
  tx: Tx,
  userId: string,
  amount: number,
  spend: boolean,
  excludeOrderId?: string,
) {
  const held = await heldPoints(tx, userId, excludeOrderId);
  const lots = await tx
    .select()
    .from(circlePointLot)
    .where(
      and(
        eq(circlePointLot.userId, userId),
        gt(circlePointLot.remainingPoints, 0),
      ),
    )
    .orderBy(
      asc(circlePointLot.expiresAt),
      asc(circlePointLot.createdAt),
      asc(circlePointLot.id),
    )
    .for("update");
  const slices: { lotId: string; points: number; expiresAt: Date | null }[] =
    [];
  let needed = amount;
  for (const lot of lots) {
    const points = Math.min(
      needed,
      lot.remainingPoints - (held.get(lot.id) ?? 0),
    );
    if (points <= 0) continue;
    slices.push({ lotId: lot.id, points, expiresAt: lot.expiresAt });
    needed -= points;
    if (spend)
      await tx
        .update(circlePointLot)
        .set({ remainingPoints: lot.remainingPoints - points })
        .where(eq(circlePointLot.id, lot.id));
    if (!needed) break;
  }
  if (needed)
    throw new CheckoutError("Insufficient available Circle Points.", 409);
  return slices;
}
export async function reserveCirclePoints(
  tx: Tx,
  userId: string,
  orderId: string,
  points: number,
) {
  if (points <= 0) return;
  const slices = await pointSlices(tx, userId, points, false, orderId);
  await tx.insert(circleRedemption).values(
    slices.map((slice) => ({
      orderId,
      lotId: slice.lotId,
      points: slice.points,
    })),
  );
}
export async function settleCircleOrder(
  tx: Tx,
  order: typeof orderTable.$inferSelect,
) {
  const user = await member(tx, order.userId);
  await ensureCircleAccount(tx, user);
  const points = order.loyaltyPointsRedeemed;
  if (
    points > 0 &&
    (points < 1000 ||
      points % 100 !== 0 ||
      order.discountAmount !== points / 10 ||
      points > (order.checkoutSnapshot?.circle?.eligibleAmount ?? 0) * 2)
  )
    throw new Error("Invalid Circle Points redemption");
  if (points > 0) {
    const allocations = await tx
      .select()
      .from(circleRedemption)
      .where(eq(circleRedemption.orderId, order.id));
    if (
      allocations.reduce(
        (sum, row) => sum + (row.status === "reserved" ? row.points : 0),
        0,
      ) !== points ||
      user.loyaltyPoints < points
    )
      throw new Error("Circle Points reservation does not match this order");
    for (const allocation of allocations) {
      const [lot] = await tx
        .select()
        .from(circlePointLot)
        .where(eq(circlePointLot.id, allocation.lotId))
        .for("update");
      if (
        !lot ||
        lot.userId !== user.id ||
        lot.remainingPoints < allocation.points
      )
        throw new Error("Invalid Circle Points allocation");
      await tx
        .update(circlePointLot)
        .set({ remainingPoints: lot.remainingPoints - allocation.points })
        .where(eq(circlePointLot.id, lot.id));
    }
    await tx
      .update(circleRedemption)
      .set({ status: "spent" })
      .where(eq(circleRedemption.orderId, order.id));
    await tx
      .update(userTable)
      .set({ loyaltyPoints: user.loyaltyPoints - points })
      .where(eq(userTable.id, user.id));
    await tx.insert(loyaltyTransactionsTable).values({
      userId: user.id,
      type: "redemption",
      points: -points,
      balanceAfter: user.loyaltyPoints - points,
      orderId: order.id,
      description: `Used points for order ${order.id}`,
      referenceKey: `order:${order.id}:redemption`,
    });
  }
  const reward = order.checkoutSnapshot?.circle;
  if (!reward) throw new Error("Missing Circle programme snapshot");
  await tx
    .insert(circleOrderReward)
    .values({
      orderId: order.id,
      userId: user.id,
      tierKey: reward.tierKey,
      eligibleAmount: reward.netEligibleAmount,
      normalPoints: reward.normalPoints,
    })
    .onConflictDoNothing();
}
export async function updateCircleFulfilment(
  tx: Tx,
  order: typeof orderTable.$inferSelect,
  status: string,
  now = new Date(),
) {
  if (!order.checkoutSnapshot?.circle) return;
  const user = await member(tx, order.userId);
  if (status === "delivered") {
    await tx
      .update(circleOrderReward)
      .set({
        status: "pending",
        qualifyingAt: new Date(now.getTime() + 5 * 86400000),
      })
      .where(
        and(
          eq(circleOrderReward.orderId, order.id),
          eq(circleOrderReward.status, "pending_delivery"),
        ),
      );
  }
  await refreshCircleAccount(tx, user, now);
}
export async function circleSummary(tx: Tx, user: Member, now = new Date()) {
  const rewards = await tx
    .select()
    .from(circleOrderReward)
    .where(eq(circleOrderReward.userId, user.id));
  const cutoff = addCircleMonths(now, -24);
  const qualifyingSpend = rewards
    .filter(
      (row) =>
        row.status === "available" &&
        row.qualifyingAt &&
        row.qualifyingAt >= cutoff &&
        row.qualifyingAt <= now,
    )
    .reduce((sum, row) => sum + row.eligibleAmount, 0);
  const lots = await tx
    .select()
    .from(circlePointLot)
    .where(
      and(
        eq(circlePointLot.userId, user.id),
        gt(circlePointLot.remainingPoints, 0),
      ),
    );
  const held = await heldPoints(tx, user.id);
  const availability = await getLoyaltyAvailability(
    user.id,
    user.loyaltyPoints,
    tx,
  );
  const [account] = await tx
    .select()
    .from(circleAccount)
    .where(eq(circleAccount.userId, user.id));
  const entries = await tx
    .select()
    .from(loyaltyTransactionsTable)
    .where(eq(loyaltyTransactionsTable.userId, user.id))
    .orderBy(desc(loyaltyTransactionsTable.createdAt))
    .limit(100);
  const transfers = await tx
    .select({
      id: circleTransfer.id,
      recipientEmail: circleTransfer.recipientEmail,
      points: circleTransfer.points,
      claimedPoints: circleTransfer.claimedPoints,
      status: circleTransfer.status,
      createdAt: circleTransfer.createdAt,
    })
    .from(circleTransfer)
    .where(eq(circleTransfer.senderId, user.id))
    .orderBy(desc(circleTransfer.createdAt))
    .limit(30);
  const soon = now.getTime() + 90 * 86400000;
  const expires = lots.filter(
    (lot) =>
      lot.expiresAt &&
      lot.expiresAt > now &&
      lot.remainingPoints > (held.get(lot.id) ?? 0),
  );
  return {
    enabled: true,
    ...availability,
    qualifyingSpend,
    ...circleProgress(qualifyingSpend),
    pendingPoints: rewards
      .filter((row) => ["pending", "pending_delivery"].includes(row.status))
      .reduce((sum, row) => sum + row.normalPoints, 0),
    expiringPoints: expires
      .filter((lot) => lot.expiresAt!.getTime() <= soon)
      .reduce(
        (sum, lot) => sum + lot.remainingPoints - (held.get(lot.id) ?? 0),
        0,
      ),
    nextExpiry:
      expires
        .map((lot) => lot.expiresAt!)
        .sort((a, b) => a.getTime() - b.getTime())[0] ?? null,
    adjustmentPoints: account.debtPoints,
    lumiereMilestoneSpend: rewards
      .filter((row) => row.status === "available" && row.tierKey === "lumiere")
      .reduce((sum, row) => sum + row.eligibleAmount, 0),
    royaleMilestoneSpend: rewards
      .filter((row) => row.status === "available" && row.tierKey === "royale")
      .reduce((sum, row) => sum + row.eligibleAmount, 0),
    entries,
    transfers,
  };
}
export async function getCircleSummary(userId: string, now = new Date()) {
  return db.transaction(async (tx) => {
    const current = await refreshCircleAccount(
      tx,
      await member(tx, userId),
      now,
    );
    return circleSummary(tx, current, now);
  });
}
export async function transferCirclePoints(
  senderId: string,
  input: { id: string; email: string; points: number },
) {
  const email = input.email.trim().toLowerCase();
  if (
    !Number.isSafeInteger(input.points) ||
    input.points < 1000 ||
    input.points > 2147483647 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  )
    throw new CheckoutError(
      "Enter a valid email and at least 1,000 whole Circle Points.",
    );
  return db.transaction(async (tx) => {
    const accounts = await tx
      .select()
      .from(userTable)
      .where(
        sql`${userTable.id} = ${senderId} or lower(${userTable.email}) = ${email}`,
      )
      .orderBy(asc(userTable.id))
      .for("update");
    let sender = accounts.find((row) => row.id === senderId);
    const recipient = accounts.find((row) => row.email.toLowerCase() === email);
    if (!sender) throw new CheckoutError("Account not found.", 404);
    if (sender.email.toLowerCase() === email)
      throw new CheckoutError("You cannot send points to yourself.");
    const [existing] = await tx
      .select()
      .from(circleTransfer)
      .where(eq(circleTransfer.id, input.id));
    if (existing) {
      if (
        existing.senderId !== senderId ||
        existing.recipientEmail !== email ||
        existing.points !== input.points
      )
        throw new CheckoutError(
          "This transfer request is already in use.",
          409,
        );
      return existing;
    }
    sender = await refreshCircleAccount(tx, sender);
    const { availablePoints } = await getLoyaltyAvailability(
      sender.id,
      sender.loyaltyPoints,
      tx,
    );
    if (input.points > availablePoints)
      throw new CheckoutError(
        "Insufficient available points. Pending checkouts may reserve some points.",
        409,
      );
    const slices = await pointSlices(tx, sender.id, input.points, true);
    await tx
      .update(userTable)
      .set({ loyaltyPoints: sender.loyaltyPoints - input.points })
      .where(eq(userTable.id, sender.id));
    await tx.insert(loyaltyTransactionsTable).values({
      userId: sender.id,
      type: "transfer_sent",
      points: -input.points,
      balanceAfter: sender.loyaltyPoints - input.points,
      relatedUserId: recipient?.id,
      transferId: input.id,
      description: `Sent Circle Points to ${email}`,
      referenceKey: `transfer:${input.id}:sent`,
    });
    await tx.insert(circleTransfer).values({
      id: input.id,
      senderId: sender.id,
      recipientEmail: email,
      points: input.points,
      slices: slices.map((slice) => ({
        points: slice.points,
        expiresAt: slice.expiresAt?.toISOString() ?? null,
      })),
    });
    if (recipient) {
      const refreshed = await refreshCircleAccount(tx, recipient);
      await claimTransfers(tx, refreshed, new Date());
    }
    return (
      await tx
        .select()
        .from(circleTransfer)
        .where(eq(circleTransfer.id, input.id))
    )[0];
  });
}

// An in-flight checkout from before programme activation keeps its original
// reward rate. Mirror its spending/credit into lots so adopting an old balance
// cannot leave the new lot ledger out of sync with the account balance.
export async function settleLegacyOrderInCircle(
  tx: Tx,
  order: typeof orderTable.$inferSelect,
  paid: number,
) {
  const user = await member(tx, order.userId);
  await ensureCircleAccount(tx, user);
  const redeemed = order.loyaltyPointsRedeemed;
  if (redeemed > 0) {
    if (
      order.loyaltyPointsStatus !== "reserved" ||
      redeemed % 10 !== 0 ||
      redeemed > user.loyaltyPoints ||
      order.discountAmount !== redeemed / 10 ||
      redeemed > order.subtotalAmount * 2
    )
      throw new Error("Invalid legacy points reservation");
    await pointSlices(tx, user.id, redeemed, true, order.id);
    await tx
      .update(userTable)
      .set({ loyaltyPoints: user.loyaltyPoints - redeemed })
      .where(eq(userTable.id, user.id));
    await tx
      .insert(loyaltyTransactionsTable)
      .values({
        userId: user.id,
        type: "redemption",
        points: -redeemed,
        balanceAfter: user.loyaltyPoints - redeemed,
        orderId: order.id,
        description: `Used points for order ${order.id}`,
        referenceKey: `order:${order.id}:redemption`,
      });
  }
  const earned = Math.floor(Math.max(0, paid) / 100) * 10;
  await creditCirclePoints(
    tx,
    user.id,
    earned,
    "legacy_order",
    `legacy-order:${order.id}:reward`,
    null,
    `Earned points from an earlier programme checkout ${order.id}`,
    { type: "order_reward", orderId: order.id },
  );
}
