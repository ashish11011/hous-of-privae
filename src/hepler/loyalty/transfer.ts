"use server";
import { userTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { getServerSession } from "next-auth";

export async function transferLoyaltyPoints(
  transferEmail: string,
  transferAmount: number
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    throw new Error("User is not logged in");
  }

  const senderEmail = session.user.email;

  return await db.transaction(async (tx) => {
    const [sender] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.email, senderEmail));

    const [receiver] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.email, transferEmail));

    if (!sender) throw new Error("Sender not found");
    if (!receiver) throw new Error("Recipient not found");

    if (sender.loyaltyPoints < transferAmount) {
      throw new Error("Insufficient points");
    }

    await tx
      .update(userTable)
      .set({ loyaltyPoints: sender.loyaltyPoints - transferAmount })
      .where(eq(userTable.email, senderEmail));

    await tx
      .update(userTable)
      .set({ loyaltyPoints: receiver.loyaltyPoints + transferAmount })
      .where(eq(userTable.email, transferEmail));

    const [updatedSender] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.email, senderEmail));

    const [updatedReceiver] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.email, transferEmail));

    return {
      message: `Transferred ${transferAmount} points from ${senderEmail} to ${transferEmail}`,
      sender: updatedSender,
      receiver: updatedReceiver,
    };
  });
}
