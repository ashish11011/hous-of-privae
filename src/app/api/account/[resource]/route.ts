import { z } from "zod";
import { accountApi } from "@/lib/account/api";
import { CheckoutError } from "@/lib/payments/checkout-error";
import * as account from "@/lib/account/resources";
import {
  circleEnabled,
  getCircleSummary,
  transferCirclePoints,
} from "@/lib/account/circle";
import { getReferral } from "@/lib/account/referrals";
import { deleteInput } from "@/lib/account/validation";
type Context = { params: Promise<{ resource: string }> };
export async function GET(_req: Request, context: Context) {
  return accountApi(async (userId) => {
    const { resource } = await context.params;
    switch (resource) {
      case "overview":
        return { data: await account.overviewCounts(userId) };
      case "addresses":
        return { data: await account.getAddresses(userId) };
      case "measurements":
        return { data: await account.getMeasurements(userId) };
      case "profile":
        return { data: await account.getAccountProfile(userId) };
      case "wishlist":
        return { data: await account.getWishlist(userId) };
      case "stylist":
        return { data: await account.stylistEdit(userId) };
      case "bespoke":
        return { data: await account.getBespokeRequests(userId) };
      case "appointments":
        return { data: await account.getAppointments(userId) };
      case "stock-alerts":
        return { data: await account.getStockAlerts(userId) };
      case "referrals":
        return { data: await getReferral(userId) };
      case "circle":
        if (!(await circleEnabled()))
          throw new CheckoutError(
            "The updated Privae Circle programme is not available yet.",
            503,
          );
        return { data: await getCircleSummary(userId) };
      default:
        throw new CheckoutError("Account section not found.", 404);
    }
  });
}
export async function POST(req: Request, context: Context) {
  return accountApi(async (userId) => {
    const { resource } = await context.params;
    if (resource === "stylist")
      return { success: true, data: await account.stylistEdit(userId, true) };
    const input = await req.json();
    switch (resource) {
      case "addresses":
        return {
          success: true,
          data: await account.saveAddress(userId, input),
        };
      case "measurements":
        return {
          success: true,
          data: await account.saveMeasurement(userId, input),
        };
      case "profile":
        return {
          success: true,
          data: await account.saveAccountProfile(userId, input),
        };
      case "wishlist":
        return {
          success: true,
          data: await account.updateWishlist(userId, input),
        };
      case "transfers":
        return {
          success: true,
          data: await transferCirclePoints(
            userId,
            z
              .object({
                id: z.uuid(),
                email: z.email(),
                points: z.number().int().min(1000).max(2147483647),
              })
              .parse(input),
          ),
        };
      default:
        throw new CheckoutError("Account section not found.", 404);
    }
  });
}
export const PUT = POST;
export async function DELETE(req: Request, context: Context) {
  return accountApi(async (userId) => {
    const { resource } = await context.params;
    const { id } = deleteInput.parse(await req.json());
    switch (resource) {
      case "addresses":
        await account.removeAddress(userId, id);
        break;
      case "measurements":
        await account.removeMeasurement(userId, id);
        break;
      case "appointments":
        await account.cancelAppointment(userId, id);
        break;
      case "stock-alerts":
        await account.removeStockAlert(userId, id);
        break;
      default:
        throw new CheckoutError("Account section not found.", 404);
    }
    return { success: true };
  });
}
