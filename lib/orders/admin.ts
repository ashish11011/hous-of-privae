import { db } from "@/lib/db";
import { orderTable, orderItemsTable, orderStatusEventsTable, productTable, userTable } from "@/db/schema";
import { and, desc, eq, isNull } from "drizzle-orm";
import { allowedOrderStatuses, type EditableOrderStatus } from "./status";
import { sendOrderStatusEmail } from "@/lib/email/ses";
import type { AdminOrderDetail, AdminOrderSummary } from "./types";

export class OrderActionError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

export async function getAdminOrderList(): Promise<AdminOrderSummary[]> {
  const rows = await db.select({
    id: orderTable.id, status: orderTable.status, paymentStatus: orderTable.paymentStatus,
    currency: orderTable.currency, totalAmountPaid: orderTable.totalAmountPaid,
    createdAt: orderTable.createdAt, updatedAt: orderTable.updatedAt,
    customerName: userTable.name, customerEmail: userTable.email,
  }).from(orderTable).leftJoin(userTable, eq(orderTable.userId, userTable.id)).orderBy(desc(orderTable.createdAt));
  return rows.map(row => ({ ...row, createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() }));
}

export async function getAdminOrderDetail(id: string): Promise<AdminOrderDetail | null> {
  const [row] = await db.select({
    order: orderTable,
    customer: { name: userTable.name, email: userTable.email, number: userTable.number },
  }).from(orderTable).leftJoin(userTable, eq(orderTable.userId, userTable.id)).where(eq(orderTable.id, id));
  if (!row) return null;
  const { order, customer } = row;
  const [items, events] = await Promise.all([
    db.select({ id: orderItemsTable.id, name: productTable.name, quantity: orderItemsTable.quantity,
      size: orderItemsTable.size, color: orderItemsTable.color, variant: orderItemsTable.variant,
    }).from(orderItemsTable).leftJoin(productTable, eq(orderItemsTable.productId, productTable.id)).where(eq(orderItemsTable.orderId, id)),
    db.select().from(orderStatusEventsTable).where(eq(orderStatusEventsTable.orderId, id)).orderBy(desc(orderStatusEventsTable.createdAt)),
  ]);
  const snapshot = order.checkoutSnapshot;
  return {
    id: order.id, status: order.status, paymentStatus: order.paymentStatus, currency: order.currency,
    totalAmountPaid: order.totalAmountPaid, createdAt: order.createdAt.toISOString(), updatedAt: order.updatedAt.toISOString(),
    customerName: snapshot?.user.name ?? customer?.name ?? null,
    customerEmail: snapshot?.user.email ?? customer?.email ?? null,
    customerPhone: snapshot?.user.number ?? customer?.number ?? null,
    address: { addressLine1: order.addressLine1, addressLine2: order.addressLine2, city: order.city, state: order.state, pincode: order.pincode },
    subtotalAmount: snapshot?.subtotalAmount ?? order.subtotalAmount,
    deliveryCharge: snapshot?.deliveryCharge ?? order.deliveryCharge,
    discountAmount: snapshot?.discountAmount ?? order.discountAmount,
    totalAmount: order.expectedAmountPaise !== null ? order.expectedAmountPaise / 100 : order.totalAmountPaid,
    couponCode: order.couponCode, razorpayOrderId: order.razorpayOrderId, razorpayPaymentId: order.razorpayPaymentId,
    // Use the purchase snapshot even if a product is renamed or repriced later.
    // Historical orders without price snapshots must not show today's price as the purchase price.
    items: snapshot?.items.length ? snapshot.items.map((item, index) => ({
      id: `${id}-${index}`, name: item.name, quantity: item.quantity, size: item.size ?? null,
      color: item.color ?? null, variant: item.variant ?? "stitched", unitPrice: item.unitPrice,
    })) : items.map(item => ({ ...item, name: item.name ?? "Unavailable product", unitPrice: null })),
    history: events.map(event => ({
      id: event.id, fromStatus: event.fromStatus, toStatus: event.toStatus,
      createdAt: event.createdAt.toISOString(), emailSentAt: event.emailSentAt?.toISOString() ?? null,
      recipientEmail: event.recipientEmail,
    })),
  };
}

export async function deliverOrderStatusEmail(orderId: string, eventId: string) {
  const [event] = await db.select().from(orderStatusEventsTable)
    .where(and(eq(orderStatusEventsTable.id, eventId), eq(orderStatusEventsTable.orderId, orderId)));
  if (!event) throw new OrderActionError("Status update not found.", 404);
  if (event.emailSentAt) return;
  await sendOrderStatusEmail({ orderId, name: event.recipientName, email: event.recipientEmail, status: event.toStatus as EditableOrderStatus });
  await db.update(orderStatusEventsTable).set({ emailSentAt: new Date() }).where(eq(orderStatusEventsTable.id, event.id));
}

export async function updateAdminOrderStatus(id: string, status: EditableOrderStatus, expectedUpdatedAt: string, adminId: string) {
  const result = await db.transaction(async tx => {
    const [order] = await tx.select().from(orderTable).where(eq(orderTable.id, id)).for("update");
    if (!order) throw new OrderActionError("Order not found.", 404);
    if (order.updatedAt.toISOString() !== expectedUpdatedAt) throw new OrderActionError("This order changed. Reload its details before updating.", 409);
    if (order.status === status) return { changed: false, eventId: null };
    if (!allowedOrderStatuses(order).includes(status)) throw new OrderActionError("This status change is not allowed for the order's current payment or fulfillment state.", 409);
    const [customer] = await tx.select({ email: userTable.email, name: userTable.name }).from(userTable).where(eq(userTable.id, order.userId));
    const email = order.checkoutSnapshot?.user.email || customer?.email;
    if (!email) throw new OrderActionError("This order has no customer email address.", 422);
    await tx.update(orderTable).set({ status, updatedAt: new Date() }).where(eq(orderTable.id, id));
    const [event] = await tx.insert(orderStatusEventsTable).values({
      orderId: id, changedBy: adminId, fromStatus: order.status, toStatus: status,
      recipientEmail: email, recipientName: order.checkoutSnapshot?.user.name ?? customer?.name,
    }).returning();
    return { changed: true, eventId: event?.id ?? null };
  });
  if (!result.eventId) return { ...result, emailSent: false };
  try {
    await deliverOrderStatusEmail(id, result.eventId);
    return { ...result, emailSent: true };
  } catch (error) {
    console.error("Order status saved, but customer email delivery failed:", error);
    // Preserve the actual fulfillment state and a durable notification for manual retry.
    return { ...result, emailSent: false };
  }
}
