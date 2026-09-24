import Link from "next/link";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getAdminOrderList } from "@/lib/orders/admin";
import OrdersTable from "./orderTable";

export const dynamic = "force-dynamic";

export default async function Page() {
  if (!await getOrderAdmin()) {
    return <div className="p-8 space-y-3"><h1 className="text-2xl">Admin sign-in required</h1><p>Sign in with an account whose admin role is enabled to view and manage orders.</p><Link className="text-primary underline" href="/auth/login?callbackUrl=/admin/orders">Sign in</Link></div>;
  }
  const orders = await getAdminOrderList();
  return <div className="w-full min-w-0 p-4 md:p-8">
    <h1 className="text-3xl mb-2">Orders</h1>
    <p className="text-sm text-muted-foreground mb-6">View purchased items, manage fulfillment, and keep your customers informed.</p>
    <OrdersTable orders={orders} />
  </div>;
}
