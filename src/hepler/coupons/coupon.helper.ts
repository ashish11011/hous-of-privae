"use server";
import { userCoupons } from "@/db/schema";
import { couponTransaction } from "@/db/userSchema";
import { db } from "@/lib/db";
import { and, eq } from "drizzle-orm";

export const getAllCoupons = async () => {
  try {
    const data = await db.select().from(userCoupons);
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to fetch coupons");
  }
};

export const addCoupon = async (coupon: any) => {
  try {
    const data = await db.insert(userCoupons).values(coupon).returning();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to add coupon");
  }
};

export const updateCoupon = async (coupon: any) => {
  try {
    const data = await db
      .update(userCoupons)
      .set(coupon)
      .where(eq(userCoupons.id, coupon.id))
      .returning();
    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to update coupon");
  }
};

export const checkCoupon = async (couponCode: string) => {
  const userId = "a76d2b82-d4b6-49f5-9c52-2f8643c1b9b4"; //get oreg user id
  try {
     const [couponDetail] = await db
      .select()
      .from(userCoupons)
      .where(eq(userCoupons.code, couponCode));

     if (!couponDetail) {
      return new Error("Coupon not found");
    }
     if (couponDetail.useOnce) {
      const [couponUserHistory] = await db
        .select()
        .from(couponTransaction)
        .where(
          and(
            eq(couponTransaction.couponId, couponDetail.id),
            eq(couponTransaction.userId, userId)
          )
        );
       if (couponUserHistory) throw new Error("Coupon already used");
     }
    return couponDetail;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to check coupon");
  }
};

export const validateCouponForOrder = async ({
  couponCode,
  subtotal,
  userId,
}: {
  couponCode?: string;
  subtotal: number;
  userId: string;
}) => {
  const normalizedCode = couponCode?.trim().toUpperCase();
  if (!normalizedCode) {
    return { coupon: null, discountAmount: 0 };
  }

  const [couponDetail] = await db
    .select()
    .from(userCoupons)
    .where(eq(userCoupons.code, normalizedCode));

  if (!couponDetail) {
    throw new Error("Coupon not found");
  }

  if (couponDetail.useOnce) {
    const [couponUserHistory] = await db
      .select()
      .from(couponTransaction)
      .where(
        and(
          eq(couponTransaction.couponId, couponDetail.id),
          eq(couponTransaction.userId, userId)
        )
      );

    if (couponUserHistory) {
      throw new Error("Coupon already used");
    }
  }

  const percentageDiscount = Math.floor(
    (subtotal * (couponDetail.discountPercentage ?? 0)) / 100
  );
  const fixedDiscount = couponDetail.discountFixedAmount ?? 0;
  const discountAmount = Math.min(subtotal, Math.max(0, percentageDiscount + fixedDiscount));

  return { coupon: couponDetail, discountAmount };
};

export const recordCouponUsage = async ({
  couponId,
  userId,
}: {
  couponId?: string;
  userId: string;
}) => {
  if (!couponId) return null;

  const [transaction] = await db
    .insert(couponTransaction)
    .values({ couponId, userId })
    .returning();

  return transaction;
};
