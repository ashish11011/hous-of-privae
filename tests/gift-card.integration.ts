import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import postgres from "postgres";
import { getTableName, SQL } from "drizzle-orm";
import { getTableConfig, PgDialect } from "drizzle-orm/pg-core";
import {
  giftCard,
  giftCardReservation,
  giftCardTransaction,
} from "../db/giftCardSchema";
import {
  createGiftCardPurchase,
  claimGiftCard,
  getAccountGiftCards,
} from "../lib/gift-cards/service";
import { checkGiftCard } from "../lib/gift-cards/redemption";
import {
  decryptGiftCardCode,
  hashGiftCardCode,
  encryptGiftCardCode,
} from "../lib/gift-cards/crypto";
import { giftCardPurchaseSchema } from "../lib/gift-cards/validation";
import { POST as webhook } from "../src/app/api/razorpay/webhook/route";
import { POST as checkout } from "../src/app/api/razorpay/create-order/route";
import { POST as resumeOrder } from "../src/app/api/razorpay/resume-order/route";
import { POST as verifyGift } from "../src/app/api/gift-cards/verify-payment/route";
import { GET as accountCards } from "../src/app/api/gift-cards/route";
import { POST as checkCard } from "../src/app/api/gift-cards/check/route";
import { POST as claimCard } from "../src/app/api/gift-cards/claim/route";
import { POST as purchaseCard } from "../src/app/api/gift-cards/purchase/route";
import { POST as deliverCard } from "../src/app/api/gift-cards/delivery/route";
import { GET as cardStatus } from "../src/app/api/gift-cards/status/route";
import {
  setTestSession,
  giftDeliveries,
  failGiftDelivery,
  gatewayPurchases,
  failGateway,
  failEmailFor,
} from "./fixtures/payment-services";
import { POST as retryOrderEmail } from "../src/app/api/gift-cards/complete-order/route";
import { testSchemaReady } from "./razorpay-webhook.integration";

const sql = postgres(process.env.DATABASE_URL!);
const buyerId = "00000000-0000-4000-8000-000000000030";
const recipientId = "00000000-0000-4000-8000-000000000031";
const otherId = "00000000-0000-4000-8000-000000000032";
const productId = "00000000-0000-4000-8000-000000000001";
const variantId = "00000000-0000-4000-8000-000000000010";
const buyerSession = () =>
  setTestSession({ id: buyerId, email: "gift-buyer@example.com" });
const recipientSession = () =>
  setTestSession({ id: recipientId, email: "gift-recipient@example.com" });
const post = (body: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify(body),
  });
const input = (amount = 2000) =>
  giftCardPurchaseSchema.parse({
    requestId: randomUUID(),
    amount,
    senderName: "A thoughtful friend",
    recipientName: "Someone special",
    recipientEmail: "gift-recipient@example.com",
    message: "A little joy, just for you.",
  });
function signedPayment(
  gatewayId: string,
  amount: number,
  paymentId: string,
  status = "captured",
  eventName = `payment.${status}`,
) {
  const body = JSON.stringify({
    event: eventName,
    payload: {
      payment: {
        entity: {
          id: paymentId,
          order_id: gatewayId,
          amount,
          currency: "INR",
          status,
        },
      },
    },
  });
  return new Request("http://localhost/api/razorpay/webhook", {
    method: "POST",
    body,
    headers: {
      "x-razorpay-signature": createHmac("sha256", "test-webhook-secret")
        .update(body)
        .digest("hex"),
    },
  });
}
const orderInput = (code: string, quantity = 1, overrides = {}) => ({
  requestId: randomUUID(),
  giftCardCode: code,
  name: "Gift recipient",
  email: "gift-recipient@example.com",
  addressLine1: "1 Test Street",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302001",
  productDetails: [
    {
      id: productId,
      variantId,
      quantity,
      size: "s",
      variant: "stitched",
      basePrice: 1,
    },
  ],
  ...overrides,
});

before(async () => {
  await testSchemaReady;
  // Build these tables only in the disposable test database from the actual ORM
  // declarations. This produces no migration files and never targets the app DB.
  const quote = (name: string) => `"${name.replaceAll('"', '""')}"`;
  const dialect = new PgDialect();
  for (const table of [giftCard, giftCardReservation, giftCardTransaction]) {
    const config = getTableConfig(table);
    const columns = config.columns.map((column) => {
      let value = `${quote(column.name)} ${column.getSQLType()}`;
      if (column.notNull) value += " NOT NULL";
      if (column.primary) value += " PRIMARY KEY";
      if (column.isUnique) value += " UNIQUE";
      if (column.default !== undefined) {
        const literal =
          column.default instanceof SQL
            ? dialect.sqlToQuery(column.default).sql
            : typeof column.default === "string"
              ? `'${column.default.replaceAll("'", "''")}'`
              : String(column.default);
        value += ` DEFAULT ${literal}`;
      }
      return value;
    });
    const foreignKeys = config.foreignKeys.map((key) => {
      const ref = key.reference();
      return `FOREIGN KEY (${ref.columns.map((column) => quote(column.name)).join(",")}) REFERENCES ${quote(getTableName(ref.foreignTable))} (${ref.foreignColumns.map((column) => quote(column.name)).join(",")})`;
    });
    const checks = config.checks.map(
      (check) =>
        `CONSTRAINT ${quote(check.name)} CHECK (${dialect.sqlToQuery(check.value).sql})`,
    );
    await sql.unsafe(
      `CREATE TABLE ${quote(config.name)} (${[...columns, ...foreignKeys, ...checks].join(", ")})`,
    );
  }
  await sql`insert into users (id, email, name, loyalty_points) values (${buyerId}, 'gift-buyer@example.com', 'A thoughtful friend', 0), (${recipientId}, 'gift-recipient@example.com', 'Gift recipient', 10000), (${otherId}, 'other@example.com', 'Other user', 0)`;
});
after(async () => {
  await sql.end();
});

let purchased: Awaited<ReturnType<typeof createGiftCardPurchase>>;
let code: string;
let splitOrder: any;

test("gift cards require auth and validate amounts; unrelated accounts cannot see private cards", async () => {
  setTestSession(null);
  for (const action of [
    () => accountCards(),
    () => purchaseCard(post(input())),
    () => checkCard(post({ code: "HOP-FAKE-123456-123456-123456" })),
    () => claimCard(post({ code: "HOP-FAKE-123456-123456-123456" })),
  ])
    assert.equal((await action()).status, 401);
  for (const amount of [0, -1, 999, 500001, 1000.5])
    assert.equal(
      giftCardPurchaseSchema.safeParse({ ...input(), amount }).success,
      false,
    );
  assert.equal(
    giftCardPurchaseSchema.safeParse({ ...input(), amount: 500000 }).success,
    true,
  );
});

test("purchase is idempotent, uses server amounts and exposes no redeemable code before capture", async () => {
  buyerSession();
  const details = input();
  const count = gatewayPurchases.length;
  purchased = await createGiftCardPurchase(details, buyerId);
  assert.equal(purchased.amount, 200000);
  assert.deepEqual(await createGiftCardPurchase(details, buyerId), purchased);
  assert.equal(gatewayPurchases.length, count + 1);
  const [saved] =
    await sql`select * from gift_cards where id = ${purchased.id}`;
  assert.equal(saved.balance_paise, 0);
  assert.equal(saved.encrypted_code, null);
  assert.equal(saved.code_hash, null);
  assert.equal((await getAccountGiftCards(buyerId))[0].code, null);
  assert.equal((await getAccountGiftCards(otherId)).length, 0);
  assert.equal(
    (await sql`select loyalty_points from users where id = ${buyerId}`)[0]
      .loyalty_points,
    0,
  );
  await assert.rejects(
    () => createGiftCardPurchase({ ...details, amount: 3000 }, buyerId),
    /already in use/,
  );
});

test("a valid checkout callback cannot activate a card, and mismatched captures are rejected", async () => {
  buyerSession();
  const paymentId = "pay_gift_purchase";
  const signature = createHmac("sha256", "test-api-secret")
    .update(`${purchased.orderId}|${paymentId}`)
    .digest("hex");
  const result = await (
    await verifyGift(
      post({
        id: purchased.id,
        razorpay_order_id: purchased.orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
      }),
    )
  ).json();
  assert.equal(result.verified, true);
  assert.equal(result.confirmed, false);
  assert.equal(
    (await webhook(signedPayment(purchased.orderId!, 100000, paymentId)))
      .status,
    500,
  );
  assert.equal(
    (
      await sql`select balance_paise from gift_cards where id = ${purchased.id}`
    )[0].balance_paise,
    0,
  );
});

test("capture activates once; email failure preserves the paid card and duplicate webhooks retry delivery only", async () => {
  failGiftDelivery(true);
  assert.equal(
    (
      await webhook(
        signedPayment(purchased.orderId!, 200000, "pay_gift_purchase"),
      )
    ).status,
    500,
  );
  const [saved] =
    await sql`select * from gift_cards where id = ${purchased.id}`;
  assert.equal(saved.payment_status, "paid");
  assert.equal(saved.balance_paise, 200000);
  code = decryptGiftCardCode(saved.encrypted_code);
  assert.equal(saved.code_hash, hashGiftCardCode(code));
  assert.ok(!saved.encrypted_code.includes(code));
  failGiftDelivery(false);
  const results = await Promise.all(
    Array.from({ length: 6 }, (_, index) =>
      webhook(
        signedPayment(
          purchased.orderId!,
          200000,
          "pay_gift_purchase",
          "captured",
          index % 2 ? "order.paid" : "payment.captured",
        ),
      ),
    ),
  );
  assert.ok(results.every((result) => result.status === 200));
  assert.equal(
    (
      await sql`select count(*)::int as n from gift_card_transactions where gift_card_id = ${purchased.id}`
    )[0].n,
    1,
  );
  assert.equal(
    giftDeliveries.filter((delivery) => delivery.code === code).length,
    2,
  );
  assert.equal(
    (
      await webhook(
        signedPayment(
          purchased.orderId!,
          200000,
          "pay_gift_purchase",
          "failed",
        ),
      )
    ).status,
    200,
  );
  assert.equal(
    (
      await sql`select balance_paise from gift_cards where id = ${purchased.id}`
    )[0].balance_paise,
    200000,
  );
});

test("recipient claims a shared code; code formatting is normalized and only the owner can spend it", async () => {
  recipientSession();
  const card = await claimGiftCard(
    code.toLowerCase().replaceAll("-", " "),
    recipientId,
  );
  assert.equal(card.balancePaise, 200000);
  assert.equal((await getAccountGiftCards(recipientId))[0].isMine, true);
  await assert.rejects(
    () => claimGiftCard(code, otherId),
    /belongs to another/,
  );
  await assert.rejects(
    () => checkGiftCard(code, buyerId),
    /belongs to another/,
  );
  assert.equal((await checkGiftCard(code, recipientId)).balancePaise, 200000);
});

test("gift card plus loyalty and gift wrap charges only the cash remainder and reserves credit atomically", async () => {
  recipientSession();
  const request = orderInput(code, 3, {
    loyaltyPointsToRedeem: 1000,
    giftWrap: true,
    giftWrapNote: "For the recipient",
  });
  const response = await checkout(post(request));
  assert.equal(response.status, 200);
  splitOrder = await response.json();
  assert.equal(splitOrder.giftCardAmount, 2000);
  assert.equal(splitOrder.amount, 140000);
  const [reservation] =
    await sql`select * from gift_card_reservations where order_id = ${splitOrder.internalOrderId}`;
  assert.equal(reservation.amount_paise, 200000);
  assert.equal(reservation.status, "reserved");
  assert.equal(
    (
      await sql`select balance_paise from gift_cards where id = ${purchased.id}`
    )[0].balance_paise,
    200000,
  );
  const replay = await (await checkout(post(request))).json();
  assert.equal(replay.internalOrderId, splitOrder.internalOrderId);
  assert.equal((await checkout(post(orderInput(code)))).status, 409);
});

test("failed payment keeps its gift-card reservation; resume uses the same gateway order and amount", async () => {
  assert.equal(
    (
      await webhook(
        signedPayment(
          splitOrder.orderId,
          140000,
          "pay_split_attempt",
          "failed",
        ),
      )
    ).status,
    200,
  );
  const resumed = await (
    await resumeOrder(post({ orderId: splitOrder.internalOrderId }))
  ).json();
  assert.equal(resumed.orderId, splitOrder.orderId);
  assert.equal(resumed.amount, 140000);
  assert.equal(resumed.giftCardAmount, 2000);
  await assert.rejects(() => checkGiftCard(code, recipientId), /reserved/);
});

test("split capture settles cash, gift credit and loyalty once under concurrent webhook delivery", async () => {
  const responses = await Promise.all(
    Array.from({ length: 6 }, () =>
      webhook(signedPayment(splitOrder.orderId, 140000, "pay_split_success")),
    ),
  );
  assert.ok(responses.every((response) => response.status === 200));
  const [saved] =
    await sql`select * from "order" where id = ${splitOrder.internalOrderId}`;
  assert.equal(saved.payment_status, "paid");
  assert.equal(saved.total_amount_paid, 3400);
  assert.equal(saved.checkout_snapshot.giftCardAmount, 2000);
  assert.equal(saved.checkout_snapshot.cashAmount, 1400);
  assert.equal(
    (
      await sql`select balance_paise from gift_cards where id = ${purchased.id}`
    )[0].balance_paise,
    0,
  );
  assert.equal(
    (await sql`select loyalty_points from users where id = ${recipientId}`)[0]
      .loyalty_points,
    9340,
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from gift_card_transactions where order_id = ${splitOrder.internalOrderId}`
    )[0].n,
    1,
  );
});

async function activeCard(amount: number, id: string) {
  const purchase = await createGiftCardPurchase(
    { ...input(amount), requestId: id, recipientEmail: "" },
    buyerId,
  );
  assert.equal(
    (
      await webhook(
        signedPayment(
          purchase.orderId!,
          amount * 100,
          `pay_${id.replaceAll("-", "")}`,
        ),
      )
    ).status,
    200,
  );
  const [saved] =
    await sql`select encrypted_code from gift_cards where id = ${id}`;
  return decryptGiftCardCode(saved.encrypted_code);
}

test("fully funded checkout creates no Razorpay order; remaining credit survives and replay cannot spend twice", async () => {
  recipientSession();
  const cardId = randomUUID();
  const fullCode = await activeCard(5000, cardId);
  const request = orderInput(fullCode);
  const previous = gatewayPurchases.length;
  const first = await (await checkout(post(request))).json();
  assert.equal(first.confirmed, true);
  assert.equal(first.amount, 0);
  assert.equal(first.orderId, null);
  assert.equal(gatewayPurchases.length, previous);
  assert.equal(
    (await sql`select balance_paise from gift_cards where id = ${cardId}`)[0]
      .balance_paise,
    394000,
  );
  const second = await (await checkout(post(request))).json();
  assert.equal(second.internalOrderId, first.internalOrderId);
  assert.equal(
    (await sql`select balance_paise from gift_cards where id = ${cardId}`)[0]
      .balance_paise,
    394000,
  );
  const next = await (await checkout(post(orderInput(fullCode, 2)))).json();
  assert.equal(next.confirmed, true);
  assert.equal(
    (await sql`select balance_paise from gift_cards where id = ${cardId}`)[0]
      .balance_paise,
    194000,
  );
});

test("fully funded order survives email failure and authenticated retry sends its receipt without spending twice", async () => {
  recipientSession();
  const id = randomUUID();
  const creditCode = await activeCard(3000, id);
  failEmailFor("customer");
  const result = await (await checkout(post(orderInput(creditCode)))).json();
  failEmailFor(null);
  assert.equal(result.confirmed, true);
  assert.equal(result.emailPending, true);
  const previousBalance = (
    await sql`select balance_paise from gift_cards where id = ${id}`
  )[0].balance_paise;
  assert.equal(
    (await retryOrderEmail(post({ id: result.internalOrderId }))).status,
    200,
  );
  assert.equal(
    (await sql`select balance_paise from gift_cards where id = ${id}`)[0]
      .balance_paise,
    previousBalance,
  );
  const [saved] =
    await sql`select confirmation_email_sent_at, admin_email_sent_at from "order" where id = ${result.internalOrderId}`;
  assert.ok(saved.confirmation_email_sent_at);
  assert.ok(saved.admin_email_sent_at);
});

test("gift card ciphertext rejects tampering and code hashes normalize presentation", () => {
  const encrypted = encryptGiftCardCode(code);
  assert.equal(decryptGiftCardCode(encrypted), code);
  const pieces = encrypted.split(".");
  pieces[1] = `${pieces[1][0] === "A" ? "B" : "A"}${pieces[1].slice(1)}`;
  assert.throws(() => decryptGiftCardCode(pieces.join(".")));
  assert.equal(
    hashGiftCardCode(code),
    hashGiftCardCode(code.toLowerCase().replaceAll("-", " ")),
  );
});

test("gateway creation failure rolls back the order, claim and gift-card reservation", async () => {
  recipientSession();
  const id = randomUUID();
  const cardCode = await activeCard(1000, id);
  failGateway(true);
  const response = await checkout(post(orderInput(cardCode, 2)));
  failGateway(false);
  assert.equal(response.status, 500);
  assert.equal(
    (
      await sql`select count(*)::int as n from gift_card_reservations where gift_card_id = ${id}`
    )[0].n,
    0,
  );
  const [saved] =
    await sql`select balance_paise, claimed_by_id from gift_cards where id = ${id}`;
  assert.equal(saved.balance_paise, 100000);
  assert.equal(saved.claimed_by_id, null);
});

test("competing account claims and simultaneous spending cannot overdraw a shared gift card", async () => {
  recipientSession();
  const id = randomUUID();
  const sharedCode = await activeCard(1500, id);
  const claims = await Promise.allSettled([
    claimGiftCard(sharedCode, recipientId),
    claimGiftCard(sharedCode, otherId),
  ]);
  assert.equal(
    claims.filter((result) => result.status === "fulfilled").length,
    1,
  );
  const [owner] =
    await sql`select claimed_by_id from gift_cards where id = ${id}`;
  setTestSession({ id: owner.claimed_by_id });
  const responses = await Promise.all([
    checkout(post(orderInput(sharedCode, 2))),
    checkout(post(orderInput(sharedCode, 2))),
  ]);
  assert.deepEqual(
    responses.map((response) => response.status).sort(),
    [200, 409],
  );
  assert.equal(
    (
      await sql`select count(*)::int as n from gift_card_reservations where gift_card_id = ${id}`
    )[0].n,
    1,
  );
  assert.equal(
    (await sql`select balance_paise from gift_cards where id = ${id}`)[0]
      .balance_paise,
    150000,
  );
});

test("card status and delivery retry are purchaser-scoped and do not repeat delivered emails", async () => {
  setTestSession({ id: otherId });
  assert.equal(
    (
      await cardStatus(
        new Request(
          `http://localhost/api/gift-cards/status?id=${purchased.id}`,
        ),
      )
    ).status,
    404,
  );
  assert.equal((await deliverCard(post({ id: purchased.id }))).status, 404);
  buyerSession();
  const previous = giftDeliveries.length;
  assert.equal((await deliverCard(post({ id: purchased.id }))).status, 200);
  assert.equal(giftDeliveries.length, previous);
});
