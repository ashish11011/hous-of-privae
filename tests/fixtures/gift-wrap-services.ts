import { orderTable, orderItemsTable, productTable } from "../../db/schema";

export const productId = "00000000-0000-4000-8000-000000000001";
export const variantId = "00000000-0000-4000-8000-000000000010";
export const savedOrders: any[] = [];
export const gatewayOrders: any[] = [];
export const savedItems: any[] = [];
export const authOptions = {};
export async function getServerSession() { return { id: "00000000-0000-4000-8000-000000000020" }; }
export async function getLoyaltyAvailability() { return { availablePoints: 100000, pendingCheckout: null }; }
export const db = {
  select: () => ({ from: (table: unknown) => ({ where: async () => table === productTable ? [{
    id: productId, name: "Test garment", isInStoke: true,
    pricingConfig: [{ size: "s", basePrice: 1000, isVisible: true }],
  }] : [{ id: variantId, productId, color: "Purple", bannerImage: "/test.jpg" }] }) }),
  transaction: async (callback: (tx: any) => Promise<unknown>) => callback({
    select: () => ({ from: () => ({ where: () => ({ for: async () => [{ id: "test-user", loyaltyPoints: 100000 }] }) }) }),
    insert: (table: unknown) => ({ values: async (value: any) => {
      if (table === orderTable) savedOrders.push(value);
      if (table === orderItemsTable) savedItems.push(...value);
    } }),
    update: () => ({ set: () => ({ where: async () => {} }) }),
  }),
};
export default { orders: { create: async (input: any) => {
  gatewayOrders.push(input);
  return { id: `order_test_${gatewayOrders.length}` };
} } };
