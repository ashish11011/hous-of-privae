import { before, after, test } from "node:test";
import assert from "node:assert/strict";
import postgres from "postgres";
import React, { act } from "react";
import { createAccountTestSchema } from "./fixtures/account-test-schema";
import ProfileDashboard from "../src/app/(user)/profile/ProfileDashboard";
import ProfilePage from "../src/app/(user)/profile/page";
import AtelierAdmin from "../src/app/admin/atelier/page";
import { CurrencyProvider } from "../contextCurrencyContext";
import {
  GET,
  POST,
  PUT,
  DELETE,
} from "../src/app/api/account/[resource]/route";
import {
  GET as adminGet,
  POST as adminPost,
} from "../src/app/api/admin/atelier/route";
import { POST as bespoke } from "../src/app/api/bespoke/route";
import { GET as giftGet } from "../src/app/api/gift-cards/route";
import { GET as profileGet } from "../src/app/api/profile/route";
import { useAccount } from "../components/account/shared";
import AccountSync from "../components/account/AccountSync";
import { userWishlistStore } from "../src/hepler/store/zustand";
import { POST as giftClaim } from "../src/app/api/gift-cards/claim/route";
import { POST as appointmentPost } from "../src/app/api/appointment/route";
import {
  hashGiftCardCode,
  encryptGiftCardCode,
} from "../lib/gift-cards/crypto";
import { setTestSession } from "./fixtures/payment-services";
const sql = postgres(process.env.DATABASE_URL);
const USER = "00000000-0000-4000-8000-000000000301";
const ADMIN = "00000000-0000-4000-8000-000000000302";
const requests = [];
let staleAtelierSnapshot,
  staleAdminReads = false,
  holdNextAdminRead = false,
  releaseAdminRead;
let failAddressReload = false,
  substituteAddressWrite = false,
  substituteAdminWrite = false;
let holdAddressRead = false,
  heldAddressRead,
  releaseAddressRead;
let holdWishlistWrite = false,
  releaseWishlistWrite,
  wishlistWriteStarted = false;
let root, createRoot, dom;
const user = {
  name: "Dashboard Member",
  email: "dashboard@example.com",
  number: null,
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  pincode: null,
  loyaltyPoints: 10000,
};
function member(id = USER) {
  setTestSession({
    id,
    email: id === ADMIN ? "bishnoi11011@gmail.com" : user.email,
  });
  globalThis.dashboardSession = {
    status: "authenticated",
    data: { id, email: user.email },
  };
}
async function waitFor(check, label) {
  for (let i = 0; i < 100; i++) {
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    if (check()) return;
  }
  throw new Error(
    `Timed out: ${label}. Toasts: ${JSON.stringify(globalThis.dashboardToasts)}. DOM: ${document.body.textContent.slice(-1200)}`,
  );
}
function button(label) {
  const value = [...document.querySelectorAll("button")].find(
    (row) =>
      row.textContent.trim() === label ||
      (row.getAttribute("role") === "tab" &&
        row.textContent.trim().startsWith(label)) ||
      row.getAttribute("aria-label") === label,
  );
  assert.ok(value, `Missing button ${label}`);
  return value;
}
async function click(label) {
  await act(async () => {
    button(label).click();
  });
}
async function input(selector, value) {
  const element = document.querySelector(selector);
  assert.ok(element, selector);
  const setter = Object.getOwnPropertyDescriptor(
    dom.window.HTMLInputElement.prototype,
    "value",
  ).set;
  await act(async () => {
    setter.call(element, value);
    element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  });
}
async function submit() {
  await act(async () => {
    document
      .querySelector("form")
      .dispatchEvent(
        new dom.window.Event("submit", { bubbles: true, cancelable: true }),
      );
  });
}
async function mount(component) {
  if (root) await act(async () => root.unmount());
  document.body.innerHTML = '<div id="root"></div>';
  root = createRoot(document.querySelector("#root"));
  await act(async () => root.render(component));
}
async function dashboard() {
  if (root) {
    await act(async () => root.unmount());
    root = null;
  }
  member();
  const start = requests.length;
  const page = await ProfilePage();
  await mount(<CurrencyProvider>{page}</CurrencyProvider>);
  await waitFor(
    () =>
      requests
        .slice(start)
        .some((row) => row.path === "/api/account/overview") &&
      requests.slice(start).some((row) => row.path === "/api/account/circle"),
    "dashboard",
  );
}
async function tab(label) {
  await click(label);
  await waitFor(
    () =>
      !document
        .querySelector('[role="tabpanel"]')
        ?.textContent.includes("Loading your account"),
    label,
  );
}
before(async () => {
  await createAccountTestSchema(sql);
  await sql`insert into users(id,name,email,loyalty_points) values(${USER},${user.name},${user.email},10000),(${ADMIN},'Admin','bishnoi11011@gmail.com',0)`;
  dom = globalThis.dashboardDom;
  globalThis.dashboardToasts = [];
  ({ createRoot } = require("react-dom/client"));
  globalThis.fetch = async (url, options = {}) => {
    const path = new URL(String(url), "http://dashboard.test").pathname.replace(
      /\/$/,
      "",
    );
    const method = options.method || "GET";
    const req = new Request(`http://dashboard.test${path}`, options);
    let response;
    if (
      path === "/api/account/addresses" &&
      method === "POST" &&
      substituteAddressWrite
    ) {
      substituteAddressWrite = false;
      return GET(req, { params: Promise.resolve({ resource: "addresses" }) });
    }
    if (
      path === "/api/admin/atelier" &&
      method === "POST" &&
      substituteAdminWrite
    ) {
      substituteAdminWrite = false;
      return adminGet();
    }
    if (
      path === "/api/account/addresses" &&
      method === "GET" &&
      failAddressReload
    ) {
      failAddressReload = false;
      return Response.json(
        { message: "Simulated refresh failure" },
        { status: 503 },
      );
    }
    if (
      path === "/api/account/addresses" &&
      method === "GET" &&
      holdAddressRead
    ) {
      holdAddressRead = false;
      heldAddressRead = await GET(req, {
        params: Promise.resolve({ resource: "addresses" }),
      });
      return new Promise((resolve) => {
        releaseAddressRead = () => resolve(heldAddressRead);
      });
    }
    if (
      path === "/api/account/wishlist" &&
      method === "POST" &&
      holdWishlistWrite
    ) {
      holdWishlistWrite = false;
      wishlistWriteStarted = true;
      await new Promise((resolve) => {
        releaseWishlistWrite = resolve;
      });
    }
    if (
      path === "/api/admin/atelier" &&
      method === "GET" &&
      holdNextAdminRead
    ) {
      holdNextAdminRead = false;
      return new Promise((resolve) => {
        releaseAdminRead = () => resolve(Response.json(staleAtelierSnapshot));
      });
    }
    if (path === "/api/admin/atelier" && method === "GET" && staleAdminReads) {
      return Response.json(staleAtelierSnapshot);
    }
    if (path.startsWith("/api/account/"))
      response = await { GET, POST, PUT, DELETE }[method](req, {
        params: Promise.resolve({ resource: path.split("/").at(-1) }),
      });
    else if (path === "/api/admin/atelier")
      response = await (method === "GET" ? adminGet() : adminPost(req));
    else if (path === "/api/gift-cards") response = await giftGet();
    else if (path === "/api/gift-cards/claim") response = await giftClaim(req);
    else if (path === "/api/appointment") response = await appointmentPost(req);
    else if (path === "/api/referrals")
      response = Response.json({ success: true });
    else if (path === "/api/profile") response = await profileGet();
    else throw new Error(`Unexpected test request: ${method} ${path}`);
    requests.push({
      path,
      method,
      status: response.status,
      body: options.body ? JSON.parse(options.body) : null,
      payload: await response.clone().json(),
    });
    return response;
  };
});
after(async () => {
  if (root) await act(async () => root.unmount());
  await sql.end();
  dom?.window.close();
});
test("profile address form persists a new address, survives reload and reaches checkout", async () => {
  await dashboard();
  await tab("Addresses");
  await click("Add Address");
  for (const [field, value] of Object.entries({
    label: "Home",
    recipientName: "Dashboard Member",
    phone: "9999999999",
    line1: "1 Saved Lane",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
  }))
    await input(`#address-${field}`, value);
  await submit();
  await waitFor(
    () =>
      document.body.textContent.includes("Address saved.") ||
      globalThis.dashboardToasts.length > 0,
    "address save",
  );
  assert.equal(
    requests
      .filter(
        (row) => row.path === "/api/account/addresses" && row.method === "POST",
      )
      .at(-1)?.status,
    200,
    JSON.stringify(requests.at(-1)),
  );
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  const [address] =
    await sql`select * from account_addresses where user_id=${USER}`;
  assert.equal(address.line1, "1 Saved Lane");
  await dashboard();
  await tab("Addresses");
  assert.ok(document.body.textContent.includes("1 Saved Lane"));
  const profile = await profileGet();
  assert.equal((await profile.json()).addresses[0].line1, "1 Saved Lane");
});
test("admin production form persists status, milestone and customer timeline", async () => {
  member();
  const response = await bespoke(
    new Request("http://dashboard.test/api/bespoke", {
      method: "POST",
      body: JSON.stringify({
        garmentType: "Saree",
        fullName: user.name,
        email: user.email,
        inspirationNotes: "A silk saree for a special celebration.",
      }),
    }),
  );
  assert.equal(response.status, 200);
  const { referenceId } = await response.json();
  member(ADMIN);
  await mount(<AtelierAdmin />);
  await waitFor(
    () => document.body.textContent.includes("Update production timeline"),
    "atelier load",
  );
  await click("Update production timeline");
  await act(async () => {
    const status = document.querySelector('[name="status"]');
    status.value = "in_progress";
    status.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    const stage = document.querySelector('[name="milestone"]');
    stage.value = "fabric_sourced";
    stage.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    document.querySelector('[name="note"]').value = "Your silk has arrived.";
  });
  await submit();
  await waitFor(
    () =>
      requests.some(
        (row) => row.path === "/api/admin/atelier" && row.method === "POST",
      ),
    "atelier save",
  );
  const saved = requests
    .filter((row) => row.path === "/api/admin/atelier" && row.method === "POST")
    .at(-1);
  assert.equal(saved.status, 200, JSON.stringify(saved));
  const [record] =
    await sql`select status,current_milestone from bespoke_requests where id=${referenceId}`;
  assert.equal(record.status, "in_progress");
  assert.equal(record.current_milestone, "fabric_sourced");
  await dashboard();
  await tab("Bespoke");
  assert.ok(document.body.textContent.includes("Fabric Sourced"));
  assert.ok(document.body.textContent.includes("Your silk has arrived."));
});
test("every dashboard tab loads through authenticated API handlers", async () => {
  await dashboard();
  for (const label of [
    "For You",
    "Orders",
    "Privae Circle",
    "Refer a Friend",
    "Gift Cards",
    "Wishlist",
    "Addresses",
    "Appointments",
    "Bespoke",
    "Measurements",
    "Profile",
    "Overview",
  ]) {
    await tab(label);
    assert.ok(document.querySelector('[role="tabpanel"]'));
  }
  assert.deepEqual(
    requests.filter((row) => row.method === "GET" && row.status !== 200),
    [],
  );
});

test("address edits and deletion persist, and failed refreshes never show success or duplicate a retry", async () => {
  await dashboard();
  await tab("Addresses");
  await click("Edit Home");
  await input("#address-line1", "2 Updated Lane");
  const oldSuccess = globalThis.dashboardToasts.filter(
    (row) => row.type === "success",
  ).length;
  failAddressReload = true;
  await submit();
  await waitFor(
    () => document.body.textContent.includes("Simulated refresh failure"),
    "failed refresh",
  );
  assert.equal(
    globalThis.dashboardToasts.filter((row) => row.type === "success").length,
    oldSuccess,
  );
  assert.equal(
    (await sql`select line1 from account_addresses where user_id=${USER}`)[0]
      .line1,
    "2 Updated Lane",
  );
  await click("Try again");
  await waitFor(() => !!document.querySelector("form"), "address retry");
  await submit();
  await waitFor(
    () => !document.querySelector("#address-line1"),
    "retried save",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from account_addresses where user_id=${USER}`
    )[0].n,
    1,
  );
  await click("Delete Home");
  await waitFor(
    () => document.body.textContent.includes("No addresses saved yet."),
    "delete",
  );
  await dashboard();
  await tab("Addresses");
  assert.ok(document.body.textContent.includes("No addresses saved yet."));
});
test("a read response substituted for an address or bespoke write is never reported as saved", async () => {
  await dashboard();
  await tab("Addresses");
  await click("Add Address");
  for (const [field, value] of Object.entries({
    recipientName: "QA Member",
    phone: "9999999999",
    line1: "Must not save",
    city: "Jaipur",
    state: "Rajasthan",
    pincode: "302001",
  }))
    await input(`#address-${field}`, value);
  const count = globalThis.dashboardToasts.filter(
    (row) => row.type === "success",
  ).length;
  substituteAddressWrite = true;
  await submit();
  await waitFor(
    () => document.body.textContent.includes("not confirmed"),
    "rejected false address response",
  );
  assert.equal(
    globalThis.dashboardToasts.filter((row) => row.type === "success").length,
    count,
  );
  assert.equal(
    (
      await sql`select count(*)::int n from account_addresses where user_id=${USER}`
    )[0].n,
    0,
  );
  member(ADMIN);
  await mount(<AtelierAdmin />);
  await waitFor(
    () => document.body.textContent.includes("Update production timeline"),
    "atelier",
  );
  await click("Update production timeline");
  substituteAdminWrite = true;
  await submit();
  await waitFor(
    () => document.body.textContent.includes("not confirmed"),
    "rejected false bespoke response",
  );
  assert.equal(
    globalThis.dashboardToasts.filter((row) => row.type === "success").length,
    count,
  );
});
test("a late initial response cannot replace the latest account data", async () => {
  member();
  let state;
  function Probe() {
    state = useAccount("addresses");
    return <div>{JSON.stringify(state.data)}</div>;
  }
  holdAddressRead = true;
  await mount(<Probe />);
  await waitFor(() => !!releaseAddressRead, "held initial read");
  await POST(
    new Request("http://dashboard.test/api", {
      method: "POST",
      body: JSON.stringify({
        recipientName: "QA Member",
        phone: "9999999999",
        line1: "Latest address",
        city: "Jaipur",
        state: "Rajasthan",
        pincode: "302001",
      }),
    }),
    { params: Promise.resolve({ resource: "addresses" }) },
  );
  await act(async () => {
    await state.reload();
  });
  assert.ok(document.body.textContent.includes("Latest address"));
  await act(async () => {
    releaseAddressRead();
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
  assert.ok(document.body.textContent.includes("Latest address"));
});
test("measurement and profile forms retain their values after saving and a fresh dashboard mount", async () => {
  await dashboard();
  await tab("Measurements");
  await click("Add Measurement Set");
  await input("#measurement-label", "Studio measurements");
  await input("#measurement-bust", "36");
  await input("#measurement-waist", "30");
  await submit();
  await waitFor(
    () => !document.querySelector("#measurement-bust"),
    "measurements saved",
  );
  await dashboard();
  await tab("Measurements");
  assert.ok(document.body.textContent.includes("Studio measurements"));
  assert.equal(
    Number(
      (
        await sql`select bust from account_measurements where user_id=${USER}`
      )[0].bust,
    ),
    36,
  );
  await tab("Profile");
  await input("#dossier-name", "Updated Dashboard Member");
  await input("#dossier-dateOfBirth", "1995-03-14");
  await input("#dossier-preferredTopSize", "M");
  await submit();
  await waitFor(
    () => globalThis.dashboardToasts.at(-1)?.value === "Profile updated.",
    "profile saved",
  );
  await dashboard();
  await tab("Profile");
  assert.equal(
    document.querySelector("#dossier-name").value,
    "Updated Dashboard Member",
  );
  assert.equal(
    document.querySelector("#dossier-dateOfBirth").value,
    "1995-03-14",
  );
  assert.equal(document.querySelector("#dossier-preferredTopSize").value, "M");
});
test("circle transfers and referral codes persist after tab changes and reload", async () => {
  await dashboard();
  await tab("Privae Circle");
  await input("#circle-recipient", "ui-recipient@example.com");
  await input("#circle-transfer-points", "1000");
  await submit();
  await waitFor(
    () => document.body.textContent.includes("ui-recipient@example.com"),
    "transfer",
  );
  assert.equal(
    (await sql`select points from circle_transfers where sender_id=${USER}`)[0]
      .points,
    1000,
  );
  await dashboard();
  await tab("Privae Circle");
  assert.ok(document.body.textContent.includes("ui-recipient@example.com"));
  await tab("Refer a Friend");
  const [first] =
    await sql`select code from account_referrals where user_id=${USER}`;
  assert.ok(document.body.textContent.includes(first.code));
  await dashboard();
  await tab("Refer a Friend");
  assert.ok(document.body.textContent.includes(first.code));
});
test("gift card claim survives reload and belongs to the signed-in account", async () => {
  const code = "HOP-123456-ABCDEF-123456-ABCDEF";
  await sql`insert into gift_cards(purchaser_id,purchaser_email,sender_name,recipient_name,request_hash,initial_amount_paise,balance_paise,expected_amount_paise,payment_status,code_hash,encrypted_code,code_suffix) values(${ADMIN},'bishnoi11011@gmail.com','QA Sender','QA Receiver','dom-claim',100000,100000,100000,'paid',${hashGiftCardCode(code)},${encryptGiftCardCode(code)},'CDEF')`;
  await dashboard();
  await tab("Gift Cards");
  await input("#claim-gift-code", code);
  await submit();
  await waitFor(
    () =>
      globalThis.dashboardToasts.at(-1)?.value ===
      "Gift card added to your account.",
    "gift claim",
  );
  assert.equal(
    (
      await sql`select claimed_by_id from gift_cards where request_hash='dom-claim'`
    )[0].claimed_by_id,
    USER,
  );
  await dashboard();
  await tab("Gift Cards");
  await waitFor(
    () => document.body.textContent.includes("QA Sender"),
    "persisted claimed card",
  );
});
test("appointment admin confirmation and customer cancellation persist across reloads", async () => {
  member();
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const response = await appointmentPost(
    new Request("http://dashboard.test/api/appointment/", {
      method: "POST",
      body: JSON.stringify({
        appointmentType: "studio_visit",
        date,
        time: "10:00",
        name: user.name,
        email: user.email,
        phone: "9999999999",
      }),
    }),
  );
  assert.equal(response.status, 200);
  member(ADMIN);
  await mount(<AtelierAdmin />);
  await waitFor(
    () => document.body.textContent.includes("Update production timeline"),
    "atelier loaded",
  );
  await click("Appointments");
  await click("Confirm");
  await waitFor(
    () => document.body.textContent.includes("Mark completed"),
    "confirmed",
  );
  assert.equal(
    (
      await sql`select status from account_appointments where user_id=${USER}`
    )[0].status,
    "confirmed",
  );
  await dashboard();
  await tab("Appointments");
  assert.ok(document.body.textContent.includes("confirmed"));
  await click("Cancel appointment");
  await waitFor(
    () => document.body.textContent.includes("cancelled"),
    "cancelled",
  );
  await dashboard();
  await tab("Appointments");
  assert.ok(document.body.textContent.includes("cancelled"));
});
test("wishlist changes made during sign-in synchronisation are retained and displayed", async () => {
  const product = "00000000-0000-4000-8000-000000000401",
    one = "00000000-0000-4000-8000-000000000402",
    two = "00000000-0000-4000-8000-000000000403";
  await sql`insert into products(id,name,slug,pricing_config) values(${product},'Wishlist Silk','wishlist-silk','[{"size":"s","basePrice":1000,"isVisible":true}]'::jsonb)`;
  await sql`insert into product_varient(id,product_id,color,banner_image) values(${one},${product},'Gold','/gold.jpg'),(${two},${product},'Red','/red.jpg')`;
  member();
  localStorage.removeItem("hop-wishlist-owner");
  userWishlistStore.setState({ productWishlist: [{ id: one }] });
  holdWishlistWrite = true;
  await mount(
    <CurrencyProvider>
      <AccountSync />
      <ProfileDashboard userData={user} orders={[]} appointments={[]} />
    </CurrencyProvider>,
  );
  await waitFor(() => wishlistWriteStarted, "wishlist initial sync");
  await act(async () =>
    userWishlistStore.setState({ productWishlist: [{ id: one }, { id: two }] }),
  );
  await act(async () => releaseWishlistWrite());
  await waitFor(
    () =>
      requests.some(
        (row) =>
          row.path === "/api/account/wishlist" &&
          row.method === "POST" &&
          row.body.add.includes(two),
      ),
    "second wishlist change",
  );
  await tab("Wishlist");
  await waitFor(
    () =>
      document.querySelectorAll('a[href*="/product/wishlist-silk"]').length ===
      2,
    "wishlist cards",
  );
  assert.equal(
    (
      await sql`select count(*)::int n from account_wishlist where user_id=${USER}`
    )[0].n,
    2,
  );
});

test("orders are loaded from the database for their owner and survive a dashboard reload", async () => {
  const ownId = "00000000-0000-4000-8000-000000000501",
    otherId = "00000000-0000-4000-8000-000000000502";
  const snapshot = {
    orderId: ownId,
    user: { name: user.name, email: user.email },
    address: {},
    items: [
      {
        name: "Owned silk order",
        image: "/gold.jpg",
        quantity: 1,
        size: "s",
        unitPrice: 1000,
      },
    ],
    subtotalAmount: 1000,
    deliveryCharge: 0,
    discountAmount: 0,
    totalAmountPaid: 1000,
  };
  await sql`insert into "order"(id,user_id,status,payment_status,total_amount_paid,checkout_snapshot) values(${ownId},${USER},'confirmed','paid',1000,${JSON.stringify(snapshot)}::jsonb),(${otherId},${ADMIN},'confirmed','paid',1000,${JSON.stringify({ ...snapshot, orderId: otherId, items: [{ ...snapshot.items[0], name: "Private other order" }] })}::jsonb)`;
  await dashboard();
  await tab("Orders");
  assert.ok(document.body.textContent.includes("Owned silk order"));
  assert.ok(!document.body.textContent.includes("Private other order"));
  assert.ok(document.querySelector(`a[href="/track?orderid=${ownId}"]`));
  await dashboard();
  await tab("Orders");
  assert.ok(document.body.textContent.includes("Owned silk order"));
});

test("bespoke screenshot values save without a stale listing reload replacing the committed record", async () => {
  member(ADMIN);
  staleAtelierSnapshot = await (await adminGet()).json();
  const request = staleAtelierSnapshot.commissions[0];
  await mount(<AtelierAdmin />);
  await waitFor(
    () => document.body.textContent.includes("Update production timeline"),
    "atelier initial list",
  );
  holdNextAdminRead = true;
  await click("Refresh");
  await waitFor(() => Boolean(releaseAdminRead), "pending stale listing");
  await click("Update production timeline");
  await act(async () => {
    const status = document.querySelector('[name="status"]');
    status.value = "completed";
    status.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    const stage = document.querySelector('[name="milestone"]');
    stage.value = "stitching";
    stage.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    document.querySelector('[name="note"]').value =
      "Screenshot regression note";
  });
  await input('[name="delivery"]', "2026-11-25");
  staleAdminReads = true;
  const successBefore = globalThis.dashboardToasts.filter(
    (row) => row.type === "success",
  ).length;
  await submit();
  await waitFor(
    () =>
      globalThis.dashboardToasts.filter((row) => row.type === "success")
        .length > successBefore,
    "bespoke save confirmation despite stale listing",
  );
  assert.ok(!document.body.textContent.includes("could not be reloaded"));
  assert.ok(!document.querySelector("form"));
  assert.ok(document.body.textContent.includes("Stitching in Progress"));
  assert.ok(document.body.textContent.includes("Screenshot regression note"));
  await act(async () => releaseAdminRead());
  assert.ok(document.body.textContent.includes("Stitching in Progress"));
  const [persisted] =
    await sql`select status,current_milestone,estimated_delivery_date::text from bespoke_requests where id=${request.id}`;
  assert.equal(persisted.status, "completed");
  assert.equal(persisted.current_milestone, "stitching");
  assert.equal(persisted.estimated_delivery_date, "2026-11-25");
  staleAdminReads = false;
  await mount(<AtelierAdmin />);
  await waitFor(
    () => document.body.textContent.includes("Stitching in Progress"),
    "admin reload after commit",
  );
  assert.ok(document.body.textContent.includes("Screenshot regression note"));
  await dashboard();
  await tab("Bespoke");
  assert.ok(document.body.textContent.includes("Stitching in Progress"));
  assert.ok(document.body.textContent.includes("Screenshot regression note"));
});
