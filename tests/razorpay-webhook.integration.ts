import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { POST as webhook } from "../src/app/api/razorpay/webhook/route";
import { POST as verify } from "../src/app/api/razorpay/verify-payment/route";
import { POST as oldCreate } from "../src/app/api/order/create/route";
import { POST as checkout } from "../src/app/api/razorpay/create-order/route";
import { deliveries, failEmailFor } from "./fixtures/payment-services";

const sql = postgres(process.env.DATABASE_URL!);
const secret = "test-webhook-secret";
let gatewayOrderId: string;
let internalOrderId: string;
const productId = "00000000-0000-4000-8000-000000000001";
const checkoutInput = {
  name: "Test Customer", email: "customer@example.com", number: "9999999999",
  addressLine1: "Test street", city: "Jaipur", state: "Rajasthan", pincode: "302001",
  // Deliberately forged prices: the server must charge database prices instead.
  amount: 100, totalAmountPaid: 1,
  productDetails: [{ id: productId, quantity: 2, basePrice: 1, unitPrice: 1, variant: "stitched" }],
};
const post = (body: unknown) => new Request("http://localhost/api", { method: "POST", body: JSON.stringify(body) });
function event(status = "captured", eventName = `payment.${status}`, overrides = {}) {
  return { event: eventName, payload: { payment: { entity: {
    id: "pay_test", order_id: gatewayOrderId, amount: 200000, currency: "INR", status, ...overrides,
  } } } };
}
function signed(body: unknown, signature?: string) {
  const raw = JSON.stringify(body);
  return new Request("http://localhost/api/razorpay/webhook", { method: "POST", body: raw,
    headers: { "x-razorpay-signature": signature ?? createHmac("sha256", secret).update(raw).digest("hex") } });
}
async function saved() { return (await sql`select * from "order" where id = ${internalOrderId}`)[0]; }
async function points() { return (await sql`select loyalty_points from users where email = 'customer@example.com'`)[0].loyalty_points; }
function callback() {
  const signature = createHmac("sha256", "test-api-secret").update(`${gatewayOrderId}|pay_test`).digest("hex");
  return post({ razorpay_order_id: gatewayOrderId, razorpay_payment_id: "pay_test", razorpay_signature: signature });
}

before(async () => {
  // Only a disposable, empty local database is accepted by the runner.
  for (const file of ["0000_stormy_vertigo", "0004_outgoing_baron_strucker", "0005_legal_franklin_storm", "0006_soft_fabian_cortez", "0007_razorpay_webhook"]) {
    await sql.unsafe(readFileSync(`db/migrations/${file}.sql`, "utf8"));
  }
  await sql`insert into products (id, name, slug, base_price, semi_stitched_price) values (${productId}, 'Test garment', 'test-garment', 1000, 1200)`;
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
  process.env.RAZORPAY_KEY_SECRET = "test-api-secret";
});
after(async () => { await sql.end(); });

test("checkout persists an unpaid order with authoritative prices and no email", async () => {
  const response = await checkout(post(checkoutInput));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.amount, 200000);
  gatewayOrderId = result.orderId;
  internalOrderId = result.internalOrderId;
  assert.equal((await saved()).payment_status, "pending");
  assert.equal((await saved()).total_amount_paid, 0);
  assert.equal(deliveries.length, 0);
});

test("browser callback and legacy endpoint cannot confirm or email", async () => {
  assert.equal((await oldCreate()).status, 410);
  const result = await (await verify(callback())).json();
  assert.equal(result.verified, true);
  assert.equal(result.confirmed, false);
  assert.equal((await saved()).status, "pending_payment");
  assert.equal(await points(), 0);
  assert.equal(deliveries.length, 0);
});

test("invalid signatures, mismatched amount/currency/order and malformed events do not mutate", async () => {
  for (const signature of ["bad", "0".repeat(64)]) assert.equal((await webhook(signed(event(), signature))).status, 401);
  assert.equal((await webhook(signed({ event: "payment.captured" }))).status, 400);
  for (const overrides of [{ amount: 100 }, { currency: "USD" }, { order_id: "order_unknown" }]) {
    assert.equal((await webhook(signed(event("captured", "payment.captured", overrides)))).status, 500);
  }
  assert.equal((await webhook(signed({ event: "refund.created" }))).status, 200);
  assert.equal((await saved()).payment_status, "pending");
  assert.equal(await points(), 0);
  assert.equal(deliveries.length, 0);
});

test("failed and authorized events update status without confirmation email", async () => {
  assert.equal((await webhook(signed(event("failed")))).status, 200);
  assert.equal((await saved()).status, "payment_failed");
  assert.equal((await webhook(signed(event("authorized")))).status, 200);
  assert.equal((await saved()).payment_status, "authorized");
  assert.equal(deliveries.length, 0);
  assert.equal(await points(), 0);
});

test("captured payment commits payment and rewards even when email fails", async () => {
  failEmailFor("customer");
  assert.equal((await webhook(signed(event()))).status, 500);
  const order = await saved();
  assert.equal(order.status, "confirmed");
  assert.equal(order.payment_status, "paid");
  assert.equal(order.total_amount_paid, 2000);
  assert.equal(order.razorpay_payment_id, "pay_test");
  assert.equal(await points(), 200);
  assert.equal(order.confirmation_email_sent_at, null);
});

test("email retry and concurrent duplicate events send once per recipient and award once", async () => {
  failEmailFor("admin");
  assert.equal((await webhook(signed(event()))).status, 500);
  assert.deepEqual(deliveries, ["customer"]);
  failEmailFor(null);
  const responses = await Promise.all(Array.from({ length: 6 }, (_, index) =>
    webhook(signed(event("captured", index % 2 ? "order.paid" : "payment.captured")))));
  assert.ok(responses.every(response => response.status === 200));
  assert.deepEqual(deliveries, ["customer", "admin"]);
  assert.equal(await points(), 200);
  assert.ok((await saved()).admin_email_sent_at);
});

test("late failures and authorization never regress paid or fulfillment status", async () => {
  await sql`update "order" set status = 'shipped' where id = ${internalOrderId}`;
  for (const status of ["failed", "authorized", "captured"]) assert.equal((await webhook(signed(event(status)))).status, 200);
  assert.equal((await saved()).status, "shipped");
  assert.equal((await saved()).payment_status, "paid");
  assert.equal(await points(), 200);
  assert.deepEqual(deliveries, ["customer", "admin"]);
  const result = await (await verify(callback())).json();
  assert.equal(result.confirmed, true);
  assert.equal(result.loyaltyPointsEarned, 200);
});

test("another captured payment cannot be applied to an already paid order", async () => {
  assert.equal((await webhook(signed(event("captured", "payment.captured", { id: "pay_other" })))).status, 500);
  assert.equal((await saved()).razorpay_payment_id, "pay_test");
  assert.equal(await points(), 200);
});

test("missing webhook secret fails closed", async () => {
  delete process.env.RAZORPAY_WEBHOOK_SECRET;
  assert.equal((await webhook(signed(event()))).status, 503);
  process.env.RAZORPAY_WEBHOOK_SECRET = secret;
});
