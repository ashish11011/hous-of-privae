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
  try {
    await db.insert(contactTable).values({
      name,
      email,
      phone,
      location,
      message,
    });
  } catch (error) {
    console.error("Failed to insert contact details", error);
    throw error;
  }
};
