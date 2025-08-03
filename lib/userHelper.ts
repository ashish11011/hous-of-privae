"use server";
import { NextResponse } from "next/server";
import { userTable } from "../db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export const createNewUser = async (user: any) => {
  try {
    const result = await db
      .insert(userTable)
      .values({ password: "123", ...user })
      .returning();
    return result ? result[0]?.id : null;
  } catch (error) {
    return { msg: "error: ", error };
  }
};

export const getUserId = async (user: any) => {
  const existingUserData = await db
    .select()
    .from(userTable)
    .where(eq(userTable.email, user.email));
  const existingUserId = existingUserData[0]?.id;

  if (existingUserId) {
    return existingUserId;
  }

  const newUserId = await createNewUser(user);
  return newUserId;
};
