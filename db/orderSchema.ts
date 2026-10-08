import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  jsonb,
  index,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./userSchema";
import { product, productVarient } from "./productSchema";
import { relations, sql } from "drizzle-orm";
import type { OrderEmailInput } from "../lib/email/ses";

// ----------------------
// Orders Table
// ----------------------
export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  status: varchar("status").notNull().default("pending"),
  addressLine1: varchar("address_line_1"),
  addressLine2: varchar("address_line_2"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),
  subtotalAmount: integer("subtotal_amount").notNull().default(0),
  deliveryCharge: integer("delivery_charge").notNull().default(0),
  discountAmount: integer("discount_amount").notNull().default(0),
  loyaltyPointsRedeemed: integer("loyalty_points_redeemed").notNull().default(0),
  loyaltyPointsStatus: varchar("loyalty_points_status", {
    enum: ["none", "reserved", "spent"],
  }).notNull().default("none"),
  couponCode: varchar("coupon_code"),
  totalAmountPaid: integer("total_amount_paid"),
  paymentStatus: varchar("payment_status").notNull().default("unknown"),
  razorpayOrderId: varchar("razorpay_order_id").unique(),
  razorpayPaymentId: varchar("razorpay_payment_id").unique(),
  expectedAmountPaise: integer("expected_amount_paise"),
  currency: varchar("currency").notNull().default("INR"),
  checkoutSnapshot: jsonb("checkout_snapshot").$type<OrderEmailInput>(),
  confirmationEmailSentAt: timestamp("confirmation_email_sent_at"),
  adminEmailSentAt: timestamp("admin_email_sent_at"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, table => [
  index("order_user_loyalty_status_idx").on(table.userId, table.loyaltyPointsStatus),
  check("order_loyalty_points_valid", sql`${table.loyaltyPointsRedeemed} >= 0 and ${table.loyaltyPointsRedeemed} % 10 = 0`),
  check("order_loyalty_status_valid", sql`
    (${table.loyaltyPointsStatus} = 'none' and ${table.loyaltyPointsRedeemed} = 0)
    or (${table.loyaltyPointsStatus} in ('reserved', 'spent') and ${table.loyaltyPointsRedeemed} > 0)
  `),
  check("order_loyalty_redemption_cap", sql`${table.loyaltyPointsRedeemed} <= (${table.subtotalAmount} / 5) * 10`),
]);

// ----------------------
// Order Items Table
// ----------------------
export const orderItem = pgTable("order_item", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => order.id),
  productId: uuid("product_id")
    .notNull()
    .references(() => product.id),
  productVariantId: uuid("product_variant_id").references(() => productVarient.id, { onDelete: "set null" }),
  quantity: integer("quantity").notNull(),
  size: varchar("size"), // Optional
  color: varchar("color"), // Optional
  variant: varchar("variant").notNull().default("stitched"),
});

export const orderStatusEvent = pgTable("order_status_event", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => order.id),
  changedBy: uuid("changed_by").notNull().references(() => user.id),
  fromStatus: varchar("from_status").notNull(),
  toStatus: varchar("to_status").notNull(),
  recipientEmail: varchar("recipient_email").notNull(),
  recipientName: varchar("recipient_name"),
  emailSentAt: timestamp("email_sent_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, table => [index("order_status_event_order_idx").on(table.orderId)]);

// ----------------------
// Relations
// ----------------------
export const orderRelations = relations(order, ({ many, one }) => ({
  items: many(orderItem),
  user: one(user, {
    fields: [order.userId],
    references: [user.id],
  }),
}));

export const orderItemRelations = relations(orderItem, ({ one }) => ({
  order: one(order, {
    fields: [orderItem.orderId],
    references: [order.id],
  }),
  product: one(product, {
    fields: [orderItem.productId],
    references: [product.id],
  }),
}));
