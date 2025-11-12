import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
export const user = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email").unique().notNull(),
  number: varchar("number"),
  password: varchar("password"),
  user_type: varchar("user_type").notNull().default("0"),
  loyaltyPoints: integer("loyalty_points").notNull().default(0),

  addressLine1: varchar("address_line_1"),
  addressLine2: varchar("address_line_2"),
  city: varchar("city"),
  state: varchar("state"),
  pincode: varchar("pincode"),

  //   timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const taileredFit = pgTable("tailered_fit", {
  id: uuid("id").primaryKey().defaultRandom(),
  unit: varchar("unit", { length: 20 }).notNull(), // inches / cm
  chest: varchar("chest", { length: 20 }),
  underbust: varchar("underbust", { length: 20 }),
  waist: varchar("waist", { length: 20 }),
  hips: varchar("hips", { length: 20 }),
  shoulderLength: varchar("shoulder_length", { length: 20 }),
  bottomLength: varchar("bottom_length", { length: 20 }),
  additional: varchar("additional"),
  contact: varchar("contact", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const coupon = pgTable("coupon", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 20 }).notNull(),
  description: varchar("description", { length: 100 }).notNull(),
  code: varchar("code", { length: 20 }).notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  discountFixedAmount: integer("discount_fixed_amount").notNull(),
  useOnce: boolean("use_once").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const couponTransaction = pgTable("coupon_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => user.id),
  couponId: uuid("coupon_id")
    .notNull()
    .references(() => coupon.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
