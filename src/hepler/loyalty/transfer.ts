"use server";
import { randomUUID } from "node:crypto";
import { loyaltyTransactionsTable, userTable } from "@/db/schema";
import { authOptions } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { getLoyaltyAvailability } from "@/lib/loyaltyBalance";
import { asc, eq, or } from "drizzle-orm";
import { getServerSession } from "next-auth";

export async function transferLoyaltyPoints(transferEmail: string, transferAmount: number) {
  const session = await getServerSession(authOptions);
  if (!session?.id) throw new Error("User is not logged in");
  if (!Number.isSafeInteger(transferAmount) || transferAmount <= 0 || transferAmount > 2147483647)
    throw new Error("Enter a positive whole number of points");
  const recipientEmail = transferEmail.trim().toLowerCase();
  return db.transaction(async tx => {
    // All transfers lock accounts in the same order to prevent deadlocks.
    const users = await tx.select().from(userTable).where(or(
      eq(userTable.id, session.id), eq(userTable.email, recipientEmail),
    )).orderBy(asc(userTable.id)).for("update");
    const sender = users.find(user => user.id === session.id);
    const receiver = users.find(user => user.email === recipientEmail);
    if (!sender) throw new Error("Sender not found");
    if (!receiver) throw new Error("Recipient not found");
    if (sender.id === receiver.id) throw new Error("You cannot transfer points to yourself");
    const { availablePoints } = await getLoyaltyAvailability(sender.id, sender.loyaltyPoints, tx);
    if (availablePoints < transferAmount) throw new Error("Insufficient available points. Pending checkouts may have reserved some points.");
    if (receiver.loyaltyPoints + transferAmount > 2147483647) throw new Error("Recipient points balance is too large");
    const [updatedSender] = await tx.update(userTable).set({
      loyaltyPoints: sender.loyaltyPoints - transferAmount, updatedAt: new Date(),
    }).where(eq(userTable.id, sender.id)).returning();
    const [updatedReceiver] = await tx.update(userTable).set({
      loyaltyPoints: receiver.loyaltyPoints + transferAmount, updatedAt: new Date(),
    }).where(eq(userTable.id, receiver.id)).returning();
    const transferId = randomUUID();
    await tx.insert(loyaltyTransactionsTable).values([
      { userId: sender.id, type: "transfer_sent", points: -transferAmount,
        balanceAfter: updatedSender.loyaltyPoints, relatedUserId: receiver.id, transferId,
        description: `Sent points to ${receiver.email}`, referenceKey: `transfer:${transferId}:sent` },
      { userId: receiver.id, type: "transfer_received", points: transferAmount,
        balanceAfter: updatedReceiver.loyaltyPoints, relatedUserId: sender.id, transferId,
        description: `Received points from ${sender.email}`, referenceKey: `transfer:${transferId}:received` },
    ]);
    return { message: `Transferred ${transferAmount} points from ${sender.email} to ${receiver.email}`,
      sender: updatedSender, receiver: updatedReceiver };
  });
}
