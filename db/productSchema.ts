import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";

export const product = pgTable("products", {
  // about product
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  description: varchar("description"),
  basePrice: integer("base_price"),
  categoryId1: varchar("category_id_1"),
  categoryId2: varchar("category2_id_2"),
  slug: varchar("slug"),
  bannerImage: varchar("banner_image"),
  images: varchar("images").array(),

  //   all the filters
  sizes: varchar("sizes").array(),
  colors: varchar("colors").array(),
  materials: varchar("materials").array(),

  // timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
