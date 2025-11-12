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
    console.log(1);
    const [couponDetail] = await db
      .select()
      .from(userCoupons)
      .where(eq(userCoupons.code, couponCode));

    console.log(2);
    if (!couponDetail) {
      return new Error("Coupon not found");
    }
    console.log(3);
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
      console.log(4);
      if (couponUserHistory) throw new Error("Coupon already used");
      console.log(5);
    }
    return couponDetail;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to check coupon");
  }
};
