import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import { user } from "./userSchema";
import { product, productVarient } from "./productSchema";
import { order } from "./orderSchema";
import { contact } from "./contactSchema";

export const accountProfile = pgTable("account_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  dateOfBirth: date("date_of_birth"),
  preferredTopSize: varchar("preferred_top_size", { length: 20 })
    .notNull()
    .default(""),
  preferredBottomSize: varchar("preferred_bottom_size", { length: 20 })
    .notNull()
    .default(""),
  preferredBlouseSize: varchar("preferred_blouse_size", { length: 20 })
    .notNull()
    .default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const accountAddress = pgTable(
  "account_addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 80 }).notNull().default(""),
    recipientName: varchar("recipient_name", { length: 120 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull(),
    line1: varchar("line1", { length: 300 }).notNull(),
    line2: varchar("line2", { length: 300 }).notNull().default(""),
    city: varchar("city", { length: 100 }).notNull(),
    state: varchar("state", { length: 100 }).notNull(),
    pincode: varchar("pincode", { length: 20 }).notNull(),
    country: varchar("country", { length: 80 }).notNull().default("India"),
    isDefault: boolean("is_default").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("account_address_user_idx").on(table.userId),
    uniqueIndex("account_address_default_unique")
      .on(table.userId)
      .where(sql`${table.isDefault} = true`),
  ],
);
export const accountMeasurement = pgTable(
  "account_measurements",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    label: varchar("label", { length: 100 })
      .notNull()
      .default("My measurements"),
    unit: varchar("unit", { enum: ["inches", "cm"] })
      .notNull()
      .default("inches"),
    bust: numeric("bust", { precision: 7, scale: 2, mode: "number" }),
    waist: numeric("waist", { precision: 7, scale: 2, mode: "number" }),
    hips: numeric("hips", { precision: 7, scale: 2, mode: "number" }),
    shoulder: numeric("shoulder", { precision: 7, scale: 2, mode: "number" }),
    sleeveLength: numeric("sleeve_length", {
      precision: 7,
      scale: 2,
      mode: "number",
    }),
    kurtaLength: numeric("kurta_length", {
      precision: 7,
      scale: 2,
      mode: "number",
    }),
    inseam: numeric("inseam", { precision: 7, scale: 2, mode: "number" }),
    height: numeric("height", { precision: 7, scale: 2, mode: "number" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("account_measurement_user_idx").on(table.userId)],
);
export const accountWishlist = pgTable(
  "account_wishlist",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVarient.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.variantId] })],
);
export const accountEdit = pgTable("account_stylist_edits", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  productIds: uuid("product_ids").array().notNull().default([]),
  generatedAt: timestamp("generated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const accountAppointment = pgTable(
  "account_appointments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    contactId: uuid("contact_id")
      .notNull()
      .unique()
      .references(() => contact.id),
    service: varchar("service", { length: 80 }).notNull(),
    scheduledFor: timestamp("scheduled_for", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    status: varchar("status", {
      enum: ["requested", "confirmed", "completed", "cancelled"],
    })
      .notNull()
      .default("requested"),
    notes: text("notes").notNull().default(""),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("account_appointment_user_idx").on(table.userId),
    index("account_appointment_slot_idx").on(table.scheduledFor),
  ],
);
export const bespokeRequest = pgTable(
  "bespoke_requests",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => user.id),
    fullName: varchar("full_name", { length: 120 }).notNull(),
    email: varchar("email", { length: 254 }).notNull(),
    phone: varchar("phone", { length: 40 }).notNull().default(""),
    country: varchar("country", { length: 80 }).notNull().default(""),
    garmentType: varchar("garment_type", { length: 120 }).notNull(),
    occasion: varchar("occasion", { length: 100 }).notNull().default(""),
    eventDate: date("event_date"),
    budgetRange: varchar("budget_range", { length: 80 }).notNull().default(""),
    fabricPreference: varchar("fabric_preference", { length: 120 })
      .notNull()
      .default(""),
    colorPreference: varchar("color_preference", { length: 120 })
      .notNull()
      .default(""),
    inspirationNotes: text("inspiration_notes").notNull(),
    status: varchar("status").notNull().default("submitted"),
    currentMilestone: varchar("current_milestone")
      .notNull()
      .default("received"),
    estimatedDeliveryDate: date("estimated_delivery_date"),
    emailSentAt: timestamp("email_sent_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("bespoke_request_user_idx").on(table.userId)],
);
export const bespokeMilestone = pgTable(
  "bespoke_milestones",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    requestId: uuid("request_id")
      .notNull()
      .references(() => bespokeRequest.id, { onDelete: "cascade" }),
    milestone: varchar("milestone").notNull(),
    note: text("note").notNull().default(""),
    imageUrl: text("image_url"),
    changedBy: uuid("changed_by").references(() => user.id),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("bespoke_milestone_request_idx").on(table.requestId)],
);
export const accountStockAlert = pgTable(
  "account_stock_alerts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => product.id, { onDelete: "cascade" }),
    size: varchar("size", { length: 20 }).notNull().default(""),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("account_stock_alert_unique").on(
      table.userId,
      table.productId,
      table.size,
    ),
  ],
);

export const circleAccount = pgTable(
  "circle_accounts",
  {
    userId: uuid("user_id")
      .primaryKey()
      .references(() => user.id),
    debtPoints: integer("debt_points").notNull().default(0),
    lumiereBonusPoints: integer("lumiere_bonus_points").notNull().default(0),
    royaleBonusPoints: integer("royale_bonus_points").notNull().default(0),
    rewardsVersion: integer("rewards_version").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [check("circle_debt_nonnegative", sql`${table.debtPoints} >= 0`)],
);
export const circleOrderReward = pgTable(
  "circle_order_rewards",
  {
    orderId: uuid("order_id")
      .primaryKey()
      .references(() => order.id),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    tierKey: varchar("tier_key").notNull(),
    eligibleAmount: integer("eligible_amount").notNull(),
    normalPoints: integer("normal_points").notNull(),
    status: varchar("status", {
      enum: ["pending_delivery", "pending", "available", "reversed"],
    })
      .notNull()
      .default("pending_delivery"),
    qualifyingAt: timestamp("qualifying_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("circle_reward_user_idx").on(table.userId),
    check(
      "circle_reward_values_valid",
      sql`${table.eligibleAmount} >= 0 and ${table.normalPoints} >= 0`,
    ),
  ],
);
export const circlePointLot = pgTable(
  "circle_point_lots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => user.id),
    source: varchar("source").notNull(),
    sourceKey: varchar("source_key").notNull().unique(),
    tierKey: varchar("tier_key"),
    orderId: uuid("order_id").references(() => order.id),
    points: integer("points").notNull(),
    remainingPoints: integer("remaining_points").notNull(),
    expiredPoints: integer("expired_points").notNull().default(0),
    voidedPoints: integer("voided_points").notNull().default(0),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("circle_lot_user_expiry_idx").on(table.userId, table.expiresAt),
    check(
      "circle_lot_balance_valid",
      sql`${table.remainingPoints} >= 0 and ${table.remainingPoints} <= ${table.points} and ${table.voidedPoints} >= 0 and ${table.voidedPoints} <= ${table.points} and ${table.expiredPoints} >= 0 and ${table.expiredPoints} <= ${table.points} - ${table.voidedPoints}`,
    ),
  ],
);
export const circleRedemption = pgTable(
  "circle_redemptions",
  {
    orderId: uuid("order_id")
      .notNull()
      .references(() => order.id),
    lotId: uuid("lot_id")
      .notNull()
      .references(() => circlePointLot.id),
    points: integer("points").notNull(),
    status: varchar("status", { enum: ["reserved", "spent"] })
      .notNull()
      .default("reserved"),
  },
  (table) => [
    primaryKey({ columns: [table.orderId, table.lotId] }),
    check("circle_redemption_positive", sql`${table.points} > 0`),
  ],
);
export type TransferSlice = { points: number; expiresAt: string | null };
export const circleTransfer = pgTable(
  "circle_transfers",
  {
    id: uuid("id").primaryKey(),
    senderId: uuid("sender_id")
      .notNull()
      .references(() => user.id),
    recipientEmail: varchar("recipient_email", { length: 254 }).notNull(),
    recipientId: uuid("recipient_id").references(() => user.id),
    points: integer("points").notNull(),
    claimedPoints: integer("claimed_points").notNull().default(0),
    status: varchar("status", { enum: ["pending", "claimed", "expired"] })
      .notNull()
      .default("pending"),
    slices: jsonb("slices").$type<TransferSlice[]>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("circle_transfer_recipient_idx").on(table.recipientEmail),
    index("circle_transfer_sender_idx").on(table.senderId),
  ],
);
export const accountReferral = pgTable("account_referrals", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => user.id),
  code: varchar("code", { length: 24 }).notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
export const referralRedemption = pgTable(
  "account_referral_redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    referrerId: uuid("referrer_id")
      .notNull()
      .references(() => user.id),
    refereeId: uuid("referee_id")
      .notNull()
      .unique()
      .references(() => user.id),
    firstOrderId: uuid("first_order_id")
      .unique()
      .references(() => order.id),
    status: varchar("status", { enum: ["pending", "rewarded", "reversed"] })
      .notNull()
      .default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("referral_redemption_referrer_idx").on(table.referrerId),
    check("referral_not_self", sql`${table.referrerId} <> ${table.refereeId}`),
  ],
);
