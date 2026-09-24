import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "@/lib/db";
import { userTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function getOrderAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.id) return null;
  const [admin] = await db.select({ id: userTable.id }).from(userTable)
    .where(and(eq(userTable.id, session.id), eq(userTable.user_type, "1")));
  return admin ?? null;
}
