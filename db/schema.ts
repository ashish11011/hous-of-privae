import { user } from "./userSchema";
import { product } from "./productSchema";
import { review } from "./reviewSchema";
import { contact, subscription } from "./contactSchema";
import { blog, blogForm } from "./blogSchema";
import {
  order,
  orderItem,
  orderRelations,
  orderItemRelations,
} from "./orderSchema";

export const productTable = product;

export const orderTable = order;

export const orderItemsTable = orderItem;

export const userTable = user;

export const reviewsTable = review;

export const contactTable = contact;

export const blogTable = blog;

export const blogFormTable = blogForm;

export const subscriptionTable = subscription;

export const orderRelationsTable = orderRelations;

export const orderItemRelationsTable = orderItemRelations;
