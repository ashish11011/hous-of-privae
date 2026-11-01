import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { createAccountTestSchema } from "./fixtures/account-test-schema";
import {
  hashGiftCardCode,
  encryptGiftCardCode,
} from "../lib/gift-cards/crypto";
import {
  giftCard,
  giftCardReservation,
  giftCardTransaction,
} from "../db/giftCardSchema";
import { orderTable, userTable } from "../db/schema";
import { db } from "../lib/db";
import {
  getCircleSummary,
  reverseCircleAward,
  creditCirclePoints,
  refreshCircleAccount,
  transferCirclePoints,
  updateCircleFulfilment,
} from "../lib/account/circle";
import {
  addCircleMonths,
  circleMaximumPoints,
  circleRewardPoints,
  tierFromSpend,
} from "../lib/account/rules";
import {
  getReferral,
  referralCookie,
  captureReferralForMember,
  reverseOrderReferral,
  readReferralCookie,
} from "../lib/account/referrals";
import {
  getMeasurements,
  getAccountProfile,
  getAddresses,
  getAppointments,
  getBespokeRequests,
  getWishlist,
} from "../lib/account/resources";
import {
  bookAppointment,
  bookedAppointmentTimes,
} from "../lib/account/atelier";
import { sendBackInStockNotifications } from "../lib/account/stock-alerts";
import { GET, POST, DELETE } from "../src/app/api/account/[resource]/route";
import { POST as checkout } from "../src/app/api/razorpay/create-order/route";
import { POST as webhook } from "../src/app/api/razorpay/webhook/route";
import { POST as bespoke } from "../src/app/api/bespoke/route";
import {
  GET as adminAtelier,
  POST as updateAtelier,
} from "../src/app/api/admin/atelier/route";
import { setTestSession, stockDeliveries } from "./fixtures/payment-services";

const sql = postgres(process.env.DATABASE_URL!);
const A = "00000000-0000-4000-8000-000000000101";
const B = "00000000-0000-4000-8000-000000000102";
const ADMIN = "00000000-0000-4000-8000-000000000103";
const PRODUCT = "00000000-0000-4000-8000-000000000201";
const VARIANT = "00000000-0000-4000-8000-000000000202";
const context = (resource: string) => ({
  params: Promise.resolve({ resource }),
});
const post = (value: unknown) =>
  new Request("http://localhost/api", {
    method: "POST",
    body: JSON.stringify(value),
  });
const signIn = (id = A) =>
  setTestSession({
    id,
    email:
      id === ADMIN
        ? "bishnoi11011@gmail.com"
        : `${id === A ? "a" : "b"}@example.com`,
  });
const baseAddress = {
  label: "Home",
  recipientName: "Member A",
  phone: "9999999999",
  line1: "1 Atelier Lane",
  line2: "",
  city: "Jaipur",
  state: "Rajasthan",
  pincode: "302001",
  country: "India",
  isDefault: true,
};

before(async () => {
  await createAccountTestSchema(sql);
  await sql`insert into users (id,name,email,loyalty_points) values (${A},'Member A','a@example.com',0),(${B},'Member B','b@example.com',0),(${ADMIN},'Admin','bishnoi11011@gmail.com',0)`;
  await sql`insert into products(id,name,slug,pricing_config,in_stock) values (${PRODUCT},'Atelier silk set','atelier-silk-set','[{"size":"s","basePrice":50000,"isVisible":true}]'::jsonb,true)`;
  await sql`insert into product_varient(id,product_id,color,banner_image) values (${VARIANT},${PRODUCT},'Gold','/refined/category-sarees.jpg')`;
  process.env.RAZORPAY_WEBHOOK_SECRET = "account-webhook-secret";
  process.env.RAZORPAY_KEY_SECRET = "account-api-secret";
});
after(async () => {
  await sql.end();
});

async function purchase(
  userId: string,
  amount: number,
  overrides: Record<string, unknown> = {},
) {
  signIn(userId);
  await sql`update products set pricing_config=${JSON.stringify([{ size: "s", basePrice: amount, isVisible: true }])}::jsonb where id=${PRODUCT}`;
  const response = await checkout(
    post({
      name: "Member",
      email: userId === A ? "a@example.com" : "b@example.com",
      addressLine1: "1 Test Lane",
      city: "Jaipur",
      state: "Rajasthan",
      pincode: "302001",
      productDetails: [
        {
          id: PRODUCT,
          variantId: VARIANT,
          size: "s",
          quantity: 1,
          basePrice: 1,
        },
      ],
      ...overrides,
    }),
  );
  const payment = await response.json();
  assert.equal(response.status, 200, JSON.stringify(payment));
  if (payment.amount > 0) {
    const body = JSON.stringify({
      event: "payment.captured",
      payload: {
        payment: {
          entity: {
            id: `pay_${payment.internalOrderId.replaceAll("-", "")}`,
            order_id: payment.orderId,
            amount: payment.amount,
            currency: "INR",
            status: "captured",
          },
        },
      },
    });
    const request = new Request("http://localhost/api/razorpay/webhook", {
      method: "POST",
      body,
      headers: {
        "x-razorpay-signature": createHmac("sha256", "account-webhook-secret")
          .update(body)
          .digest("hex"),
      },
    });
    assert.equal((await webhook(request)).status, 200);
  }
  return payment;
}
async function fulfil(
  orderId: string,
  status: "delivered" | "returned",
  at: Date,
) {
  await db.transaction(async (tx) => {
    const [order] = await tx
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, orderId))
      .for("update");
    await tx
      .update(orderTable)
      .set({ status, updatedAt: at })
      .where(eq(orderTable.id, orderId));
    await updateCircleFulfilment(tx, order, status, at);
  });
  if (status === "returned") await reverseOrderReferral(orderId);
}

test("account and atelier endpoints reject unauthenticated access and non-admin callers", async () => {
  setTestSession(null);
  for (const resource of [
    "profile",
    "addresses",
    "measurements",
    "wishlist",
    "stylist",
    "circle",
    "referrals",
    "appointments",
    "bespoke",
  ])
    assert.equal((await GET(post({}), context(resource))).status, 401);
  signIn(A);
  assert.equal((await adminAtelier()).status, 403);
  assert.equal((await updateAtelier(post({}))).status, 403);
});
test("profile dossier is validated and cannot change another account, email, or points", async () => {
  signIn(A);
  const response = await POST(
    post({
      name: "Updated Member",
      number: "9999999999",
      dateOfBirth: "1995-03-14",
      preferredTopSize: "S",
      preferredBottomSize: "M",
      preferredBlouseSize: "34",
      userId: B,
      email: "evil@example.com",
      loyaltyPoints: 999999,
    }),
    context("profile"),
  );
  assert.equal(response.status, 200);
  const profile = await getAccountProfile(A);
  assert.equal(profile.name, "Updated Member");
  assert.equal(profile.email, "a@example.com");
  assert.equal(profile.preferredTopSize, "S");
  assert.equal(
    (await sql`select loyalty_points from users where id=${A}`)[0]
      .loyalty_points,
    0,
  );
  assert.equal(
    (
      await POST(
        post({ name: "Invalid", dateOfBirth: "2999-01-01" }),
        context("profile"),
      )
    ).status,
    400,
  );
});
test("address book serializes defaults, rejects foreign IDs, and supplies the saved delivery address", async () => {
  signIn(A);
  let response = await POST(post(baseAddress), context("addresses"));
  assert.equal(response.status, 200);
  const first = (await response.json()).data;
  const results = await Promise.all([
    POST(
      post({ ...baseAddress, label: "Office", line1: "Office lane" }),
      context("addresses"),
    ),
    POST(
      post({ ...baseAddress, label: "Studio", line1: "Studio lane" }),
      context("addresses"),
    ),
  ]);
  assert.ok(results.every((response) => response.status === 200));
  const addresses = await getAddresses(A);
  assert.equal(addresses.filter((row) => row.isDefault).length, 1);
  const selected = addresses.find((row) => row.isDefault)!;
  assert.equal(
    (await sql`select address_line_1 from users where id=${A}`)[0]
      .address_line_1,
    selected.line1,
  );
  signIn(B);
  assert.equal(
    (await DELETE(post({ id: first.id }), context("addresses"))).status,
    404,
  );
  assert.equal(
    (await POST(post({ ...baseAddress, id: first.id }), context("addresses")))
      .status,
    404,
  );
  signIn(A);
  assert.equal(
    (await DELETE(post({ id: selected.id }), context("addresses"))).status,
    200,
  );
  assert.equal(
    (await getAddresses(A)).filter((row) => row.isDefault).length,
    1,
  );
});
test("measurements persist per account with explicit units and reject foreign edits", async () => {
  signIn(A);
  const response = await POST(
    post({
      label: "Studio set",
      unit: "cm",
      bust: 91.44,
      waist: 76.2,
      hips: 99.06,
    }),
    context("measurements"),
  );
  assert.equal(response.status, 200);
  const saved = (await response.json()).data;
  assert.equal((await getMeasurements(A))[0].bust, 91.44);
  signIn(B);
  assert.equal((await getMeasurements(B)).length, 0);
  assert.equal(
    (await POST(post({ ...saved, waist: 10 }), context("measurements"))).status,
    404,
  );
  signIn(A);
  assert.equal(
    (
      await POST(
        post({ label: "Bad", unit: "cm", bust: -1 }),
        context("measurements"),
      )
    ).status,
    400,
  );
  assert.equal(
    (await DELETE(post({ id: saved.id }), context("measurements"))).status,
    200,
  );
});
test("wishlist is variant-aware, private, and safely merges repeated updates", async () => {
  signIn(A);
  assert.equal(
    (
      await POST(
        post({ add: [VARIANT, randomUUID()], userId: B }),
        context("wishlist"),
      )
    ).status,
    200,
  );
  assert.equal((await getWishlist(A)).ids.length, 1);
  assert.equal((await getWishlist(B)).ids.length, 0);
  await POST(post({ add: [VARIANT] }), context("wishlist"));
  assert.equal((await getWishlist(A)).products[0].variantId, VARIANT);
  signIn(B);
  await POST(post({ remove: [VARIANT] }), context("wishlist"));
  assert.equal((await getWishlist(A)).ids.length, 1);
});
test("stylist edit uses the catalogue and caches its six-piece selection in the database", async () => {
  signIn(A);
  const one = await GET(post({}), context("stylist"));
  assert.equal(one.status, 200);
  const first = (await one.json()).data;
  assert.equal(first.products.length, 1);
  assert.equal(first.products[0].variantId, VARIANT);
  const second = await POST(post({}), context("stylist"));
  assert.equal((await second.json()).data.generatedAt, first.generatedAt);
});
test("appointment booking prevents overlapping slots and protects ownership even when contact emails differ", async () => {
  signIn(A);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const request = {
    appointmentType: "bespoke_consultation",
    date: tomorrow,
    time: "10:00",
    name: "Member A",
    email: "b@example.com",
    phone: "9999999999",
    notes: "A private session",
  };
  const results = await Promise.allSettled([
    bookAppointment(A, request),
    bookAppointment(B, { ...request, name: "Other" }),
  ]);
  assert.equal(results.filter((row) => row.status === "fulfilled").length, 1);
  const winner = results.find(
    (row) => row.status === "fulfilled",
  ) as PromiseFulfilledResult<Awaited<ReturnType<typeof bookAppointment>>>;
  const booking = winner.value.data;
  assert.equal((await getAppointments(booking.userId === A ? B : A)).length, 0);
  await assert.rejects(
    () => bookAppointment(B, { ...request, time: "11:00" }),
    /overlaps/,
  );
  signIn(booking.userId);
  assert.equal(
    (await DELETE(post({ id: booking.id }), context("appointments"))).status,
    200,
  );
  const booked = await bookedAppointmentTimes();
  assert.ok(!booked[tomorrow]?.includes("10:00"));
});
test("bespoke submissions are persisted with an owner and admin-controlled production timeline", async () => {
  signIn(A);
  const response = await bespoke(
    post({
      garmentType: "Saree",
      fullName: "Member A",
      email: "a@example.com",
      phone: "9999999999",
      inspirationNotes:
        "A hand embroidered silk saree for a special celebration.",
    }),
  );
  assert.equal(response.status, 200);
  const { referenceId } = await response.json();
  assert.equal((await getBespokeRequests(B)).length, 0);
  const request = (await getBespokeRequests(A))[0];
  assert.equal(request.milestones[0].milestone, "received");
  signIn(B);
  assert.equal(
    (await updateAtelier(post({ kind: "bespoke", id: referenceId }))).status,
    403,
  );
  signIn(ADMIN);
  const result = await updateAtelier(
    post({
      kind: "bespoke",
      id: referenceId,
      status: "in_progress",
      milestone: "fabric_sourced",
      note: "Your silk has arrived.",
      imageUrl: "",
      estimatedDeliveryDate: "",
      expectedUpdatedAt: request.updatedAt.toISOString(),
    }),
  );
  assert.equal(result.status, 200);
  const current = (await getBespokeRequests(A))[0];
  assert.equal(current.currentMilestone, "fabric_sourced");
  assert.equal(current.milestones.length, 2);
});
test("Vite reward boundaries, point value, redemption steps, and calendar expiry are exact", () => {
  assert.equal(tierFromSpend(49999).key, "muse");
  assert.equal(tierFromSpend(50000).key, "eclat");
  assert.equal(tierFromSpend(100000).key, "eclat");
  assert.equal(tierFromSpend(100001).key, "lumiere");
  assert.equal(tierFromSpend(200000).key, "lumiere");
  assert.equal(tierFromSpend(200001).key, "royale");
  assert.deepEqual(
    ["muse", "eclat", "lumiere", "royale"].map((tier) =>
      circleRewardPoints(100, tier as any),
    ),
    [100, 125, 150, 200],
  );
  assert.equal(circleMaximumPoints(499, 100000), 0);
  assert.equal(circleMaximumPoints(1000, 100000), 2000);
  assert.equal(circleMaximumPoints(10000, 1099), 1000);
  assert.equal(
    addCircleMonths(new Date("2024-02-29T12:00:00Z"), 24).toISOString(),
    "2026-02-28T12:00:00.000Z",
  );
});
let firstOrder: string;
let lumiereOrder: string;
const deliveryTime = new Date(Date.now() - 6 * 86400000);
test("captured payment creates pending points; five days after delivery they mature exactly once", async () => {
  const payment = await purchase(A, 50000);
  firstOrder = payment.internalOrderId;
  assert.equal(payment.circle.tierKey, "muse");
  assert.equal(payment.circle.normalPoints, 50000);
  assert.equal((await getCircleSummary(A)).availablePoints, 0);
  await fulfil(firstOrder, "delivered", deliveryTime);
  const before = await getCircleSummary(
    A,
    new Date(deliveryTime.getTime() + 5 * 86400000 - 1),
  );
  assert.equal(before.availablePoints, 0);
  assert.equal(before.pendingPoints, 50000);
  const mature = await Promise.all([
    getCircleSummary(A),
    getCircleSummary(A),
    getCircleSummary(A),
  ]);
  assert.ok(mature.every((value) => value.availablePoints === 50000));
  assert.equal(mature[0].current.key, "eclat");
  assert.equal(mature[0].qualifyingSpend, 50000);
  assert.equal(
    (
      await sql`select count(*)::int n from loyalty_transaction where reference_key=${`circle:order:${firstOrder}:reward`}`
    )[0].n,
    1,
  );
});
test("order tier is stamped at checkout; cumulative Lumiere and Royale milestones award their own bonuses", async () => {
  const eclat = await purchase(A, 50001);
  assert.equal(eclat.circle.tierKey, "eclat");
  assert.equal(eclat.circle.normalPoints, 62501);
  await fulfil(eclat.internalOrderId, "delivered", deliveryTime);
  assert.equal((await getCircleSummary(A)).current.key, "lumiere");
  const first = await purchase(A, 25000);
  lumiereOrder = first.internalOrderId;
  assert.equal(first.circle.normalPoints, 37500);
  await fulfil(first.internalOrderId, "delivered", deliveryTime);
  assert.equal((await getCircleSummary(A)).lumiereMilestoneSpend, 25000);
  const second = await purchase(A, 25000);
  await fulfil(second.internalOrderId, "delivered", deliveryTime);
  let circle = await getCircleSummary(A);
  assert.equal(circle.lumiereMilestoneSpend, 50000);
  assert.equal(circle.availablePoints, 50000 + 62501 + 37500 * 2 + 12500);
  const third = await purchase(A, 50000);
  assert.equal(third.circle.tierKey, "lumiere");
  await fulfil(third.internalOrderId, "delivered", deliveryTime);
  circle = await getCircleSummary(A);
  assert.equal(circle.current.key, "royale");
  assert.equal(circle.lumiereMilestoneSpend, 100000);
  const royale = await purchase(A, 50000);
  assert.equal(royale.circle.normalPoints, 100000);
  await fulfil(royale.internalOrderId, "delivered", deliveryTime);
  circle = await getCircleSummary(A);
  assert.equal(circle.royaleMilestoneSpend, 50000);
  assert.equal(circle.availablePoints, 412501);
});
test("returns reverse normal points and lost milestones once without issuing a cash refund", async () => {
  const before = await getCircleSummary(A);
  await fulfil(lumiereOrder, "returned", new Date());
  const after = await getCircleSummary(A);
  assert.equal(before.availablePoints - after.availablePoints, 37500 + 12500);
  assert.equal(after.lumiereMilestoneSpend, 75000);
  assert.equal(
    (await getCircleSummary(A)).availablePoints,
    after.availablePoints,
  );
});
test("redemption enforces full-price eligibility, minimum 1000, steps of 100 and a 20% cap", async () => {
  signIn(A);
  await sql`update products set pricing_config='[{"size":"s","basePrice":1000,"strikethroughPrice":2000,"isVisible":true}]'::jsonb where id=${PRODUCT}`;
  const body = {
    name: "A",
    email: "a@example.com",
    addressLine1: "Test",
    city: "Jaipur",
    state: "Rajasthan",
    productDetails: [
      {
        id: PRODUCT,
        variantId: VARIANT,
        quantity: 1,
        size: "s",
        isFullPrice: true,
      },
    ],
    loyaltyPointsToRedeem: 1000,
  };
  assert.equal((await checkout(post(body))).status, 400);
  await sql`update products set pricing_config='[{"size":"s","basePrice":1000,"isVisible":true}]'::jsonb where id=${PRODUCT}`;
  for (const points of [100, 1010, 2100])
    assert.equal(
      (await checkout(post({ ...body, loyaltyPointsToRedeem: points }))).status,
      400,
    );
});
test("transfers preserve expiry, are idempotent and cannot consume checkout reservations", async () => {
  const expiry = new Date(Date.now() + 86400000);
  await db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, B))
      .for("update");
    await refreshCircleAccount(tx, user);
    await creditCirclePoints(
      tx,
      B,
      10000,
      "test",
      "test:expiring",
      expiry,
      "Expiring test points",
    );
  });
  const id = randomUUID();
  const transfer = await transferCirclePoints(B, {
    id,
    email: "future@example.com",
    points: 1000,
  });
  assert.equal(transfer.status, "pending");
  assert.equal((await getCircleSummary(B)).availablePoints, 9000);
  assert.equal(
    (
      await transferCirclePoints(B, {
        id,
        email: "future@example.com",
        points: 1000,
      })
    ).id,
    id,
  );
  assert.equal((await getCircleSummary(B)).availablePoints, 9000);
  const FUTURE = randomUUID();
  await sql`insert into users(id,name,email) values(${FUTURE},'Future member','future@example.com')`;
  const received = await getCircleSummary(FUTURE);
  assert.equal(received.availablePoints, 1000);
  assert.equal(received.nextExpiry?.getTime(), expiry.getTime());
  signIn(B);
  const pending = await purchase(B, 10000, { loyaltyPointsToRedeem: 1000 }); // Captures immediately; uses allocated points once.
  assert.equal(pending.amount, 990000);
  assert.equal((await getCircleSummary(B)).availablePoints, 8000);
  await assert.rejects(
    () =>
      transferCirclePoints(B, {
        id: randomUUID(),
        email: "a@example.com",
        points: 9000,
      }),
    /Insufficient/,
  );
  const expired = await getCircleSummary(B, new Date(expiry.getTime() + 1));
  assert.equal(expired.availablePoints, 0);
});
test("referrals are new-member-only, grant 20000 points each once and reverse after a return", async () => {
  const REFERRER = randomUUID();
  await sql`insert into users(id,name,email) values(${REFERRER},'Referrer','referrer@example.com')`;
  const referral = await getReferral(REFERRER);
  const cookie = referralCookie(referral.code);
  assert.ok(readReferralCookie(cookie));
  assert.equal(
    readReferralCookie(
      cookie.slice(0, -1) + (cookie.endsWith("0") ? "1" : "0"),
    ),
    null,
  );
  const INVITED = randomUUID();
  await sql`insert into users(id,name,email) values(${INVITED},'New member','invited@example.com')`;
  assert.equal(await captureReferralForMember(INVITED, cookie), true);
  await sql`update users set created_at=now()-interval '2 days' where id=${B}`;
  assert.equal(await captureReferralForMember(B, cookie), false);
  const paid = await purchase(INVITED, 1000);
  assert.equal((await getCircleSummary(REFERRER)).availablePoints, 20000);
  assert.equal((await getCircleSummary(INVITED)).availablePoints, 20000);
  assert.equal((await getReferral(REFERRER)).creditEarned, 2000);
  await fulfil(paid.internalOrderId, "returned", new Date());
  assert.equal((await getCircleSummary(REFERRER)).availablePoints, 0);
  assert.equal((await getCircleSummary(INVITED)).availablePoints, 0);
  assert.equal((await getReferral(REFERRER)).creditEarned, 0);
});
test("reserved points survive their expiry until the saved Razorpay payment settles", async () => {
  const userId = randomUUID();
  await sql`insert into users(id,name,email) values(${userId},'Reserved member','reserved@example.com')`;
  const expiry = new Date(Date.now() + 86400000);
  await db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, userId))
      .for("update");
    await refreshCircleAccount(tx, user);
    await creditCirclePoints(
      tx,
      userId,
      10000,
      "test",
      "test:reserved-expiry",
      expiry,
      "Reserved expiry credit",
    );
  });
  signIn(userId);
  await sql`update products set pricing_config='[{"size":"s","basePrice":10000,"isVisible":true}]'::jsonb where id=${PRODUCT}`;
  const response = await checkout(
    post({
      name: "Member",
      email: "reserved@example.com",
      addressLine1: "Test",
      city: "Jaipur",
      state: "Rajasthan",
      productDetails: [
        { id: PRODUCT, variantId: VARIANT, size: "s", quantity: 1 },
      ],
      loyaltyPointsToRedeem: 1000,
    }),
  );
  assert.equal(response.status, 200);
  const payment = await response.json();
  let summary = await getCircleSummary(userId, new Date(expiry.getTime() + 1));
  assert.equal(summary.availablePoints, 0);
  assert.equal(summary.reservedPoints, 1000);
  assert.equal(
    (await sql`select loyalty_points from users where id=${userId}`)[0]
      .loyalty_points,
    1000,
  );
  const body = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_reserved_expiry",
          order_id: payment.orderId,
          amount: payment.amount,
          currency: "INR",
          status: "captured",
        },
      },
    },
  });
  assert.equal(
    (
      await webhook(
        new Request("http://localhost/api", {
          method: "POST",
          body,
          headers: {
            "x-razorpay-signature": createHmac(
              "sha256",
              "account-webhook-secret",
            )
              .update(body)
              .digest("hex"),
          },
        }),
      )
    ).status,
    200,
  );
  summary = await getCircleSummary(userId);
  assert.equal(summary.availablePoints, 0);
  assert.equal(summary.reservedPoints, 0);
});
test("concurrent checkouts cannot reserve the same Circle Points twice", async () => {
  const userId = randomUUID();
  await sql`insert into users(id,name,email,loyalty_points) values(${userId},'Concurrent member','concurrent@example.com',10000)`;
  signIn(userId);
  await sql`update products set pricing_config='[{"size":"s","basePrice":50000,"isVisible":true}]'::jsonb where id=${PRODUCT}`;
  const body = {
    name: "Member",
    email: "concurrent@example.com",
    addressLine1: "Test",
    city: "Jaipur",
    state: "Rajasthan",
    productDetails: [
      { id: PRODUCT, variantId: VARIANT, size: "s", quantity: 1 },
    ],
    loyaltyPointsToRedeem: 6000,
  };
  const results = await Promise.all([
    checkout(post(body)),
    checkout(post(body)),
  ]);
  assert.deepEqual(
    results.map((response) => response.status).sort(),
    [200, 409],
  );
  const summary = await getCircleSummary(userId);
  assert.equal(summary.reservedPoints, 6000);
  assert.equal(summary.availablePoints, 4000);
});
test("an earlier programme checkout settles without desynchronizing adopted point lots", async () => {
  const userId = randomUUID();
  const orderId = randomUUID();
  await sql`insert into users(id,name,email,loyalty_points) values(${userId},'Legacy member','pending-legacy@example.com',2000)`;
  const snapshot = {
    orderId,
    user: { email: "pending-legacy@example.com" },
    address: {},
    items: [],
    subtotalAmount: 1100,
    deliveryCharge: 0,
    discountAmount: 100,
    totalAmountPaid: 1000,
    loyaltyPointsRedeemed: 1000,
  };
  await sql`insert into "order"(id,user_id,status,payment_status,subtotal_amount,discount_amount,loyalty_points_redeemed,loyalty_points_status,expected_amount_paise,razorpay_order_id,checkout_snapshot) values(${orderId},${userId},'pending_payment','pending',1100,100,1000,'reserved',100000,'order_pending_legacy',${JSON.stringify(snapshot)}::jsonb)`;
  assert.equal((await getCircleSummary(userId)).availablePoints, 1000);
  const body = JSON.stringify({
    event: "payment.captured",
    payload: {
      payment: {
        entity: {
          id: "pay_pending_legacy",
          order_id: "order_pending_legacy",
          amount: 100000,
          currency: "INR",
          status: "captured",
        },
      },
    },
  });
  assert.equal(
    (
      await webhook(
        new Request("http://localhost/api", {
          method: "POST",
          body,
          headers: {
            "x-razorpay-signature": createHmac(
              "sha256",
              "account-webhook-secret",
            )
              .update(body)
              .digest("hex"),
          },
        }),
      )
    ).status,
    200,
  );
  assert.equal((await getCircleSummary(userId)).availablePoints, 1100);
  assert.equal(
    (
      await sql`select sum(remaining_points)::int n from circle_point_lots where user_id=${userId}`
    )[0].n,
    1100,
  );
});
test("24-month expiry removes free points and old qualifying spend without extending legacy balances", async () => {
  const expired = await getCircleSummary(A, addCircleMonths(new Date(), 25));
  assert.equal(expired.availablePoints, 0);
  assert.equal(expired.qualifyingSpend, 0);
  assert.equal(expired.current.key, "muse");
  const LEGACY = randomUUID();
  await sql`insert into users(id,email,loyalty_points) values(${LEGACY},'legacy@example.com',1500)`;
  assert.equal(
    (await getCircleSummary(LEGACY, addCircleMonths(new Date(), 25)))
      .availablePoints,
    1500,
  );
});
test("back-in-stock delivery uses the account email and cannot notify the same subscription twice", async () => {
  await sql`insert into account_stock_alerts(user_id,product_id,size) values(${B},${PRODUCT},'s')`;
  const previous = stockDeliveries.length;
  await sendBackInStockNotifications(PRODUCT);
  await sendBackInStockNotifications(PRODUCT);
  assert.equal(stockDeliveries.length, previous + 1);
  assert.equal(stockDeliveries.at(-1)?.email, "b@example.com");
});

test("returning an expired unused award creates no debt or duplicate reversal", async () => {
  const future = addCircleMonths(new Date(), 25);
  await fulfil(firstOrder, "returned", future);
  const summary = await getCircleSummary(A, future);
  assert.equal(summary.adjustmentPoints, 0);
  assert.equal(summary.availablePoints, 0);
  await fulfil(firstOrder, "returned", future);
  assert.equal((await getCircleSummary(A, future)).adjustmentPoints, 0);
  const [milestoneOrder] =
    await sql`select order_id from circle_order_rewards where user_id=${A} and tier_key='lumiere' and eligible_amount=50000 and status='available'`;
  assert.ok(milestoneOrder);
  await fulfil(milestoneOrder.order_id, "returned", future);
  const afterBonusReversal = await getCircleSummary(A, future);
  assert.equal(afterBonusReversal.adjustmentPoints, 0);
  assert.equal(afterBonusReversal.availablePoints, 0);
  assert.equal(afterBonusReversal.lumiereMilestoneSpend, 25000);
});
test("reversing transferred awards recovers spent value from future earnings", async () => {
  const sender = randomUUID();
  const recipient = randomUUID();
  await sql`insert into users(id,email) values(${sender},'debt-sender@example.com'),(${recipient},'debt-recipient@example.com')`;
  await db.transaction(async (tx) => {
    const [user] = await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, sender))
      .for("update");
    await refreshCircleAccount(tx, user);
    await creditCirclePoints(
      tx,
      sender,
      20000,
      "referral",
      "test:spent-award",
      addCircleMonths(new Date(), 24),
      "Referral credit",
    );
  });
  await transferCirclePoints(sender, {
    id: randomUUID(),
    email: "debt-recipient@example.com",
    points: 20000,
  });
  await db.transaction(async (tx) => {
    await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, sender))
      .for("update");
    await reverseCircleAward(
      tx,
      sender,
      20000,
      "test:spent-reversal",
      "Returned referral order",
      { sourceKey: "test:spent-award" },
    );
  });
  assert.equal((await getCircleSummary(sender)).adjustmentPoints, 20000);
  assert.equal((await getCircleSummary(recipient)).availablePoints, 20000);
  await db.transaction(async (tx) => {
    await tx
      .select()
      .from(userTable)
      .where(eq(userTable.id, sender))
      .for("update");
    await creditCirclePoints(
      tx,
      sender,
      25000,
      "test",
      "test:debt-recovery",
      null,
      "Future earnings",
    );
  });
  const summary = await getCircleSummary(sender);
  assert.equal(summary.adjustmentPoints, 0);
  assert.equal(summary.availablePoints, 5000);
});
test("gift-funded merchandise earns only on the remaining cash-funded eligible value", async () => {
  const userId = randomUUID();
  await sql`insert into users(id,email) values(${userId},'gift-circle@example.com')`;
  const code = "HOP-012345-6789AB-CDEF01-234567";
  await db.insert(giftCard).values({
    purchaserId: userId,
    claimedById: userId,
    purchaserEmail: "gift-circle@example.com",
    senderName: "Member",
    recipientName: "Member",
    requestHash: "test-gift-circle",
    initialAmountPaise: 1000000,
    balancePaise: 1000000,
    expectedAmountPaise: 1000000,
    paymentStatus: "paid",
    codeHash: hashGiftCardCode(code),
    encryptedCode: encryptGiftCardCode(code),
    codeSuffix: "4567",
  });
  const fully = await purchase(userId, 1000, {
    giftCardCode: code,
    requestId: randomUUID(),
  });
  assert.equal(fully.amount, 0);
  assert.equal(fully.confirmed, true);
  assert.equal(fully.circle.normalPoints, 0);
  await fulfil(fully.internalOrderId, "delivered", deliveryTime);
  assert.equal((await getCircleSummary(userId)).availablePoints, 0);
  assert.equal((await getCircleSummary(userId)).qualifyingSpend, 0);
  const partial = await purchase(userId, 10000, {
    giftCardCode: code,
    requestId: randomUUID(),
    giftWrap: true,
  });
  assert.equal(partial.circle.netEligibleAmount, 1000);
  assert.equal(partial.circle.normalPoints, 1000);
  assert.equal(partial.amount, 150000);
  await fulfil(partial.internalOrderId, "delivered", deliveryTime);
  assert.equal((await getCircleSummary(userId)).availablePoints, 1000);
});
