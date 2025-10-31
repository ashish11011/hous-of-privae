"use server";
import { productTable } from "@/db/schema";
import { db } from "@/lib/db";
import { inArray } from "drizzle-orm";

export const getProductFromIds = async (ids: string[]) => {
  const data = await db
    .select()
    .from(productTable)
    .where(inArray(productTable.id, ids));
  return data;
};
