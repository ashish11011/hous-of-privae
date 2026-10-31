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
import { user } from "./userSchema";
import { order } from "./orderSchema";

export const giftCard = pgTable(
  "gift_cards",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    purchaserId: uuid("purchaser_id")
      .notNull()
      .references(() => user.id),
    claimedById: uuid("claimed_by_id").references(() => user.id),
    purchaserEmail: varchar("purchaser_email", { length: 254 }).notNull(),
    senderName: varchar("sender_name", { length: 120 }).notNull(),
    recipientName: varchar("recipient_name", { length: 120 }).notNull(),
    recipientEmail: varchar("recipient_email", { length: 254 }),
    message: text("message").notNull().default(""),
    design: varchar("design", { length: 30 }).notNull().default("classic"),
    requestHash: varchar("request_hash", { length: 64 }).notNull(),
    initialAmountPaise: integer("initial_amount_paise").notNull(),
    balancePaise: integer("balance_paise").notNull().default(0),
    codeHash: varchar("code_hash", { length: 64 }).unique(),
    encryptedCode: text("encrypted_code"),
    codeSuffix: varchar("code_suffix", { length: 4 }),
    paymentStatus: varchar("payment_status").notNull().default("pending"),
    razorpayOrderId: varchar("razorpay_order_id").unique(),
    razorpayPaymentId: varchar("razorpay_payment_id").unique(),
    expectedAmountPaise: integer("expected_amount_paise").notNull(),
    currency: varchar("currency", { length: 3 }).notNull().default("INR"),
    purchaserEmailSentAt: timestamp("purchaser_email_sent_at"),
    recipientEmailSentAt: timestamp("recipient_email_sent_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    activatedAt: timestamp("activated_at"),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("gift_cards_purchaser_idx").on(table.purchaserId),
    index("gift_cards_claimed_by_idx").on(table.claimedById),
    check(
      "gift_card_balance_valid",
      sql`${table.balancePaise} >= 0 and ${table.balancePaise} <= ${table.initialAmountPaise}`,
    ),
    check(
      "gift_card_value_valid",
      sql`${table.initialAmountPaise} >= 100000 and ${table.initialAmountPaise} <= 50000000 and ${table.expectedAmountPaise} = ${table.initialAmountPaise}`,
    ),
  ],
);

export const giftCardReservation = pgTable(
  "gift_card_reservations",
  {
    orderId: uuid("order_id")
      .primaryKey()
      .references(() => order.id),
    giftCardId: uuid("gift_card_id")
      .notNull()
      .references(() => giftCard.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    amountPaise: integer("amount_paise").notNull(),
    status: varchar("status", { enum: ["reserved", "spent"] })
      .notNull()
      .default("reserved"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("gift_card_reservations_card_status_idx").on(
      table.giftCardId,
      table.status,
    ),
    index("gift_card_reservations_user_status_idx").on(
      table.userId,
      table.status,
    ),
    check("gift_card_reservation_positive", sql`${table.amountPaise} > 0`),
    check(
      "gift_card_reservation_status_valid",
      sql`${table.status} in ('reserved', 'spent')`,
    ),
  ],
);

export const giftCardTransaction = pgTable(
  "gift_card_transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    giftCardId: uuid("gift_card_id")
      .notNull()
      .references(() => giftCard.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    orderId: uuid("order_id").references(() => order.id),
    type: varchar("type", { enum: ["purchase", "redemption"] }).notNull(),
    amountPaise: integer("amount_paise").notNull(),
    balanceAfterPaise: integer("balance_after_paise").notNull(),
    referenceKey: varchar("reference_key").notNull().unique(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("gift_card_transactions_card_idx").on(table.giftCardId)],
);
