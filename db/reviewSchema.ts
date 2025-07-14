import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  integer,
} from "drizzle-orm/pg-core";

export const review = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email"),
  rating: integer("rating").notNull(),
  message: varchar("message"),
  image: varchar("image"),
  isAdminApproved: boolean("is_admin_approved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
