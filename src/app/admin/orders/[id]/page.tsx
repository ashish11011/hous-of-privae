import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { getOrderAdmin } from "@/lib/auth/admin";
import { getAdminOrderDetail } from "@/lib/orders/admin";
import OrderDetails from "../OrderDetails";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  if (!await getOrderAdmin()) {
    return <div className="p-8 space-y-3"><h1 className="text-2xl">Admin sign-in required</h1><p>Sign in with an admin account to manage orders.</p><Link href="/auth/login?callbackUrl=/admin/orders" className="text-primary underline">Sign in</Link></div>;
  }
  const { id } = await params;
  if (!z.string().uuid().safeParse(id).success) notFound();
  const order = await getAdminOrderDetail(id);
  if (!order) notFound();
  return <main className="w-full min-w-0 p-4 md:p-8">
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/orders" className="text-sm text-primary underline underline-offset-4">← All orders</Link>
      <h1 className="mt-5 text-3xl">Order details</h1>
      <p className="mt-2 mb-6 text-xs text-muted-foreground break-all">{order.id} · All times are IST</p>
      <OrderDetails initialDetail={order} />
    </div>
  </main>;
}
