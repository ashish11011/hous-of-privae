"use server";

import { userTable } from "@/db/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";

export async function getUserByEmail(email: string) {
  const user = db.query.userTable.findFirst({
    where: eq(userTable.email, email),
  });
  return user;
}

export async function insertUser(userData: any) {
  try {
    const user = db.insert(userTable).values(userData).returning();
    return user;
  } catch (error) {
    throw new Error("Failed to insert user");
  }
}
