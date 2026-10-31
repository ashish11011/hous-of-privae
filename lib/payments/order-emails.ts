import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendOrderConfirmationEmail } from "@/lib/email/ses";

export async function sendPaidOrderEmails(orderId: string) {
  for (const recipient of ["customer", "admin"] as const) {
    await db.transaction(async (tx) => {
      const [order] = await tx
        .select()
        .from(orderTable)
        .where(eq(orderTable.id, orderId))
        .for("update");
      if (!order || order.paymentStatus !== "paid") return;
      const sentAt =
        recipient === "customer"
          ? order.confirmationEmailSentAt
          : order.adminEmailSentAt;
      if (sentAt) return;
      if (!order.checkoutSnapshot)
        throw new Error("Missing order email snapshot");
      await sendOrderConfirmationEmail(order.checkoutSnapshot, recipient);
      await tx
        .update(orderTable)
        .set(
          recipient === "customer"
            ? { confirmationEmailSentAt: new Date() }
            : { adminEmailSentAt: new Date() },
        )
        .where(eq(orderTable.id, order.id));
    });
  }
}
