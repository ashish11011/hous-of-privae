import { createHash } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { giftCard, giftCardTransaction } from "@/db/giftCardSchema";
import { userTable } from "@/db/schema";
import { db } from "@/lib/db";
import razorpay from "@/lib/razorpay";
import { CheckoutError } from "@/lib/payments/checkout-error";
import {
  paymentTransition,
  type PaymentEvent,
} from "@/lib/payments/razorpay-events";
import { sendGiftCardEmail } from "@/lib/email/ses";
import {
  assertGiftCardEncryption,
  createGiftCardCode,
  decryptGiftCardCode,
  encryptGiftCardCode,
  hashGiftCardCode,
} from "./crypto";
import {
  assertGiftCardUsable,
  giftCardAvailableBalance,
  isGiftCardSchemaMissing,
} from "./redemption";
import type { GiftCardPurchaseInput } from "./validation";

export async function createGiftCardPurchase(
  input: GiftCardPurchaseInput,
  userId: string,
) {
  try {
    assertGiftCardEncryption();
  } catch {
    throw new CheckoutError(
      "Gift card purchasing is not available yet. Please try again later.",
      503,
    );
  }
  const { requestId: id, ...details } = input;
  const requestHash = createHash("sha256")
    .update(JSON.stringify(details))
    .digest("hex");
  return db.transaction(async (tx) => {
    const [buyer] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .for("update");
    if (!buyer)
      throw new CheckoutError("Sign in to purchase a gift card.", 401);
    const [existing] = await tx
      .select()
      .from(giftCard)
      .where(eq(giftCard.id, id));
    if (existing) {
      if (
        existing.purchaserId !== userId ||
        existing.requestHash !== requestHash
      )
        throw new CheckoutError(
          "This payment request is already in use. Start a new gift card purchase.",
          409,
        );
      if (!existing.razorpayOrderId)
        throw new CheckoutError(
          "This payment is not ready. Please try again.",
          409,
        );
      return purchasePayment(existing);
    }
    const amount = input.amount * 100;
    const gateway = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: id,
      notes: { gift_card_id: id, purchase_type: "gift_card" },
    });
    const [saved] = await tx
      .insert(giftCard)
      .values({
        id,
        purchaserId: userId,
        purchaserEmail: buyer.email,
        senderName: input.senderName,
        recipientName: input.recipientName,
        recipientEmail: input.recipientEmail || null,
        message: input.message,
        design: input.design,
        requestHash,
        initialAmountPaise: amount,
        expectedAmountPaise: amount,
        razorpayOrderId: gateway.id,
      })
      .returning();
    return purchasePayment(saved);
  });
}

export function purchasePayment(card: typeof giftCard.$inferSelect) {
  return {
    success: true,
    id: card.id,
    orderId: card.razorpayOrderId,
    amount: card.expectedAmountPaise,
    currency: card.currency,
    confirmed: card.paymentStatus === "paid",
  };
}

export async function claimGiftCard(code: string, userId: string) {
  return db.transaction(async (tx) => {
    const [card] = await tx
      .select()
      .from(giftCard)
      .where(eq(giftCard.codeHash, hashGiftCardCode(code)))
      .for("update");
    assertGiftCardUsable(card, userId);
    await tx
      .update(giftCard)
      .set({ claimedById: userId, updatedAt: new Date() })
      .where(eq(giftCard.id, card.id));
    return {
      id: card.id,
      balancePaise: await giftCardAvailableBalance(card, tx),
    };
  });
}

export async function getAccountGiftCards(userId: string) {
  const cards = await db
    .select()
    .from(giftCard)
    .where(
      or(eq(giftCard.purchaserId, userId), eq(giftCard.claimedById, userId)),
    )
    .orderBy(desc(giftCard.createdAt));
  return Promise.all(
    cards.map(async (card) => ({
      id: card.id,
      amountPaise: card.initialAmountPaise,
      balancePaise: card.balancePaise,
      availablePaise:
        card.paymentStatus === "paid"
          ? await giftCardAvailableBalance(card)
          : 0,
      senderName: card.senderName,
      recipientName: card.recipientName,
      recipientEmail: card.purchaserId === userId ? card.recipientEmail : null,
      message: card.message,
      design: card.design,
      paymentStatus: card.paymentStatus,
      code:
        card.paymentStatus === "paid" && card.encryptedCode
          ? decryptGiftCardCode(card.encryptedCode)
          : null,
      isPurchased: card.purchaserId === userId,
      isClaimed: Boolean(card.claimedById),
      isMine: card.claimedById === userId,
      emailDelivered: card.recipientEmail
        ? Boolean(card.recipientEmailSentAt)
        : null,
      createdAt: card.createdAt,
      activatedAt: card.activatedAt,
      transactions:
        card.claimedById === userId
          ? await db
              .select({
                id: giftCardTransaction.id,
                type: giftCardTransaction.type,
                amountPaise: giftCardTransaction.amountPaise,
                balanceAfterPaise: giftCardTransaction.balanceAfterPaise,
                orderId: giftCardTransaction.orderId,
                createdAt: giftCardTransaction.createdAt,
              })
              .from(giftCardTransaction)
              .where(eq(giftCardTransaction.giftCardId, card.id))
              .orderBy(desc(giftCardTransaction.createdAt))
          : [],
    })),
  );
}

export async function sendGiftCardDeliveries(id: string) {
  for (const recipient of ["purchaser", "recipient"] as const) {
    await db.transaction(async (tx) => {
      const [card] = await tx
        .select()
        .from(giftCard)
        .where(eq(giftCard.id, id))
        .for("update");
      if (!card || card.paymentStatus !== "paid" || !card.encryptedCode) return;
      if (
        recipient === "purchaser"
          ? card.purchaserEmailSentAt
          : !card.recipientEmail || card.recipientEmailSentAt
      )
        return;
      await sendGiftCardEmail({
        to:
          recipient === "purchaser"
            ? card.purchaserEmail
            : card.recipientEmail!,
        purchaser: recipient === "purchaser",
        senderName: card.senderName,
        recipientName: card.recipientName,
        amountPaise: card.initialAmountPaise,
        message: card.message,
        code: decryptGiftCardCode(card.encryptedCode),
      });
      await tx
        .update(giftCard)
        .set(
          recipient === "purchaser"
            ? { purchaserEmailSentAt: new Date() }
            : { recipientEmailSentAt: new Date() },
        )
        .where(eq(giftCard.id, card.id));
    });
  }
}

export async function processGiftCardPayment(payment: PaymentEvent) {
  // Probe outside a transaction so an unapplied gift-card schema does not abort
  // ordinary garment payment processing during a staged deployment.
  let found;
  try {
    [found] = await db
      .select({ id: giftCard.id })
      .from(giftCard)
      .where(eq(giftCard.razorpayOrderId, payment.order_id));
  } catch (error) {
    if (isGiftCardSchemaMissing(error)) return false;
    throw error;
  }
  if (!found) return false;
  await db.transaction(async (tx) => {
    const [card] = await tx
      .select()
      .from(giftCard)
      .where(eq(giftCard.id, found.id))
      .for("update");
    const transition = paymentTransition(card, payment);
    if (!transition) return;
    if (transition.paymentStatus !== "paid") {
      await tx
        .update(giftCard)
        .set({
          paymentStatus: transition.paymentStatus,
          razorpayPaymentId: payment.id,
          updatedAt: new Date(),
        })
        .where(eq(giftCard.id, card.id));
      return;
    }
    const code = createGiftCardCode();
    await tx
      .update(giftCard)
      .set({
        paymentStatus: "paid",
        razorpayPaymentId: payment.id,
        balancePaise: card.initialAmountPaise,
        codeHash: hashGiftCardCode(code),
        encryptedCode: encryptGiftCardCode(code),
        codeSuffix: code.slice(-4),
        activatedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(giftCard.id, card.id));
    await tx.insert(giftCardTransaction).values({
      giftCardId: card.id,
      userId: card.purchaserId,
      type: "purchase",
      amountPaise: card.initialAmountPaise,
      balanceAfterPaise: card.initialAmountPaise,
      referenceKey: `gift-card:${card.id}:purchase`,
    });
  });
  if (payment.status === "captured") await sendGiftCardDeliveries(found.id);
  return true;
}

export async function getPurchasedGiftCard(id: string, userId: string) {
  const [card] = await db
    .select()
    .from(giftCard)
    .where(and(eq(giftCard.id, id), eq(giftCard.purchaserId, userId)));
  if (!card) throw new CheckoutError("Gift card not found.", 404);
  return card;
}
