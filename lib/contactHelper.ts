"use server";
import { AnyCnameRecord } from "dns";
import { contactTable } from "../db/schema";
import { db } from "./db";

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
