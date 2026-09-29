import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth";
import { isAdminEmail } from "./adminEmails";

export async function getOrderAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.id || !isAdminEmail(session.email)) return null;
  return { id: session.id };
}

export async function requireAdmin() {
  const admin = await getOrderAdmin();
  if (!admin) throw new Error("Admin sign-in is required.");
  return admin;
}
