"use server";

import { db } from "@/lib/db";
import {
  orderTable,
  orderItemsTable,
  orderStatusEventsTable,
  productTable,
  productVariantsTable,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { statusLabel, statusMessages, type EditableOrderStatus } from "@/lib/orders/status";
import { z } from "zod";

export type TrackedOrderItem = {
  id: string;
  name: string;
  quantity: number;
  size: string | null;
  color: string | null;
  variant: string;
  image?: string | null;
  unitPrice?: number | null;
};

export type TrackedOrderHistoryItem = {
  id: string;
  fromStatus: string;
  toStatus: string;
  createdAt: string;
};

export type TrackedOrder = {
  id: string;
  status: string;
  statusLabel: string;
  statusMessage: string;
  paymentStatus: string;
  totalAmountPaid: number | null;
  createdAt: string;
  updatedAt: string;
  address: {
    city: string | null;
    state: string | null;
    pincode: string | null;
  };
  items: TrackedOrderItem[];
  history: TrackedOrderHistoryItem[];
};

export type TrackOrderResponse =
  | { success: true; order: TrackedOrder }
  | { success: false; error: string };

const uuidSchema = z.string().uuid();

export async function getTrackOrderDetails(orderId: string): Promise<TrackOrderResponse> {
  const trimmedId = orderId?.trim();
  if (!trimmedId) {
    return { success: false, error: "Please enter an order number." };
  }

  if (!uuidSchema.safeParse(trimmedId).success) {
    return {
      success: false,
      error: "Invalid order ID format. Please check your order confirmation email for the valid Order ID.",
    };
  }

  try {
    const [orderRow] = await db
      .select()
      .from(orderTable)
      .where(eq(orderTable.id, trimmedId));

    if (!orderRow) {
      return {
        success: false,
        error: "No order found with the provided Order ID.",
      };
    }

    const [itemsRows, eventsRows] = await Promise.all([
      db
        .select({
          id: orderItemsTable.id,
          productId: orderItemsTable.productId,
          productVariantId: orderItemsTable.productVariantId,
          name: productTable.name,
          quantity: orderItemsTable.quantity,
          size: orderItemsTable.size,
          color: orderItemsTable.color,
          variant: orderItemsTable.variant,
          bannerImage: productVariantsTable.bannerImage,
          images: productVariantsTable.images,
        })
        .from(orderItemsTable)
        .leftJoin(productTable, eq(orderItemsTable.productId, productTable.id))
        .leftJoin(productVariantsTable, eq(orderItemsTable.productVariantId, productVariantsTable.id))
        .where(eq(orderItemsTable.orderId, trimmedId)),
      db
        .select({
          id: orderStatusEventsTable.id,
          fromStatus: orderStatusEventsTable.fromStatus,
          toStatus: orderStatusEventsTable.toStatus,
          createdAt: orderStatusEventsTable.createdAt,
        })
        .from(orderStatusEventsTable)
        .where(eq(orderStatusEventsTable.orderId, trimmedId))
        .orderBy(desc(orderStatusEventsTable.createdAt)),
    ]);

    const snapshot = orderRow.checkoutSnapshot;

    const items: TrackedOrderItem[] = snapshot?.items?.length
      ? snapshot.items.map((item, index) => {
          const matchingDbItem = itemsRows.find(row =>
            item.variantId ? row.productVariantId === item.variantId && row.size === item.size
              : item.productId ? row.productId === item.productId && row.size === item.size && row.color === item.color
              : row.size === item.size && row.color === item.color
          );
          const image =
            item.image || matchingDbItem?.bannerImage ||
            (matchingDbItem?.images && matchingDbItem.images.length > 0
              ? matchingDbItem.images[0]
              : null);
          return {
            id: `${trimmedId}-${index}`,
            name: item.name,
            quantity: item.quantity,
            size: item.size ?? null,
            color: item.color ?? null,
            variant: item.variant ?? "stitched",
            unitPrice: item.unitPrice ?? null,
            image,
          };
        })
      : itemsRows.map((item) => {
          const image =
            item.bannerImage ||
            (item.images && item.images.length > 0 ? item.images[0] : null);
          return {
            id: item.id,
            name: item.name ?? "Unavailable product",
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            variant: item.variant,
            unitPrice: null,
            image,
          };
        });

    const statusKey = orderRow.status as EditableOrderStatus;
    const defaultStatusMessage =
      statusMessages[statusKey] ??
      (orderRow.status === "confirmed"
        ? "Your order has been confirmed and received by our atelier."
        : orderRow.status === "pending" || orderRow.status === "pending_payment"
        ? "Your order is pending payment verification."
        : `Your order is currently ${statusLabel(orderRow.status).toLowerCase()}.`);

    return {
      success: true,
      order: {
        id: orderRow.id,
        status: orderRow.status,
        statusLabel: statusLabel(orderRow.status),
        statusMessage: defaultStatusMessage,
        paymentStatus: orderRow.paymentStatus,
        totalAmountPaid: orderRow.totalAmountPaid,
        createdAt: orderRow.createdAt.toISOString(),
        updatedAt: orderRow.updatedAt.toISOString(),
        address: {
          city: orderRow.city,
          state: orderRow.state,
          pincode: orderRow.pincode,
        },
        items,
        history: eventsRows.map((event) => ({
          id: event.id,
          fromStatus: event.fromStatus,
          toStatus: event.toStatus,
          createdAt: event.createdAt.toISOString(),
        })),
      },
    };
  } catch (error) {
    console.error("Failed to track order:", error);
    return {
      success: false,
      error: "An unexpected error occurred while tracking your order. Please try again later.",
    };
  }
}
