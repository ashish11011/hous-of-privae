import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  integer,
  boolean,
  index,
} from "drizzle-orm/pg-core";

export const category = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 120 }).notNull(),
    slug: varchar("slug", { length: 140 }).unique().notNull(),
    image: varchar("image"),
    tagline: varchar("tagline"),
    level: integer("level").notNull().default(1),
    parentId: varchar("parent_id"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("category_slug_idx").on(table.slug),
    index("category_level_idx").on(table.level),
  ]
);

export const product = pgTable(
  "products",
  {
    // about product
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name"),
    sku: varchar("sku"),
    fabric: varchar("fabric"),

    care: varchar("care"),
    style_note: varchar("style_note"),
    customization: varchar("customization"),
    isInStoke : boolean("in_stock").default(true),
    model_height: varchar("model_height"),
    description: varchar("description"),
    basePrice: integer("base_price"),
    semiStitchedPrice: integer("semi_stitched_price"),
    categoryId1: varchar("category_id_1"),
    categoryId2: varchar("category2_id_2"),
    slug: varchar("slug").unique().notNull(),
    bannerImage: varchar("banner_image"),
    images: varchar("images").array(),

    //   all the filters
    sizes: varchar("sizes").array(),
    colors: varchar("colors").array(),
    materials: varchar("materials").array(),
    isDeleted: boolean("is_deleted").notNull().default(false),

    // timestamp
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("name_idx").on(table.name),
    index("slug_idx").on(table.slug),
  ]
);
