import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
  accountAddress,
  accountMeasurement,
  accountProfile,
  accountWishlist,
  accountEdit,
  bespokeRequest,
  bespokeMilestone,
  accountAppointment,
  accountStockAlert,
} from "@/db/accountSchema";
import {
  contactTable,
  orderTable,
  productTable,
  productVariantsTable,
  userTable,
} from "@/db/schema";
import { db } from "@/lib/db";
import { loadCatalog } from "@/lib/productCatalog";
import { variantCards } from "@/lib/productAdapter";
import { CheckoutError } from "@/lib/payments/checkout-error";
import {
  addressInput,
  measurementInput,
  profileInput,
  wishlistInput,
} from "./validation";
import { accountSchemaMissing } from "./api";

async function lockUser(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
) {
  const [user] = await tx
    .select()
    .from(userTable)
    .where(eq(userTable.id, userId))
    .for("update");
  if (!user) throw new CheckoutError("Account not found.", 404);
  return user;
}
export async function getAddresses(userId: string) {
  return db.transaction(async (tx) => {
    const user = await lockUser(tx, userId);
    let rows = await tx
      .select()
      .from(accountAddress)
      .where(eq(accountAddress.userId, userId))
      .orderBy(desc(accountAddress.isDefault), desc(accountAddress.createdAt));
    if (
      !rows.length &&
      user.addressLine1 &&
      user.city &&
      user.state &&
      user.pincode
    )
      rows = await tx
        .insert(accountAddress)
        .values({
          userId,
          label: "Home",
          recipientName: user.name || "Member",
          phone: user.number || "",
          line1: user.addressLine1,
          line2: user.addressLine2 || "",
          city: user.city,
          state: user.state,
          pincode: user.pincode,
          isDefault: true,
        })
        .returning();
    return rows;
  });
}
export async function checkoutAddresses(userId: string) {
  try {
    return await getAddresses(userId);
  } catch (error) {
    if (accountSchemaMissing(error)) return [];
    throw error;
  }
}
export async function saveAddress(userId: string, input: unknown) {
  const { id, ...values } = addressInput.parse(input);
  return db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const existing = await tx
      .select()
      .from(accountAddress)
      .where(eq(accountAddress.userId, userId));
    if (id && !existing.some((row) => row.id === id))
      throw new CheckoutError("Address not found.", 404);
    const isDefault =
      values.isDefault ||
      existing.length === 0 ||
      Boolean(id && existing.find((row) => row.id === id)?.isDefault);
    if (isDefault)
      await tx
        .update(accountAddress)
        .set({ isDefault: false })
        .where(eq(accountAddress.userId, userId));
    const [saved] = id
      ? await tx
          .update(accountAddress)
          .set({ ...values, isDefault, updatedAt: new Date() })
          .where(
            and(eq(accountAddress.id, id), eq(accountAddress.userId, userId)),
          )
          .returning()
      : await tx
          .insert(accountAddress)
          .values({ ...values, isDefault, userId })
          .returning();
    if (isDefault)
      await tx
        .update(userTable)
        .set({
          addressLine1: saved.line1,
          addressLine2: saved.line2,
          city: saved.city,
          state: saved.state,
          pincode: saved.pincode,
        })
        .where(eq(userTable.id, userId));
    return saved;
  });
}
export async function removeAddress(userId: string, id: string) {
  await db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const [removed] = await tx
      .delete(accountAddress)
      .where(and(eq(accountAddress.id, id), eq(accountAddress.userId, userId)))
      .returning();
    if (!removed) throw new CheckoutError("Address not found.", 404);
    if (removed.isDefault) {
      const [next] = await tx
        .select()
        .from(accountAddress)
        .where(eq(accountAddress.userId, userId))
        .orderBy(desc(accountAddress.createdAt))
        .limit(1);
      if (next)
        await tx
          .update(accountAddress)
          .set({ isDefault: true })
          .where(eq(accountAddress.id, next.id));
      await tx
        .update(userTable)
        .set({
          addressLine1: next?.line1 ?? null,
          addressLine2: next?.line2 ?? null,
          city: next?.city ?? null,
          state: next?.state ?? null,
          pincode: next?.pincode ?? null,
        })
        .where(eq(userTable.id, userId));
    }
  });
}
export async function getMeasurements(userId: string) {
  return db
    .select()
    .from(accountMeasurement)
    .where(eq(accountMeasurement.userId, userId))
    .orderBy(desc(accountMeasurement.createdAt));
}
export async function saveMeasurement(userId: string, input: unknown) {
  const { id, ...values } = measurementInput.parse(input);
  const [saved] = id
    ? await db
        .update(accountMeasurement)
        .set({ ...values, updatedAt: new Date() })
        .where(
          and(
            eq(accountMeasurement.id, id),
            eq(accountMeasurement.userId, userId),
          ),
        )
        .returning()
    : await db
        .insert(accountMeasurement)
        .values({ ...values, userId })
        .returning();
  if (!saved) throw new CheckoutError("Measurement set not found.", 404);
  return saved;
}
export async function removeMeasurement(userId: string, id: string) {
  const removed = await db
    .delete(accountMeasurement)
    .where(
      and(eq(accountMeasurement.id, id), eq(accountMeasurement.userId, userId)),
    )
    .returning();
  if (!removed.length)
    throw new CheckoutError("Measurement set not found.", 404);
}
export async function getAccountProfile(userId: string) {
  const [user] = await db
    .select({
      name: userTable.name,
      number: userTable.number,
      email: userTable.email,
    })
    .from(userTable)
    .where(eq(userTable.id, userId));
  const [profile] = await db
    .select()
    .from(accountProfile)
    .where(eq(accountProfile.userId, userId));
  if (!user) throw new CheckoutError("Account not found.", 404);
  return {
    ...user,
    name: user.name ?? "",
    number: user.number ?? "",
    dateOfBirth: profile?.dateOfBirth ?? "",
    preferredTopSize: profile?.preferredTopSize ?? "",
    preferredBottomSize: profile?.preferredBottomSize ?? "",
    preferredBlouseSize: profile?.preferredBlouseSize ?? "",
  };
}
export async function saveAccountProfile(userId: string, input: unknown) {
  const { name, number, dateOfBirth, ...sizes } = profileInput.parse(input);
  await db.transaction(async (tx) => {
    await lockUser(tx, userId);
    await tx
      .update(userTable)
      .set({ name, number, updatedAt: new Date() })
      .where(eq(userTable.id, userId));
    const values = {
      ...sizes,
      dateOfBirth: dateOfBirth || null,
      updatedAt: new Date(),
    };
    await tx
      .insert(accountProfile)
      .values({ userId, ...values })
      .onConflictDoUpdate({ target: accountProfile.userId, set: values });
    await tx.delete(accountEdit).where(eq(accountEdit.userId, userId));
  });
  return getAccountProfile(userId);
}
export async function getWishlist(userId: string) {
  const rows = await db
    .select()
    .from(accountWishlist)
    .where(eq(accountWishlist.userId, userId))
    .orderBy(desc(accountWishlist.createdAt));
  const ids = rows.map((row) => row.variantId);
  const cards = variantCards(await loadCatalog()).filter((card) =>
    ids.includes(card.variantId!),
  );
  return { ids, products: cards };
}
export async function updateWishlist(userId: string, input: unknown) {
  const { add, remove } = wishlistInput.parse(input);
  await db.transaction(async (tx) => {
    await lockUser(tx, userId);
    const valid = add.length
      ? await tx
          .select({ id: productVariantsTable.id })
          .from(productVariantsTable)
          .where(inArray(productVariantsTable.id, add))
      : [];
    if (remove.length)
      await tx
        .delete(accountWishlist)
        .where(
          and(
            eq(accountWishlist.userId, userId),
            inArray(accountWishlist.variantId, remove),
          ),
        );
    if (valid.length)
      await tx
        .insert(accountWishlist)
        .values(valid.map((row) => ({ userId, variantId: row.id })))
        .onConflictDoNothing();
    if (valid.length || remove.length)
      await tx.delete(accountEdit).where(eq(accountEdit.userId, userId));
  });
  return getWishlist(userId);
}
export async function stylistEdit(userId: string, refresh = false) {
  const chosen = await db.transaction(async (tx) => {
    const user = await lockUser(tx, userId);
    const [existing] = await tx
      .select()
      .from(accountEdit)
      .where(eq(accountEdit.userId, userId));
    if (
      existing &&
      (!refresh || Date.now() - existing.generatedAt.getTime() < 3600000)
    )
      return existing;
    const [profile] = await tx
      .select()
      .from(accountProfile)
      .where(eq(accountProfile.userId, userId));
    const wishes = await tx
      .select()
      .from(accountWishlist)
      .where(eq(accountWishlist.userId, userId));
    const purchases = await tx
      .select({ snapshot: orderTable.checkoutSnapshot })
      .from(orderTable)
      .where(
        and(
          eq(orderTable.userId, userId),
          eq(orderTable.paymentStatus, "paid"),
        ),
      );
    const catalog = await loadCatalog();
    const favoriteIds = new Set(wishes.map((row) => row.variantId));
    const favorites = catalog.filter((item) =>
      item.variants.some((variant) => favoriteIds.has(variant.id)),
    );
    const purchased = new Set(
      purchases.flatMap(
        (row) =>
          row.snapshot?.items.flatMap((item) =>
            item.productId ? [item.productId] : [],
          ) ?? [],
      ),
    );
    const preferredSize = profile?.preferredTopSize.toLowerCase();
    const scored = catalog
      .filter((item) => item.isInStoke !== false && variantCards([item]).length)
      .map((item) => ({
        item,
        score:
          (item.sizes?.includes(preferredSize ?? "") ? 4 : 0) +
          (favorites.some(
            (favorite) => favorite.categoryId1 === item.categoryId1,
          )
            ? 3
            : 0) +
          (favorites.some(
            (favorite) => favorite.fabric && favorite.fabric === item.fabric,
          )
            ? 2
            : 0) -
          (purchased.has(item.id) ? 3 : 0),
      }))
      .sort(
        (a, b) =>
          b.score - a.score ||
          b.item.createdAt.getTime() - a.item.createdAt.getTime(),
      );
    const productIds = scored.slice(0, 6).map((row) => row.item.id);
    const generatedAt = new Date();
    await tx
      .insert(accountEdit)
      .values({ userId, productIds, generatedAt })
      .onConflictDoUpdate({
        target: accountEdit.userId,
        set: { productIds, generatedAt },
      });
    return { productIds, generatedAt };
  });
  const catalog = variantCards(await loadCatalog());
  return {
    generatedAt: chosen.generatedAt,
    products: chosen.productIds.flatMap((id) => {
      const card = catalog.find(
        (item) => item.id === id && item.isInStoke !== false,
      );
      return card ? [card] : [];
    }),
  };
}
export async function getBespokeRequests(userId: string) {
  const requests = await db
    .select()
    .from(bespokeRequest)
    .where(eq(bespokeRequest.userId, userId))
    .orderBy(desc(bespokeRequest.createdAt));
  const milestones = requests.length
    ? await db
        .select()
        .from(bespokeMilestone)
        .where(
          inArray(
            bespokeMilestone.requestId,
            requests.map((row) => row.id),
          ),
        )
        .orderBy(desc(bespokeMilestone.createdAt))
    : [];
  return requests.map((request) => ({
    ...request,
    milestones: milestones.filter((row) => row.requestId === request.id),
  }));
}
export async function getAppointments(userId: string) {
  const rows = await db
    .select()
    .from(accountAppointment)
    .where(eq(accountAppointment.userId, userId))
    .orderBy(desc(accountAppointment.scheduledFor));
  const [member] = await db
    .select({ email: userTable.email })
    .from(userTable)
    .where(eq(userTable.id, userId));
  const legacy = member
    ? await db
        .select()
        .from(contactTable)
        .where(
          and(
            eq(contactTable.email, member.email),
            eq(contactTable.location, "appointment"),
          ),
        )
    : [];
  const linkedRows = legacy.length
    ? await db
        .select({ contactId: accountAppointment.contactId })
        .from(accountAppointment)
        .where(
          inArray(
            accountAppointment.contactId,
            legacy.map((row) => row.id),
          ),
        )
    : [];
  const linked = new Set(linkedRows.map((row) => row.contactId));
  const old = legacy.flatMap((row) => {
    const match = row.message?.match(
      /Scheduled:\s*(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2})/,
    );
    if (!match || linked.has(row.id)) return [];
    return [
      {
        id: `legacy:${row.id}`,
        userId,
        contactId: row.id,
        service:
          row.message?.match(/^Service: (.+)$/m)?.[1] ?? "Private appointment",
        scheduledFor: new Date(`${match[1]}T${match[2]}:00+05:30`),
        status: "requested" as const,
        durationMinutes: 60,
        notes: row.message?.match(/^Notes: (.+)$/m)?.[1] ?? "",
        emailSentAt: null,
        createdAt: row.createdAt,
      },
    ];
  });
  return [...rows, ...old].sort(
    (a, b) => b.scheduledFor.getTime() - a.scheduledFor.getTime(),
  );
}
export async function overviewCounts(userId: string) {
  const [addresses, measurements, appointments] = await Promise.all([
    getAddresses(userId),
    getMeasurements(userId),
    getAppointments(userId),
  ]);
  return {
    addresses: addresses.length,
    measurements: measurements.length,
    appointments: appointments.length,
  };
}
export async function cancelAppointment(userId: string, id: string) {
  const [saved] = await db
    .update(accountAppointment)
    .set({ status: "cancelled" })
    .where(
      and(
        eq(accountAppointment.id, id),
        eq(accountAppointment.userId, userId),
        inArray(accountAppointment.status, ["requested", "confirmed"]),
      ),
    )
    .returning();
  if (!saved)
    throw new CheckoutError(
      "Appointment not found or cannot be cancelled.",
      409,
    );
  return saved;
}
export async function getStockAlerts(userId: string) {
  const rows = await db
    .select({
      alert: accountStockAlert,
      productName: productTable.name,
      slug: productTable.slug,
    })
    .from(accountStockAlert)
    .innerJoin(productTable, eq(accountStockAlert.productId, productTable.id))
    .where(eq(accountStockAlert.userId, userId))
    .orderBy(desc(accountStockAlert.createdAt));
  return rows.map((row) => ({
    ...row.alert,
    productName: row.productName,
    slug: row.slug,
  }));
}
export async function removeStockAlert(userId: string, id: string) {
  await db
    .delete(accountStockAlert)
    .where(
      and(eq(accountStockAlert.id, id), eq(accountStockAlert.userId, userId)),
    );
}
