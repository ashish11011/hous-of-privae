import { z } from "zod";
import { randomUUID } from "node:crypto";
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

const requiredText = z.string().trim().min(1).max(300);
export const checkoutSchema = z.object({
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
    };
  });
  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const deliveryCharge = subtotalAmount >= 1199 ? 0 : 60;
  const session = await getServerSession(authOptions);
  const points = input.loyaltyPointsToRedeem;
  if (points > 0 && !session?.id)
    throw new CheckoutError("Sign in to use your loyalty points.", 401);
  const id = randomUUID();
  // Lock the user's balance until the reservation and gateway order are saved.
  // A gateway failure rolls back the reservation without taking any points.
  return db.transaction(async (tx) => {
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
    if (points > 0) {
      const availability = await getLoyaltyAvailability(user.id, user.loyaltyPoints, tx);
      if (availability.pendingCheckout)
        throw new CheckoutError("You have a pending checkout using points. Resume its payment before using points for another order.", 409);
      if (points > maximumRedeemablePoints(subtotalAmount, availability.availablePoints))
        throw new CheckoutError("Points must fit your available balance and cover no more than 20% of the cart value.");
    }
    const discountAmount = loyaltyPointsToRupees(points);
    const total = subtotalAmount + deliveryCharge - discountAmount;
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
      loyaltyPointsRedeemed: points, totalAmountPaid: total,
    };
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
    const gatewayOrder = await razorpay.orders.create({
      amount, currency: "INR", receipt: id, notes: { internal_order_id: id },
    });
    await tx.update(orderTable).set({ razorpayOrderId: gatewayOrder.id, updatedAt: new Date() })
      .where(eq(orderTable.id, id));
    return {
      success: true, orderId: gatewayOrder.id, internalOrderId: id, amount, currency: "INR",
      loyaltyPointsRedeemed: points, discountAmount, subtotalAmount, deliveryCharge,
    };
  });
}
