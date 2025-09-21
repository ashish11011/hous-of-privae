"use server";
import { db } from "./db";
import { contactTable } from "@/db/schema";

export const insertContactDetails = async ({
  name,
  email,
  phone,
  location,
  message,
}: any) => {
  await db.insert(contactTable).values({
    name,
    email,
    phone,
    location,
    message,
  });
};
