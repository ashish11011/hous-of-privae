import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { user } from "./userSchema";
import { product } from "./productSchema";
import { relations } from "drizzle-orm";

// ----------------------
// Orders Table
// ----------------------
export const order = pgTable("order", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  statusId: varchar("status_id")
    .notNull()
    .default("91ef9b1e-1cb6-4f0f-aee4-77dfbe227a87"),
  shippingAddress: varchar("shipping_address"),
  pincode: varchar("pincode"),
  totalAmountPaid: integer("total_amount_paid"),

  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

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
  quantity: integer("quantity").notNull(),
  size: varchar("size"), // Optional
  color: varchar("color"), // Optional
});

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
