"use client";

export type GiftCardGatewayOrder = {
  id: string;
  orderId: string | null;
  amount: number;
  currency: string;
  confirmed: boolean;
};
export async function giftCardRequest<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(
    `/api/gift-cards${path ? `/${path.replace(/^\/|\/$/g, "")}` : ""}/`,
    body === undefined
      ? { cache: "no-store", redirect: "error" }
      : {
          method: "POST",
          redirect: "error",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const payload = await response.json();
  if (!response.ok)
    throw new Error(
      payload.msg || "Unable to complete this gift card request.",
    );
  return payload;
}
export async function payForGiftCard(
  payment: GiftCardGatewayOrder,
  prefill: { name?: string; email?: string } = {},
): Promise<{ confirmed: boolean; cancelled?: boolean }> {
  if (payment.confirmed) return { confirmed: true };
  if (
    !(window as any).Razorpay ||
    !payment.orderId ||
    !process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  )
    throw new Error(
      "Secure payment could not load. Please refresh and try again.",
    );
  return new Promise((resolve, reject) => {
    let callbackStarted = false;
    const gateway = new (window as any).Razorpay({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order_id: payment.orderId,
      amount: payment.amount,
      currency: payment.currency,
      name: "Haus of Privae",
      description: "Privae Experience Gift Card",
      prefill,
      theme: { color: "#4a1725" },
      modal: {
        ondismiss: () => {
          if (!callbackStarted) resolve({ confirmed: false, cancelled: true });
        },
      },
      handler: async (callback: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        callbackStarted = true;
        try {
          for (let attempt = 0; attempt < 15; attempt++) {
            const result = await giftCardRequest<{ confirmed: boolean }>(
              "/verify-payment",
              { ...callback, id: payment.id },
            );
            if (result.confirmed) {
              resolve({ confirmed: true });
              return;
            }
            if (attempt < 14)
              await new Promise((done) => setTimeout(done, 2000));
          }
          resolve({ confirmed: false });
        } catch (error) {
          reject(error);
        }
      },
    });
    gateway.open();
  });
}
