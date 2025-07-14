import { pgTable, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
export const user = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name"),
  email: varchar("email").unique().notNull(),
  number: varchar("number").unique().notNull(),
  password: varchar("password").notNull(),

  //   timestamp
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
