import { coupon, couponTransaction, taileredFit, user } from "./userSchema";
import { category, product, productVarient } from "./productSchema";
import { review } from "./reviewSchema";
import { contact, subscription } from "./contactSchema";
import { blog, blogForm } from "./blogSchema";
import { siteSettings } from "./siteSettingsSchema";
import {
  order,
  orderItem,
  orderRelations,
  orderItemRelations,
  orderStatusEvent,
} from "./orderSchema";

export const productTable = product;
export const productVariantsTable = productVarient;
export const categoryTable = category;
export const taileredFits = taileredFit;

export const orderTable = order;

export const orderItemsTable = orderItem;
export const orderStatusEventsTable = orderStatusEvent;

export const userTable = user;
export const userCoupons = coupon;
export const usercouponTransaction = couponTransaction;

export const reviewsTable = review;

export const contactTable = contact;

export const blogTable = blog;
export const blogFormTable = blogForm;

export const subscriptionTable = subscription;
export const siteSettingsTable = siteSettings;

export const orderRelationsTable = orderRelations;

export const orderItemRelationsTable = orderItemRelations;
