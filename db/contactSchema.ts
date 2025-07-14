import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const contact = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email"),
  phone: varchar("phone"),
  location: varchar("location"),
  message: varchar("message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const subscription = pgTable("subscription", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
