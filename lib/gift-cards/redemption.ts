import { and, desc, eq } from "drizzle-orm";
import {
  giftCard,
  giftCardReservation,
  giftCardTransaction,
} from "@/db/giftCardSchema";
import { orderTable } from "@/db/schema";
import { db } from "@/lib/db";
import type { LoyaltyDatabaseTransaction } from "@/lib/loyaltyBalance";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { hashGiftCardCode } from "./crypto";

type Database = typeof db | LoyaltyDatabaseTransaction;
export function isGiftCardSchemaMissing(error: unknown): boolean {
  const failure = error as {
    code?: string;
    message?: string;
    cause?: unknown;
  } | null;
  if (!failure || typeof failure !== "object") return false;
  if (
    failure.code === "42P01" &&
    /\bgift_card(?:s|_reservations|_transactions)\b/.test(failure.message ?? "")
  )
    return true;
  return failure.cause ? isGiftCardSchemaMissing(failure.cause) : false;
}

export function assertGiftCardUsable(
  card: typeof giftCard.$inferSelect | undefined,
  userId: string,
) {
  if (
    !card ||
    card.paymentStatus !== "paid" ||
    card.balancePaise <= 0 ||
    (card.claimedById && card.claimedById !== userId)
  )
    throw new CheckoutError(
      "This gift card is invalid, fully used, or belongs to another account.",
    );
}

export async function giftCardAvailableBalance(
  card: typeof giftCard.$inferSelect,
  database: Database = db,
) {
  const reservations = await database
    .select()
    .from(giftCardReservation)
    .where(
      and(
        eq(giftCardReservation.giftCardId, card.id),
        eq(giftCardReservation.status, "reserved"),
      ),
    );
  return Math.max(
    0,
    card.balancePaise -
      reservations.reduce((sum, row) => sum + row.amountPaise, 0),
  );
}

export async function checkGiftCard(code: string, userId: string) {
  const [card] = await db
    .select()
    .from(giftCard)
    .where(eq(giftCard.codeHash, hashGiftCardCode(code)));
  assertGiftCardUsable(card, userId);
  const availablePaise = await giftCardAvailableBalance(card);
  if (!availablePaise)
    throw new CheckoutError(
      "This card's balance is reserved for a pending order. Resume that payment in your dashboard or checkout.",
      409,
    );
  return { id: card.id, suffix: card.codeSuffix, balancePaise: availablePaise };
}

// The caller holds the account lock before taking this card lock. All checkouts
// and settlement use that order, so concurrent spending cannot overdraw a card.
export async function reserveGiftCard(
  tx: LoyaltyDatabaseTransaction,
  code: string,
  userId: string,
  orderId: string,
  totalPaise: number,
) {
  const [card] = await tx
    .select()
    .from(giftCard)
    .where(eq(giftCard.codeHash, hashGiftCardCode(code)))
    .for("update");
  assertGiftCardUsable(card, userId);
  const available = await giftCardAvailableBalance(card, tx);
  if (!available)
    throw new CheckoutError(
      "This gift card's balance is reserved for another pending checkout. Resume that payment first.",
      409,
    );
  // INR checkout accepts whole rupees; preserve a whole-rupee remainder too.
  const amountPaise = Math.min(available, totalPaise);
  await tx
    .update(giftCard)
    .set({ claimedById: userId, updatedAt: new Date() })
    .where(eq(giftCard.id, card.id));
  await tx
    .insert(giftCardReservation)
    .values({ orderId, giftCardId: card.id, userId, amountPaise });
  return { amountPaise, suffix: card.codeSuffix };
}

export async function settleGiftCardReservation(
  tx: LoyaltyDatabaseTransaction,
  orderId: string,
) {
  const [reservation] = await tx
    .select()
    .from(giftCardReservation)
    .where(eq(giftCardReservation.orderId, orderId));
  if (!reservation || reservation.status === "spent") return 0;
  const [card] = await tx
    .select()
    .from(giftCard)
    .where(eq(giftCard.id, reservation.giftCardId))
    .for("update");
  if (
    !card ||
    card.paymentStatus !== "paid" ||
    card.claimedById !== reservation.userId ||
    card.balancePaise < reservation.amountPaise
  )
    throw new Error("Invalid gift card reservation; settlement blocked");
  const balancePaise = card.balancePaise - reservation.amountPaise;
  await tx
    .update(giftCard)
    .set({ balancePaise, updatedAt: new Date() })
    .where(eq(giftCard.id, card.id));
  await tx
    .update(giftCardReservation)
    .set({ status: "spent" })
    .where(eq(giftCardReservation.orderId, orderId));
  await tx.insert(giftCardTransaction).values({
    giftCardId: card.id,
    userId: reservation.userId,
    orderId,
    type: "redemption",
    amountPaise: -reservation.amountPaise,
    balanceAfterPaise: balancePaise,
    referenceKey: `order:${orderId}:gift-card`,
  });
  return reservation.amountPaise;
}

export async function getOrderGiftCardReservation(
  orderId: string,
  database: Database = db,
) {
  try {
    const [reservation] = await database
      .select()
      .from(giftCardReservation)
      .where(eq(giftCardReservation.orderId, orderId));
    return reservation ?? null;
  } catch (error) {
    // Do not query a missing table inside a transaction: PostgreSQL would abort it.
    // Existing orders without gift-card snapshots never call this function.
    if (isGiftCardSchemaMissing(error) && database === db) return null;
    throw error;
  }
}

export async function getPendingGiftCardCheckout(
  userId: string,
  database: Database = db,
) {
  try {
    const [pending] = await database
      .select({
        id: orderTable.id,
        points: orderTable.loyaltyPointsRedeemed,
        amount: orderTable.expectedAmountPaise,
        subtotalAmount: orderTable.subtotalAmount,
        giftCardAmountPaise: giftCardReservation.amountPaise,
      })
      .from(giftCardReservation)
      .innerJoin(orderTable, eq(giftCardReservation.orderId, orderTable.id))
      .where(
        and(
          eq(giftCardReservation.userId, userId),
          eq(giftCardReservation.status, "reserved"),
        ),
      )
      .orderBy(desc(giftCardReservation.createdAt))
      .limit(1);
    return pending ?? null;
  } catch (error) {
    if (isGiftCardSchemaMissing(error) && database === db) return null;
    throw error;
  }
}
