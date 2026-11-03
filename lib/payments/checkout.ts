import { z } from "zod";
import { createHash, randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import {
  orderTable,
  orderItemsTable,
  productTable,
  productVariantsTable,
  userTable,
} from "@/db/schema";
import { priceForSelection } from "@/lib/productPricing";
import { eq, inArray } from "drizzle-orm";
import { getLoyaltyAvailability } from "@/lib/loyaltyBalance";
import { loyaltyPointsToRupees, maximumRedeemablePoints, LOYALTY_POINTS_PER_RUPEE_VALUE } from "@/lib/loyaltyRewards";
import { CheckoutError } from "./checkout-error";
import razorpay from "@/lib/razorpay";
import type { OrderEmailInput } from "@/lib/email/ses";
import { GIFT_WRAP_CHARGE, GIFT_WRAP_NOTE_LIMIT } from "@/lib/giftWrap";
import { giftCardCodeSchema } from "@/lib/gift-cards/validation";
import { getPendingGiftCardCheckout, reserveGiftCard, settleGiftCardReservation } from "@/lib/gift-cards/redemption";
import { settleOrderLoyalty } from "@/lib/loyalty";
import { sendPaidOrderEmails } from "./order-emails";
import { circleEnabled, circleSummary, refreshCircleAccount, reserveCirclePoints } from "@/lib/account/circle";
import { circleMaximumPoints, circleRewardPoints } from "@/lib/account/rules";
import { settleOrderReferral } from "@/lib/account/referrals";

import { ATELIER_NOTE_LIMIT } from "@/lib/orders/atelierNote";

const requiredText = z.string().trim().min(1).max(300);
export const checkoutSchema = z.object({
  giftCardCode: z.union([giftCardCodeSchema, z.literal("")]).default(""),
  requestId: z.uuid().optional(),
  giftWrap: z.boolean().default(false),
  giftWrapNote: z.string().trim().max(GIFT_WRAP_NOTE_LIMIT).default(""),
  atelierNote: z.string().trim().max(ATELIER_NOTE_LIMIT).optional(),
  loyaltyPointsToRedeem: z.number().int().min(0).max(2147483647).multipleOf(LOYALTY_POINTS_PER_RUPEE_VALUE).default(0),
  name: requiredText,
  email: z.string().trim().email().max(254),
  number: z.string().optional(),
  addressLine1: requiredText,
  addressLine2: z.string().trim().max(300).optional().default(""),
  city: requiredText,
  state: requiredText,
  pincode: z.string().optional(),
  productDetails: z
    .array(
      z
        .object({
          id: z.string().uuid(),
          variantId: z.string().uuid(),
          quantity: z.number().int().min(1).max(100),
          size: z.string().trim().max(100).default(""),
          color: z.string().max(100).optional(),
          variant: z.enum(["stitched", "unstitched"]).default("stitched"),
        })
        .refine(
          (item) => item.variant === "unstitched" || item.size.length > 0,
          "Please select a size for stitched items.",
        ),
    )
    .min(1)
    .max(100),
});

export async function createCheckout(input: z.infer<typeof checkoutSchema>) {
  const products = await db
    .select()
    .from(productTable)
    .where(
      inArray(
        productTable.id,
        input.productDetails.map((item) => item.id),
      ),
    );
  const variants = await db
    .select()
    .from(productVariantsTable)
    .where(
      inArray(
        productVariantsTable.id,
        input.productDetails.map((item) => item.variantId),
      ),
    );
  const items = input.productDetails.map((item) => {
    const product = products.find((product) => product.id === item.id);
    const variant = variants.find(
      (variant) =>
        variant.id === item.variantId && variant.productId === item.id,
    );
    if (!product || !variant || product.isInStoke === false)
      throw new Error("A product or variant is no longer available.");
    const price = priceForSelection(
      product.pricingConfig,
      item.size,
      item.variant,
    );
    if (!price) throw new Error("The selected size is no longer available.");
    return {
      ...item,
      productId: product.id,
      size: item.variant === "unstitched" ? "" : price.size,
      color: variant.color,
      name: product.name || "Privae garment",
      unitPrice: price.basePrice,
      image: variant.bannerImage,
      isFullPrice: !(price.strikethroughPrice && price.strikethroughPrice > price.basePrice),
    };
  });
  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  let deliveryCharge = subtotalAmount >= 1199 ? 0 : 60;
  const giftWrapCharge = input.giftWrap ? GIFT_WRAP_CHARGE : 0;
  const giftWrapNote = input.giftWrap ? input.giftWrapNote : "";
  const session = await getServerSession(authOptions);
  const programme = Boolean(session?.id) && await circleEnabled();
  if (programme) deliveryCharge = 0;
  const eligibleAmount = items.filter(item => item.isFullPrice).reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const points = input.loyaltyPointsToRedeem;
  if (input.giftCardCode && (!session?.id || !input.requestId))
    throw new CheckoutError("Sign in and refresh checkout to use a gift card.", 401);
  if (points > 0 && !session?.id)
    throw new CheckoutError("Sign in to use your loyalty points.", 401);
  const id = input.giftCardCode ? input.requestId! : randomUUID();
  const checkoutFingerprint = input.giftCardCode ? createHash("sha256").update(JSON.stringify({ ...input, atelierNote: input.atelierNote || undefined })).digest("hex") : undefined;
  // Lock the user's balance until the reservation and gateway order are saved.
  // A gateway failure rolls back the reservation without taking any points.
  const result = await db.transaction(async (tx) => {
    let [user] = await tx.select().from(userTable)
      .where(session?.id ? eq(userTable.id, session.id) : eq(userTable.email, input.email.toLowerCase()))
      .for("update");
    if (!user && session?.id) throw new CheckoutError("Account not found.", 404);
    if (!user) {
      await tx.insert(userTable).values({ email: input.email.toLowerCase(), name: input.name, number: input.number })
        .onConflictDoNothing({ target: userTable.email });
      [user] = await tx.select().from(userTable).where(eq(userTable.email, input.email.toLowerCase())).for("update");
    }
    if (!user) throw new CheckoutError("Unable to find your account.", 404);
    if (programme) user = await refreshCircleAccount(tx, user);
    if (input.giftCardCode) {
      const [existing] = await tx.select().from(orderTable).where(eq(orderTable.id, id));
      if (existing) {
        if (existing.userId !== user.id || existing.checkoutSnapshot?.checkoutFingerprint !== checkoutFingerprint)
          throw new CheckoutError("This checkout request is already in use. Refresh checkout to start again.", 409);
        return {
          success: true, orderId: existing.razorpayOrderId, internalOrderId: existing.id,
          amount: existing.expectedAmountPaise ?? 0, currency: existing.currency,
          confirmed: existing.paymentStatus === "paid", loyaltyPointsRedeemed: existing.loyaltyPointsRedeemed,
          totalAmountPaid: existing.totalAmountPaid ?? 0,
          giftCardAmount: existing.checkoutSnapshot?.giftCardAmount ?? 0,
          circle: existing.checkoutSnapshot?.circle,
        };
      }
      if (await getPendingGiftCardCheckout(user.id, tx))
        throw new CheckoutError("You have a pending gift card checkout. Resume that payment before starting another.", 409);
    }
    if (points > 0) {
      const availability = await getLoyaltyAvailability(user.id, user.loyaltyPoints, tx);
      if (availability.pendingCheckout)
        throw new CheckoutError("You have a pending checkout using points. Resume its payment before using points for another order.", 409);
      if (programme && (points < 1000 || points % 100 !== 0)) throw new CheckoutError("Redeem at least 1,000 Circle Points in multiples of 100.");
      if (points > (programme ? circleMaximumPoints(eligibleAmount, availability.availablePoints) : maximumRedeemablePoints(subtotalAmount, availability.availablePoints)))
        throw new CheckoutError("Points must fit your available balance and cover no more than 20% of the cart value.");
    }
    const discountAmount = loyaltyPointsToRupees(points);
    const total = subtotalAmount + deliveryCharge + giftWrapCharge - discountAmount;
    const amount = total * 100;
    if (!Number.isSafeInteger(amount) || amount < 100 || amount > 2147483647)
      throw new CheckoutError("Order total is outside the supported range.");
    const snapshot: OrderEmailInput = {
      orderId: id,
      user: { name: input.name, email: input.email, number: input.number },
      address: {
        addressLine1: input.addressLine1, addressLine2: input.addressLine2,
        city: input.city, state: input.state, pincode: input.pincode,
      },
      items, subtotalAmount, deliveryCharge, discountAmount,
      giftWrap: input.giftWrap, giftWrapCharge, giftWrapNote,
      ...(input.atelierNote ? { atelierNote: input.atelierNote } : {}),
      loyaltyPointsRedeemed: points, totalAmountPaid: total,
      ...(checkoutFingerprint ? { checkoutFingerprint } : {}),
    };
    if (programme) {
      const circle = await circleSummary(tx, user);
      snapshot.circle = { programVersion: 1, tierKey: circle.current.key, multiplier: circle.current.multiplier, eligibleAmount, netEligibleAmount: Math.max(0, eligibleAmount - discountAmount), normalPoints: circleRewardPoints(Math.max(0, eligibleAmount - discountAmount), circle.current.key) };
    }
    await tx.insert(orderTable).values({
      id, userId: user.id, ...snapshot.address, subtotalAmount, deliveryCharge,
      discountAmount, loyaltyPointsRedeemed: points,
      loyaltyPointsStatus: points > 0 ? "reserved" : "none",
      totalAmountPaid: 0, status: "pending_payment", paymentStatus: "pending",
      expectedAmountPaise: amount, currency: "INR", checkoutSnapshot: snapshot,
    });
    await tx.insert(orderItemsTable).values(items.map(item => ({
      orderId: id, productId: item.id, productVariantId: item.variantId,
      quantity: item.quantity, size: item.size, color: item.color, variant: item.variant,
    })));
    if (programme) await reserveCirclePoints(tx, user.id, id, points);
    let giftCardAmount = 0;
    if (input.giftCardCode) {
      const credit = await reserveGiftCard(tx, input.giftCardCode, user.id, id, amount);
      giftCardAmount = credit.amountPaise / 100;
      snapshot.giftCardAmount = giftCardAmount;
      snapshot.giftCardSuffix = credit.suffix;
      snapshot.cashAmount = total - giftCardAmount;
      if (snapshot.circle) {
        snapshot.circle.netEligibleAmount = Math.max(0, eligibleAmount - discountAmount - giftCardAmount);
        snapshot.circle.normalPoints = circleRewardPoints(snapshot.circle.netEligibleAmount, snapshot.circle.tierKey);
      }
      await tx.update(orderTable).set({ expectedAmountPaise: amount - credit.amountPaise, checkoutSnapshot: snapshot }).where(eq(orderTable.id, id));
      if (credit.amountPaise === amount) {
        const [savedOrder] = await tx.select().from(orderTable).where(eq(orderTable.id, id));
        await settleOrderLoyalty(tx, savedOrder, total, programme);
        await settleGiftCardReservation(tx, id);
        await tx.update(orderTable).set({
          status: "confirmed", paymentStatus: "paid", totalAmountPaid: total,
          loyaltyPointsStatus: points > 0 ? "spent" : "none", updatedAt: new Date(),
        }).where(eq(orderTable.id, id));
        return { success: true, orderId: null, internalOrderId: id, amount: 0, currency: "INR", confirmed: true, loyaltyPointsRedeemed: points, totalAmountPaid: total, giftCardAmount, circle: snapshot.circle };
      }
    }
    const cashAmount = amount - giftCardAmount * 100;
    const gatewayOrder = await razorpay.orders.create({
      amount: cashAmount, currency: "INR", receipt: id, notes: { internal_order_id: id },
    });
    await tx.update(orderTable).set({ razorpayOrderId: gatewayOrder.id, checkoutSnapshot: snapshot, updatedAt: new Date() })
      .where(eq(orderTable.id, id));
    return {
      success: true, orderId: gatewayOrder.id, internalOrderId: id, amount: cashAmount, currency: "INR",
      loyaltyPointsRedeemed: points, discountAmount, subtotalAmount, deliveryCharge,
      giftWrap: input.giftWrap, giftWrapCharge, giftWrapNote,
      giftCardAmount, confirmed: false, totalAmountPaid: total,
      circle: snapshot.circle,
    };
  });
  let emailPending = false;
  if (result.confirmed && result.amount === 0) {
    await settleOrderReferral(result.internalOrderId);
    try { await sendPaidOrderEmails(result.internalOrderId); }
    catch { emailPending = true; console.error("Gift-card-funded order email pending", { orderId: result.internalOrderId }); }
  }
  return { ...result, emailPending };
}
