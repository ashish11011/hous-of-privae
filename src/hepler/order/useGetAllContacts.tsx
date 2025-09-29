"use server";
import { contactTable } from "@/db/schema";
import { db } from "@/lib/db";

export const useGetContactsPaginated = async (
  page: number,
  pageSize: number
) => {
  const offset = (page - 1) * pageSize;

  // Fetch paginated contacts
  const contacts = await db
    .select()
    .from(contactTable)
    .limit(pageSize)
    .offset(offset);

  // Get total count for pagination
  const totalResult = await db.$count(contactTable);

  const total = Number(totalResult);

  return { contacts, total };
};
