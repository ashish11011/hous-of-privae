import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { accountReferral, referralRedemption } from "@/db/accountSchema";
import { orderTable, userTable } from "@/db/schema";
import { db } from "@/lib/db";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { addCircleMonths } from "./rules";
import {
  circleEnabled,
  creditCirclePoints,
  refreshCircleAccount,
  reverseCircleAward,
} from "./circle";
export const REFERRAL_COOKIE = "hop_referral";
function secret() {
  const value =
    process.env.GIFT_CARD_ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET;
  if (!value) throw new Error("Referral signing is not configured");
  return value;
}
export function referralCookie(code: string) {
  const payload = Buffer.from(
    JSON.stringify({ code, capturedAt: Date.now() }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", secret()).update(payload).digest("hex")}`;
}
export function readReferralCookie(value: string) {
  try {
    const [payload, signature] = value.split(".");
    const expected = createHmac("sha256", secret()).update(payload).digest();
    if (
      !/^[a-f0-9]{64}$/.test(signature) ||
      !timingSafeEqual(expected, Buffer.from(signature, "hex"))
    )
      return null;
    const parsed = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8"),
    );
    if (
      typeof parsed.code !== "string" ||
      typeof parsed.capturedAt !== "number" ||
      parsed.capturedAt > Date.now() ||
      parsed.capturedAt < Date.now() - 30 * 86400000
    )
      return null;
    return parsed as { code: string; capturedAt: number };
  } catch {
    return null;
  }
}
export async function getReferral(userId: string) {
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .for("update");
    if (!user) throw new CheckoutError("Account not found.", 404);
    await tx
      .insert(accountReferral)
      .values({ userId, code: randomBytes(8).toString("hex").toUpperCase() })
      .onConflictDoNothing({ target: accountReferral.userId });
    const [referral] = await tx
      .select()
      .from(accountReferral)
      .where(eq(accountReferral.userId, userId));
    const referrals = await tx
      .select()
      .from(referralRedemption)
      .where(eq(referralRedemption.referrerId, userId));
    return {
      code: referral.code,
      totalReferred: referrals.length,
      creditEarned:
        referrals.filter((row) => row.status === "rewarded").length * 2000,
      pending: referrals.filter((row) => row.status === "pending").length,
    };
  });
}
export async function captureReferralForMember(userId: string, cookie: string) {
  const captured = readReferralCookie(cookie);
  if (!captured) return false;
  return db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .for("update");
    if (
      !user ||
      user.createdAt.getTime() < captured.capturedAt - 5000 ||
      Date.now() - user.createdAt.getTime() > 86400000
    )
      return false;
    const [referrer] = await tx
      .select()
      .from(accountReferral)
      .where(eq(accountReferral.code, captured.code));
    if (!referrer || referrer.userId === userId) return false;
    const orders = await tx
      .select({ id: orderTable.id })
      .from(orderTable)
      .where(eq(orderTable.userId, userId))
      .limit(1);
    if (orders.length) return false;
    await tx
      .insert(referralRedemption)
      .values({ referrerId: referrer.userId, refereeId: userId })
      .onConflictDoNothing({ target: referralRedemption.refereeId });
    return true;
  });
}
export async function settleOrderReferral(orderId: string) {
  if (!(await circleEnabled())) return;
  const [order] = await db
    .select()
    .from(orderTable)
    .where(eq(orderTable.id, orderId));
  if (!order || order.paymentStatus !== "paid") return;
  const [referral] = await db
    .select()
    .from(referralRedemption)
    .where(eq(referralRedemption.refereeId, order.userId));
  if (!referral) return;
  await db.transaction(async (tx) => {
    const members = await tx
      .select()
      .from(userTable)
      .where(inArray(userTable.id, [referral.referrerId, referral.refereeId]))
      .orderBy(asc(userTable.id))
      .for("update");
    const [current] = await tx
      .select()
      .from(referralRedemption)
      .where(eq(referralRedemption.id, referral.id))
      .for("update");
    const first = await tx
      .select({ id: orderTable.id })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.userId, order.userId),
          eq(orderTable.paymentStatus, "paid"),
        ),
      )
      .orderBy(asc(orderTable.createdAt), asc(orderTable.id))
      .limit(1);
    if (
      !current ||
      current.status !== "pending" ||
      first[0]?.id !== order.id ||
      ["cancelled", "returned"].includes(order.status)
    )
      return;
    const now = new Date();
    for (const member of members) {
      await refreshCircleAccount(tx, member, now);
      await creditCirclePoints(
        tx,
        member.id,
        20000,
        "referral",
        `referral:${referral.id}:${member.id}`,
        addCircleMonths(now, 24),
        "₹2,000 wardrobe credit from a referral (20,000 Circle Points)",
      );
    }
    await tx
      .update(referralRedemption)
      .set({ status: "rewarded", firstOrderId: order.id })
      .where(eq(referralRedemption.id, referral.id));
  });
}
export async function reverseOrderReferral(orderId: string) {
  if (!(await circleEnabled())) return;
  const [referral] = await db
    .select()
    .from(referralRedemption)
    .where(
      and(
        eq(referralRedemption.firstOrderId, orderId),
        eq(referralRedemption.status, "rewarded"),
      ),
    );
  if (!referral) return;
  await db.transaction(async (tx) => {
    const users = await tx
      .select()
      .from(userTable)
      .where(inArray(userTable.id, [referral.referrerId, referral.refereeId]))
      .orderBy(asc(userTable.id))
      .for("update");
    const [current] = await tx
      .select()
      .from(referralRedemption)
      .where(eq(referralRedemption.id, referral.id))
      .for("update");
    if (current.status !== "rewarded") return;
    for (const user of users) {
      await refreshCircleAccount(tx, user);
      await reverseCircleAward(
        tx,
        user.id,
        20000,
        `circle:referral:${referral.id}:${user.id}:reversal`,
        "Referral credit reversed after the qualifying order was returned or cancelled",
        { sourceKey: `referral:${referral.id}:${user.id}` },
      );
    }
    await tx
      .update(referralRedemption)
      .set({ status: "reversed" })
      .where(eq(referralRedemption.id, referral.id));
  });
}
