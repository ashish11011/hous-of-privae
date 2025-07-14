import {
  boolean,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const blog = pgTable("blog", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title"),
  metaDescription: varchar("meta_description"),
  blogCategory: varchar("blog_category"),
  image: varchar("image"),
  tags: varchar("tags").array(),
  date: varchar("date"),

  // Data-> blog content
  data: varchar("data"),
  userImage: varchar("user_image"),
  userName: varchar("user_name"),
  slug: varchar("slug"),
  isVisible: boolean("is_visible").default(true),
});

export const blogForm = pgTable("blogForm", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email"),
  message: varchar("message"),
  number: varchar("number"),
  refrenceBlogLink: varchar("refrence_blog_link"),
  createdAt: timestamp("created_at").defaultNow(),
});
