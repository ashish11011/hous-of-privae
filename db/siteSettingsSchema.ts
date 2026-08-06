import { jsonb, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").primaryKey().defaultRandom(),
  key: varchar("key", { length: 120 }).unique().notNull(),
  value: jsonb("value").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
