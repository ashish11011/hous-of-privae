import { and, eq } from "drizzle-orm";
import { giftCardApi } from "@/lib/gift-cards/api";
import { giftCardRequestSchema } from "@/lib/gift-cards/validation";
import { CheckoutError } from "@/lib/payments/checkout-error";
import { sendPaidOrderEmails } from "@/lib/payments/order-emails";
import { db } from "@/lib/db";
import { orderTable } from "@/db/schema";
export async function POST(req: Request) {
  return giftCardApi(async (userId) => {
    const { id } = giftCardRequestSchema.parse(await req.json());
    const [order] = await db
      .select()
      .from(orderTable)
      .where(and(eq(orderTable.id, id), eq(orderTable.userId, userId)));
    if (
      !order ||
      order.paymentStatus !== "paid" ||
      order.expectedAmountPaise !== 0 ||
      !order.checkoutSnapshot?.giftCardAmount
    )
      throw new CheckoutError("Paid gift card order not found.", 404);
    await sendPaidOrderEmails(id);
    return { success: true };
  });
}
