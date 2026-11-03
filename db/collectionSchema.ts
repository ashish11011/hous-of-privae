import { boolean, index, integer, pgTable, primaryKey, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { product } from "./productSchema";

export const collection = pgTable("collections", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 120 }).notNull(),
  slug: varchar("slug", { length: 140 }).unique().notNull(),
  image: text("image").notNull(),
  label: varchar("label", { length: 120 }).notNull().default(""),
  tagline: varchar("tagline", { length: 240 }).notNull().default(""),
  description: text("description").notNull().default(""),
  isActive: boolean("is_active").notNull().default(true),
  isComingSoon: boolean("is_coming_soon").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const collectionProduct = pgTable("collection_products", {
  collectionId: uuid("collection_id").notNull().references(() => collection.id, { onDelete: "cascade" }),
  productId: uuid("product_id").notNull().references(() => product.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  priority: integer("priority").notNull().default(1),
}, (table) => [
  primaryKey({ columns: [table.collectionId, table.productId] }),
  index("collection_products_product_idx").on(table.productId),
]);
