export type AdminOrderSummary = {
  id: string; status: string; paymentStatus: string; currency: string;
  totalAmountPaid: number | null; createdAt: string; updatedAt: string;
  customerName: string | null; customerEmail: string | null;
};
export type AdminOrderDetail = AdminOrderSummary & {
  customerPhone: string | null;
  address: { addressLine1: string | null; addressLine2: string | null; city: string | null; state: string | null; pincode: string | null };
  subtotalAmount: number; deliveryCharge: number; discountAmount: number;
  totalAmount: number | null; couponCode: string | null;
  razorpayOrderId: string | null; razorpayPaymentId: string | null;
  items: { id: string; name: string; quantity: number; size: string | null; color: string | null; variant: string; unitPrice: number | null }[];
  history: { id: string; fromStatus: string; toStatus: string; createdAt: string; emailSentAt: string | null; recipientEmail: string }[];
};
