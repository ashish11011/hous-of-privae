import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutSchema, createCheckout } from "../lib/payments/checkout";
import { savedOrders, gatewayOrders, productId, variantId } from "./fixtures/gift-wrap-services";
import { useStore } from "../src/hepler/store/zustand";
import { sendOrderConfirmationEmail } from "../lib/email/ses";
import { emails } from "./fixtures/gift-wrap-email";

const input = {
  name: "Test customer", email: "customer@example.com", addressLine1: "Test street",
  city: "Jaipur", state: "Rajasthan",
  productDetails: [{ id: productId, variantId, quantity: 2, size: "s" }],
};

test("gift wrapping is optional, strictly typed and limited to a 200-character note", () => {
  assert.equal(checkoutSchema.parse(input).giftWrap, false);
  assert.equal(checkoutSchema.parse({ ...input, giftWrapNote: "  Happy birthday!  " }).giftWrapNote, "Happy birthday!");
  assert.equal(checkoutSchema.safeParse({ ...input, giftWrap: "false" }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...input, giftWrapNote: "x".repeat(201) }).success, false);
  assert.equal(checkoutSchema.safeParse({ ...input, giftWrapNote: "x".repeat(200) }).success, true);
});

test("server charges exactly 500 once per order and records packing instructions", async () => {
  const result = await createCheckout(checkoutSchema.parse({
    ...input, giftWrap: true, giftWrapNote: "  Happy birthday!  ", giftWrapCharge: 1,
  }));
  assert.equal(result.amount, 250000);
  assert.equal(result.giftWrapCharge, 500);
  assert.equal(gatewayOrders.at(-1).amount, 250000);
  const snapshot = savedOrders.at(-1).checkoutSnapshot;
  assert.equal(snapshot.giftWrap, true);
  assert.equal(snapshot.giftWrapCharge, 500);
  assert.equal(snapshot.giftWrapNote, "Happy birthday!");
  assert.equal(snapshot.totalAmountPaid, 2500);
});

test("unselected wrapping has no fee or note; loyalty cap still uses merchandise only", async () => {
  const result = await createCheckout(checkoutSchema.parse({ ...input, giftWrapNote: "Do not save" }));
  assert.equal(result.amount, 200000);
  assert.equal(savedOrders.at(-1).checkoutSnapshot.giftWrapNote, "");
  const discounted = await createCheckout(checkoutSchema.parse({ ...input, giftWrap: true, loyaltyPointsToRedeem: 4000 }));
  assert.equal(discounted.amount, 210000);
  await assert.rejects(createCheckout(checkoutSchema.parse({ ...input, giftWrap: true, loyaltyPointsToRedeem: 5000 })), /20%/);
});

test("atelier notes are bounded and saved independently of gift wrapping", async () => {
  assert.equal(checkoutSchema.safeParse({ ...input, atelierNote: "x".repeat(501) }).success, false);
  await createCheckout(checkoutSchema.parse({ ...input, atelierNote: "  Call on arrival.  " }));
  const snapshot = savedOrders.at(-1).checkoutSnapshot;
  assert.equal(snapshot.atelierNote, "Call on arrival.");
  assert.equal(snapshot.giftWrap, false);
});

test("clearing or removing the last cart item clears gift wrapping and its note", () => {
  const store = useStore.getState();
  const item = { id: productId, variantId, quantity: 1, size: "s", color: "Purple", variant: "stitched" } as any;
  for (const remove of [() => store.removeItemFromStore(item), () => store.decreaseQuantity(item), () => store.clearCart()]) {
    store.addItemToStore(item);
    store.setGiftWrap(true);
    store.setGiftWrapNote("x".repeat(250));
    assert.equal(useStore.getState().giftWrapNote.length, 200);
    remove();
    assert.equal(useStore.getState().giftWrap, false);
    assert.equal(useStore.getState().giftWrapNote, "");
  }
});

test("confirmation emails include gift instructions and safely escape the handwritten note", async () => {
  const previousKey = process.env.NEXT_PUBLIC_S3_ACCESS_KEY;
  const previousSecret = process.env.NEXT_S3_SECRET_KEY;
  process.env.NEXT_PUBLIC_S3_ACCESS_KEY = "test-only";
  process.env.NEXT_S3_SECRET_KEY = "test-only";
  try {
    await sendOrderConfirmationEmail({
      orderId: "test-order", user: { email: "customer@example.com" }, address: {}, items: [],
      subtotalAmount: 2000, deliveryCharge: 0, discountAmount: 0, totalAmountPaid: 2500,
      giftWrap: true, giftWrapCharge: 500, giftWrapNote: '<script>alert("gift")</script>\nWith love',
    }, "admin");
    const message = emails.at(-1).Message.Body;
    assert.match(message.Text.Data, /Gift wrapping: Rs\. 500/);
    assert.match(message.Text.Data, /Handwritten gift note:/);
    assert.match(message.Html.Data, /&lt;script&gt;alert\(&quot;gift&quot;\)&lt;\/script&gt;/);
    assert.doesNotMatch(message.Html.Data, /<script>/);
  } finally {
    if (previousKey === undefined) delete process.env.NEXT_PUBLIC_S3_ACCESS_KEY;
    else process.env.NEXT_PUBLIC_S3_ACCESS_KEY = previousKey;
    if (previousSecret === undefined) delete process.env.NEXT_S3_SECRET_KEY;
    else process.env.NEXT_S3_SECRET_KEY = previousSecret;
  }
});
