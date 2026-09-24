export const orderStatusLabels: Record<string, string> = {
  pending: "Pending", pending_payment: "Awaiting payment", payment_failed: "Payment failed",
  confirmed: "Confirmed", processing: "Processing", shipped: "Shipped",
  out_for_delivery: "Out for delivery", delivered: "Delivered", cancelled: "Cancelled", returned: "Returned",
};
export const editableOrderStatuses = ["processing", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"] as const;
export type EditableOrderStatus = typeof editableOrderStatuses[number];
export const statusLabel = (status: string) => orderStatusLabels[status] ?? status.replaceAll("_", " ");

export function allowedOrderStatuses(order: { status: string; paymentStatus: string; totalAmountPaid: number | null }): EditableOrderStatus[] {
  // Legacy orders did not store a payment status. Preserve fulfillment for those
  // with a recorded paid amount without pretending their payment was verified.
  const paid = order.paymentStatus === "paid" || (order.paymentStatus === "unknown" && (order.totalAmountPaid ?? 0) > 0);
  if (!paid) return [];
  switch (order.status) {
    case "pending":
    case "confirmed": return ["processing", "shipped", "cancelled"];
    case "processing": return ["shipped", "cancelled"];
    case "shipped": return ["out_for_delivery", "delivered"];
    case "out_for_delivery": return ["delivered"];
    case "delivered": return ["returned"];
    default: return [];
  }
}

export const statusMessages: Record<EditableOrderStatus, string> = {
  processing: "Your order is being prepared by our team.",
  shipped: "Your order has been dispatched and is on its way to you.",
  out_for_delivery: "Your order is out for delivery. Please keep an eye out for your delivery.",
  delivered: "Your order has been marked as delivered. We hope you love your pieces.",
  cancelled: "Your order has been cancelled. Please contact us if you need help with the next steps. This update does not confirm a refund.",
  returned: "Your order has been marked as returned. Please contact us if you need help with the next steps. This update does not confirm a refund.",
};
