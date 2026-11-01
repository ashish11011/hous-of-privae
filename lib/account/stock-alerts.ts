import { and, eq, isNull } from "drizzle-orm";
import { accountStockAlert } from "@/db/accountSchema";
import { userTable } from "@/db/schema";
import { product } from "@/db/productSchema";
import { db } from "@/lib/db";
import { loadCatalog } from "@/lib/productCatalog";
import { variantCards, productHref } from "@/lib/productAdapter";
import { sendBackInStockEmail } from "@/lib/email/ses";
import { accountSchemaMissing } from "./api";
export async function sendBackInStockNotifications(productId: string) {
  let rows;
  try {
    rows = await db
      .select()
      .from(accountStockAlert)
      .where(
        and(
          eq(accountStockAlert.productId, productId),
          isNull(accountStockAlert.notifiedAt),
        ),
      );
  } catch (error) {
    if (accountSchemaMissing(error)) return { sent: 0, pending: 0 };
    throw error;
  }
  if (!rows.length) return { sent: 0, pending: 0 };
  const item = variantCards(await loadCatalog(eq(product.id, productId))).find(
    (item) => item.isInStoke !== false,
  );
  if (!item) return { sent: 0, pending: rows.length };
  let sent = 0;
  for (const row of rows) {
    if (row.size && !item.sizes?.includes(row.size.toLowerCase())) continue;
    try {
      await db.transaction(async (tx) => {
        const [alert] = await tx
          .select()
          .from(accountStockAlert)
          .where(eq(accountStockAlert.id, row.id))
          .for("update");
        if (!alert || alert.notifiedAt) return;
        const [member] = await tx
          .select({ email: userTable.email })
          .from(userTable)
          .where(eq(userTable.id, alert.userId));
        if (!member) return;
        await sendBackInStockEmail({
          email: member.email,
          productName: item.name || "Your saved piece",
          href: `${process.env.NEXT_PUBLIC_BASE_URL || "https://www.hausofprivae.com"}${productHref(item)}`,
          size: alert.size,
        });
        await tx
          .update(accountStockAlert)
          .set({ notifiedAt: new Date() })
          .where(eq(accountStockAlert.id, alert.id));
        sent++;
      });
    } catch {
      /* Keep an unsent alert for retry on the next catalogue save. */
    }
  }
  return { sent, pending: rows.length - sent };
}
