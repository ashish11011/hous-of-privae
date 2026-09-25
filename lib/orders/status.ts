export const orderStatusLabels: Record<string, string> = {
  pending: "Pending",
  pending_payment: "Awaiting payment",
  payment_failed: "Payment failed",
  confirmed: "Confirmed",
  stitching: "Stitching",
  dispatched: "Dispatched",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  // Legacy aliases
  processing: "Processing",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
};

export const editableOrderStatuses = [
  "stitching",
  "dispatched",
  "delivered",
  "returned",
  "cancelled",
  "processing",
  "shipped",
  "out_for_delivery",
] as const;

export type EditableOrderStatus = (typeof editableOrderStatuses)[number];

export const statusLabel = (status: string) =>
  orderStatusLabels[status] ?? status.replaceAll("_", " ");

export function allowedOrderStatuses(order: {
  status: string;
  paymentStatus: string;
  totalAmountPaid: number | null;
}): EditableOrderStatus[] {
  // Legacy orders did not store a payment status. Preserve fulfillment for those
  // with a recorded paid amount without pretending their payment was verified.
  const paid =
    order.paymentStatus === "paid" ||
    (order.paymentStatus === "unknown" && (order.totalAmountPaid ?? 0) > 0);
  if (!paid) return [];

  switch (order.status) {
    case "pending":
    case "confirmed":
      return ["stitching", "dispatched", "delivered", "returned"];
    case "stitching":
    case "processing":
      return ["dispatched", "delivered", "returned"];
    case "dispatched":
    case "shipped":
    case "out_for_delivery":
      return ["delivered", "returned"];
    case "delivered":
      return ["returned"];
    case "cancelled":
    case "returned":
      return [];
    default:
      return ["stitching", "dispatched", "delivered", "returned"];
  }
}

export const statusMessages: Record<EditableOrderStatus, string> = {
  stitching: "Your order is being handcrafted and stitched by our master artisans.",
  dispatched: "Your order has been dispatched and is on its way to you.",
  delivered:
    "Your order has been marked as delivered. We hope you love your pieces.",
  returned:
    "Your order has been marked as returned. Please contact us if you need help with the next steps. This update does not confirm a refund.",
  cancelled:
    "Your order has been cancelled. Please contact us if you need help with the next steps. This update does not confirm a refund.",
  processing: "Your order is being prepared by our team.",
  shipped: "Your order has been dispatched and is on its way to you.",
  out_for_delivery:
    "Your order is out for delivery. Please keep an eye out for your delivery.",
};
