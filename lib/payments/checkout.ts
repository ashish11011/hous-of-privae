import { z } from "zod";
import { randomUUID } from "node:crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { orderTable, orderItemsTable, productTable, productVariantsTable, userTable } from "@/db/schema";
import { priceForSize } from "@/lib/productPricing";
import { eq, inArray } from "drizzle-orm";
import razorpay from "@/lib/razorpay";
import type { OrderEmailInput } from "@/lib/email/ses";

const requiredText = z.string().trim().min(1).max(300);
export const checkoutSchema = z.object({
  name: requiredText,
  email: z.string().trim().email().max(254),
  number: z.string().trim().min(6).max(25),
  addressLine1: requiredText,
  addressLine2: z.string().trim().max(300).optional().default(""),
  city: requiredText, state: requiredText, pincode: requiredText,
  productDetails: z.array(z.object({
    id: z.string().uuid(), variantId: z.string().uuid(), quantity: z.number().int().min(1).max(100),
    size: z.string().min(1).max(100), color: z.string().max(100).optional(),
    variant: z.enum(["stitched", "unstitched"]).default("stitched"),
  })).min(1).max(100),
});

export async function createCheckout(input: z.infer<typeof checkoutSchema>) {
  const products = await db.select().from(productTable)
    .where(inArray(productTable.id, input.productDetails.map(item => item.id)));
  const variants = await db.select().from(productVariantsTable)
    .where(inArray(productVariantsTable.id, input.productDetails.map(item => item.variantId)));
  const items = input.productDetails.map(item => {
    const product = products.find(product => product.id === item.id);
    const variant = variants.find(variant => variant.id === item.variantId && variant.productId === item.id);
    if (!product || !variant || product.isInStoke === false) throw new Error("A product or variant is no longer available.");
    const price = priceForSize(product.pricingConfig, item.size);
    if (!price) throw new Error("The selected size is no longer available.");
    return { ...item, productId: product.id, size: price.size, color: variant.color,
      name: product.name || "Privae garment", unitPrice: price.basePrice, image: variant.bannerImage };
  });
  const subtotalAmount = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const deliveryCharge = subtotalAmount >= 1199 ? 0 : 60;
  const total = subtotalAmount + deliveryCharge;
  const amount = total * 100;
  if (!Number.isSafeInteger(amount) || amount > 2147483647) throw new Error("Order total is too large.");
  const session = await getServerSession(authOptions);
  const email = session?.email || input.email.toLowerCase();
  const id = randomUUID();
  const snapshot: OrderEmailInput = {
    orderId: id,
    user: { name: input.name, email: input.email, number: input.number },
    address: { addressLine1: input.addressLine1, addressLine2: input.addressLine2, city: input.city, state: input.state, pincode: input.pincode },
    items, subtotalAmount, deliveryCharge, discountAmount: 0, totalAmountPaid: total,
  };
  // Persist the order and its immutable prices before opening the payment modal.
  await db.transaction(async tx => {
    let [user] = await tx.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
    if (!user) {
      await tx.insert(userTable).values({ email, name: input.name, number: input.number }).onConflictDoNothing({ target: userTable.email });
      [user] = await tx.select({ id: userTable.id }).from(userTable).where(eq(userTable.email, email));
    }
    await tx.insert(orderTable).values({
      id, userId: user.id, ...snapshot.address, subtotalAmount, deliveryCharge,
      discountAmount: 0, totalAmountPaid: 0, status: "pending_payment", paymentStatus: "pending",
      expectedAmountPaise: amount, currency: "INR", checkoutSnapshot: snapshot,
    });
    await tx.insert(orderItemsTable).values(items.map(item => ({
      orderId: id, productId: item.id, productVariantId: item.variantId, quantity: item.quantity,
      size: item.size, color: item.color, variant: item.variant,
    })));
  });
  const gatewayOrder = await razorpay.orders.create({
    amount, currency: "INR", receipt: id, notes: { internal_order_id: id },
  });
  await db.update(orderTable).set({ razorpayOrderId: gatewayOrder.id, updatedAt: new Date() }).where(eq(orderTable.id, id));
  return { success: true, orderId: gatewayOrder.id, internalOrderId: id, amount, currency: "INR" };
}
