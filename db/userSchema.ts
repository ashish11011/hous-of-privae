import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
export const user = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email").unique().notNull(),
  number: varchar("number"),
  password: varchar("password"),
  user_type: varchar("user_type").notNull().default("0"),

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
