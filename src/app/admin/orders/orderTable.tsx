import Link from "next/link";
import { Eye, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { statusLabel } from "@/lib/orders/status";
import type { AdminOrderSummary } from "@/lib/orders/types";

export default function OrdersTable({
  orders,
}: {
  orders: AdminOrderSummary[];
}) {
  return (
    <div className="min-w-0 overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 z-10 bg-background">
              Order & actions
            </TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment</TableHead>
            <TableHead>Total paid</TableHead>
            <TableHead>Placed (IST)</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!orders.length && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="h-28 text-center text-muted-foreground"
              >
                No orders yet.
              </TableCell>
            </TableRow>
          )}
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="sticky left-0 z-10 bg-background min-w-52">
                <Link
                  href={`/admin/orders/${order.id}`}
                  className="font-mono text-xs text-primary underline underline-offset-4"
                  title={order.id}
                >
                  #{order.id.slice(0, 8).toUpperCase()}
                </Link>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/admin/orders/${order.id}`}>
                      <Eye size={14} />
                      View details
                      <span className="sr-only"> for order {order.id}</span>
                    </Link>
                  </Button>
                  {/* <Button size="sm" variant="outline" asChild><Link href={`/admin/orders/${order.id}#order-status`}><PackageCheck size={14} />Update status<span className="sr-only"> for order {order.id}</span></Link></Button> */}
                </div>
              </TableCell>
              <TableCell>
                <p>{order.customerName || "Customer"}</p>
                <p className="text-xs text-muted-foreground">
                  {order.customerEmail}
                </p>
              </TableCell>
              <TableCell>
                <span className="inline-block whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  {statusLabel(order.status)}
                </span>
              </TableCell>
              <TableCell>{statusLabel(order.paymentStatus)}</TableCell>
              <TableCell className="whitespace-nowrap">
                {order.totalAmountPaid === null
                  ? "Not recorded"
                  : new Intl.NumberFormat("en-IN", {
                      style: "currency",
                      currency: order.currency,
                    }).format(order.totalAmountPaid)}
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs">
                {new Date(order.createdAt).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
