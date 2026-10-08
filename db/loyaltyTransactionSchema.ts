import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { order } from "./orderSchema";
import { user } from "./userSchema";

// Append entries in the same transaction as the balance update.
export const loyaltyTransaction = pgTable("loyalty_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => user.id),
  type: varchar("type", {
    enum: [
      "order_reward",
      "transfer_sent",
      "transfer_received",
      "redemption",
      "reward_reversal",
      "adjustment",
    ],
  }).notNull(),
  // Positive points are credits; negative points are debits.
  points: integer("points").notNull(),
  balanceAfter: integer("balance_after").notNull(),
  description: text("description").notNull(),
  orderId: uuid("order_id").references(() => order.id),
  relatedUserId: uuid("related_user_id").references(() => user.id),
  // A transfer has two entries (sent/received) sharing the same transfer ID.
  transferId: uuid("transfer_id"),
  // A stable, per-entry source key prevents duplicate credits/debits on retry.
  referenceKey: varchar("reference_key", { length: 255 }).unique(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
}, table => [
  index("loyalty_transaction_user_created_idx").on(table.userId, table.createdAt.desc()),
  index("loyalty_transaction_order_idx").on(table.orderId),
  index("loyalty_transaction_transfer_idx").on(table.transferId),
  check("loyalty_transaction_type_check", sql`${table.type} in ('order_reward', 'transfer_sent', 'transfer_received', 'redemption', 'reward_reversal', 'adjustment')`),
  check("loyalty_transaction_points_nonzero", sql`${table.points} <> 0`),
  check("loyalty_transaction_balance_nonnegative", sql`${table.balanceAfter} >= 0`),
  check("loyalty_transaction_points_direction", sql`
    (${table.type} in ('order_reward', 'transfer_received') and ${table.points} > 0)
    or (${table.type} in ('transfer_sent', 'redemption', 'reward_reversal') and ${table.points} < 0)
    or ${table.type} = 'adjustment'
  `),
]);

export type LoyaltyTransaction = typeof loyaltyTransaction.$inferSelect;
export type NewLoyaltyTransaction = typeof loyaltyTransaction.$inferInsert;
