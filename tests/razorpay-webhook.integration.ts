import { createProduct, updateProdcutInfoBySlug, getProductByCategory, getProdcutInfoBySlug, deleteProductBySlug } from "../lib/productHelper";
import { useGetAllProducts, getAdminProducts, searchProducts } from "../src/hepler/order/useGetAllProducts";
import { getProductFromIds } from "../src/hepler/order/getPorductFromids";
import { pricingConfigSchema, priceForSize } from "../lib/productPricing";
import { GET as getDetails } from "../src/app/api/admin/orders/[id]/route";
import { PATCH as patchStatus } from "../src/app/api/admin/orders/[id]/status/route";
import { POST as retryStatusEmail } from "../src/app/api/admin/orders/[id]/notifications/[eventId]/route";
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import postgres from "postgres";
import { POST as webhook } from "../src/app/api/razorpay/webhook/route";
import { POST as verify } from "../src/app/api/razorpay/verify-payment/route";
import { POST as oldCreate } from "../src/app/api/order/create/route";
import { POST as checkout } from "../src/app/api/razorpay/create-order/route";
import { deliveries, failEmailFor, setTestSession, statusDeliveries } from "./fixtures/payment-services";

const sql = postgres(process.env.DATABASE_URL!);
const secret = "test-webhook-secret";
let gatewayOrderId: string;
let internalOrderId: string;
const productId = "00000000-0000-4000-8000-000000000001";
const variantId = "00000000-0000-4000-8000-000000000010";
const checkoutInput = {
  name: "Test Customer", email: "customer@example.com", number: "9999999999",
  addressLine1: "Test street", city: "Jaipur", state: "Rajasthan", pincode: "302001",
  // Deliberately forged prices: the server must charge database prices instead.
  amount: 100, totalAmountPaid: 1,
  productDetails: [{ id: productId, variantId, size: "s", quantity: 2, basePrice: 1, unitPrice: 1, variant: "stitched" }],
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
  const journal = JSON.parse(readFileSync("db/migrations/meta/_journal.json", "utf8"));
  // 0004 already adds the variant column from historical migration 0001.
  for (const { tag: file } of journal.entries.filter((entry: { idx: number }) => entry.idx !== 1)) {
    await sql.unsafe(readFileSync(`db/migrations/${file}.sql`, "utf8"));
  }
  await sql`insert into products (id, name, slug, base_price, pricing_config) values (${productId}, 'Test garment', 'test-garment', 1000, '[{"size":"s","basePrice":1000,"isVisible":true}]'::jsonb)`;
  await sql`insert into product_varient (id, product_id, color, banner_image, images) values (${variantId}, ${productId}, 'Purple', '/test-purple.jpg', ARRAY['/test-purple.jpg'])`;
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

const adminId = "00000000-0000-4000-8000-000000000002";
const context = () => ({ params: Promise.resolve({ id: internalOrderId }) });
async function adminDetail() { return (await (await getDetails(post({}), context())).json()).order; }
async function updateStatus(status: string, expectedUpdatedAt: string) {
  return patchStatus(post({ status, expectedUpdatedAt }), context());
}

test("admin details and status APIs reject guests and non-admin accounts", async () => {
  assert.equal((await getDetails(post({}), context())).status, 403);
  assert.equal((await updateStatus("processing", new Date().toISOString())).status, 403);
  const [customer] = await sql`select id from users where email = 'customer@example.com'`;
  setTestSession({ id: customer.id });
  assert.equal((await getDetails(post({}), context())).status, 403);
  await sql`insert into users (id, email, user_type) values (${adminId}, 'admin@example.com', '1')`;
  setTestSession({ id: adminId });
});

test("admin sees purchased items and original prices after catalog changes", async () => {
  await sql`update products set name = 'Renamed garment', base_price = 9999 where id = ${productId}`;
  const detail = await adminDetail();
  assert.equal(detail.items[0].name, "Test garment");
  assert.equal(detail.items[0].unitPrice, 1000);
  assert.equal(detail.items[0].quantity, 2);
  assert.equal(detail.customerEmail, "customer@example.com");
  assert.equal(detail.address.city, "Jaipur");
  assert.equal(detail.razorpayPaymentId, "pay_test");
});

test("admin updates fulfillment and sends exactly one email without changing payment", async () => {
  await sql`update "order" set status = 'confirmed' where id = ${internalOrderId}`;
  const detail = await adminDetail();
  const response = await updateStatus("stitching", detail.updatedAt);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).emailSent, true);
  assert.equal((await saved()).status, "stitching");
  assert.equal((await saved()).payment_status, "paid");
  assert.equal(await points(), 200);
  assert.equal(statusDeliveries.length, 1);
  assert.equal(statusDeliveries[0].email, "customer@example.com");
  const current = await adminDetail();
  assert.ok(current.history[0].emailSentAt);
  assert.equal((await updateStatus("stitching", current.updatedAt)).status, 200);
  assert.equal(statusDeliveries.length, 1);
  assert.equal((await updateStatus("delivered", detail.updatedAt)).status, 409);
});

test("failed status email is saved for retry without reverting fulfillment", async () => {
  failEmailFor("status");
  const response = await updateStatus("dispatched", (await adminDetail()).updatedAt);
  assert.equal(response.status, 200);
  assert.equal((await response.json()).emailSent, false);
  assert.equal((await saved()).status, "dispatched");
  const detail = await adminDetail();
  const event = detail.history[0];
  assert.equal(event.emailSentAt, null);
  assert.equal(statusDeliveries.length, 1);
  failEmailFor(null);
  const retryContext = { params: Promise.resolve({ id: internalOrderId, eventId: event.id }) };
  const results = [await retryStatusEmail(post({}), retryContext), await retryStatusEmail(post({}), retryContext)];
  assert.ok(results.every(result => result.status === 200));
  assert.equal(statusDeliveries.length, 2);
  assert.ok((await adminDetail()).history[0].emailSentAt);
});

test("admins cannot override payment state or use an invalid fulfillment transition", async () => {
  const detail = await adminDetail();
  assert.equal((await updateStatus("confirmed", detail.updatedAt)).status, 400);
  assert.equal((await updateStatus("processing", detail.updatedAt)).status, 409);
  const response = await patchStatus(post({ status: "returned", expectedUpdatedAt: detail.updatedAt, paymentStatus: "paid" }), context());
  assert.equal(response.status, 400);
  await sql`update "order" set payment_status = 'pending' where id = ${internalOrderId}`;
  assert.equal((await updateStatus("returned", detail.updatedAt)).status, 409);
  await sql`update "order" set payment_status = 'paid' where id = ${internalOrderId}`;
});

test("concurrent status changes create one history event and one email", async () => {
  const detail = await adminDetail();
  const results = await Promise.all([updateStatus("delivered", detail.updatedAt), updateStatus("delivered", detail.updatedAt)]);
  assert.deepEqual(results.map(result => result.status).sort(), [200, 409]);
  assert.equal(statusDeliveries.length, 3);
  assert.equal((await adminDetail()).history.length, 3);
  assert.equal((await saved()).status, "delivered");
  assert.equal((await saved()).payment_status, "paid");
});

let catalogProductId: string;
let catalogVariants: { id: string; color: string; bannerImage: string; images: string[] | null }[];
const categoryId = "00000000-0000-4000-8000-000000000020";
const catalogInput = {
  name: "Variant test dress", slug: "variant-test-dress", sku: "VT1", categoryId1: categoryId,
  pricingConfig: [
    { size: "s", basePrice: 1500, strikethroughPrice: 2000, isVisible: true },
    { size: "m", basePrice: 1800, strikethroughPrice: 2200, isVisible: true },
    { size: "xl", basePrice: 2100, strikethroughPrice: 2300, isVisible: false },
  ],
  variants: [
    { color: "Red", bannerImage: "/red.jpg", images: ["/red-detail.jpg"] },
    { color: "Blue", bannerImage: "/blue.jpg", images: ["/blue-detail.jpg"] },
  ],
};

test("pricing validates global sizes, duplicate rows, visibility and positive selling prices", () => {
  assert.equal(pricingConfigSchema.safeParse(catalogInput.pricingConfig).success, true);
  assert.equal(pricingConfigSchema.safeParse([{ size: "x", basePrice: 100, isVisible: true }]).success, false);
  assert.equal(pricingConfigSchema.safeParse([{ size: "s", basePrice: 0, isVisible: true }]).success, false);
  assert.equal(pricingConfigSchema.safeParse([catalogInput.pricingConfig[0], catalogInput.pricingConfig[0]]).success, false);
  assert.equal(priceForSize(catalogInput.pricingConfig, "xl"), undefined);
  assert.equal(priceForSize(catalogInput.pricingConfig, "M")?.basePrice, 1800);
});

test("admin creates one product with two independently addressable variant cards", async () => {
  await sql`insert into categories (id, name, slug) values (${categoryId}, 'Test edit', 'test-edit')`;
  const created = await createProduct(catalogInput);
  catalogProductId = created.id;
  const [product] = await getProdcutInfoBySlug(catalogInput.slug);
  catalogVariants = product.variants;
  assert.equal(product.variants.length, 2);
  assert.deepEqual(product.sizes, ["s", "m"]);
  const cards = await getProductByCategory(categoryId);
  assert.equal(cards.length, 2);
  assert.equal(new Set(cards.map(card => card.variantId)).size, 2);
  assert.deepEqual(new Set(cards.map(card => card.bannerImage)), new Set(["/red.jpg", "/blue.jpg"]));
  assert.ok(cards.every(card => card.id === catalogProductId && card.basePrice === 1500));
  assert.equal((await searchProducts("Variant test dress")).length, 2);
  const page = await useGetAllProducts(1, 1);
  assert.ok(!Array.isArray(page));
  if (!Array.isArray(page)) { assert.equal(page.products.length, 1); assert.equal(page.total, 3); }
  assert.equal((await getAdminProducts(1, 10)).total, 2);
  assert.equal((await getProductFromIds([catalogVariants[1].id]))[0].variantId, catalogVariants[1].id);
});

test("checkout charges the selected size, preserves variant identity and rejects hidden/mismatched variants", async () => {
  const body = { ...checkoutInput, productDetails: [{ id: catalogProductId, variantId: catalogVariants[1].id, size: "m", color: "forged", quantity: 1, basePrice: 1 }] };
  const response = await checkout(post(body));
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.amount, 180000);
  const [item] = await sql`select * from order_item where order_id = ${result.internalOrderId}`;
  assert.equal(item.product_variant_id, catalogVariants[1].id);
  assert.equal(item.color, catalogVariants[1].color);
  const [order] = await sql`select checkout_snapshot from "order" where id = ${result.internalOrderId}`;
  assert.equal(order.checkout_snapshot.items[0].unitPrice, 1800);
  assert.equal(order.checkout_snapshot.items[0].image, catalogVariants[1].bannerImage);
  for (const invalid of [{ size: "xl" }, { size: "invalid" }, { variantId }, { variantId: undefined }]) {
    const invalidResponse = await checkout(post({ ...body, productDetails: [{ ...body.productDetails[0], ...invalid }] }));
    assert.notEqual(invalidResponse.status, 200);
  }
});

test("variant edits are atomic, retain IDs and protect cross-product ownership", async () => {
  await assert.rejects(updateProdcutInfoBySlug({ slug: catalogInput.slug, productDetails: { ...catalogInput, name: "Should roll back", variants: [{ ...catalogInput.variants[0], id: variantId }] } }));
  assert.equal((await getProdcutInfoBySlug(catalogInput.slug))[0].name, catalogInput.name);
  await updateProdcutInfoBySlug({ slug: catalogInput.slug, productDetails: { ...catalogInput, variants: catalogVariants.map(item => ({ ...item, images: item.images ?? [], bannerImage: `/updated-${item.color}.jpg` })) } });
  const updated = (await getProdcutInfoBySlug(catalogInput.slug))[0];
  assert.deepEqual(updated.variants.map(item => item.id), catalogVariants.map(item => item.id));
  assert.ok(updated.variants.every(item => item.bannerImage.startsWith("/updated-")));
  setTestSession(null);
  await assert.rejects(createProduct(catalogInput), /Admin sign-in/);
  setTestSession({ id: adminId });
});

test("removing variants preserves past order snapshots and archiving hides all storefront cards", async () => {
  await updateProdcutInfoBySlug({ slug: catalogInput.slug, productDetails: { ...catalogInput, variants: [{ ...catalogVariants[0], images: [] }] } });
  assert.equal((await getProductByCategory(categoryId)).length, 1);
  await deleteProductBySlug(catalogInput.slug);
  assert.equal((await getProductByCategory(categoryId)).length, 0);
  assert.equal((await getProdcutInfoBySlug(catalogInput.slug)).length, 1);
});
