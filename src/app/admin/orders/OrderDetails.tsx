"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { allowedOrderStatuses, statusLabel } from "@/lib/orders/status";
import type { AdminOrderDetail } from "@/lib/orders/types";

const date = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });
const money = (amount: number | null, currency: string) =>
  amount === null
    ? "Not recorded"
    : new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
        amount,
      );
function Status({ value }: { value: string }) {
  return (
    <span className="inline-block whitespace-nowrap rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
      {statusLabel(value)}
    </span>
  );
}

export default function OrderDetails({
  initialDetail,
}: {
  initialDetail: AdminOrderDetail;
}) {
  const router = useRouter();
  const selectedId = initialDetail.id;
  const [detail, setDetail] = useState<AdminOrderDetail>(initialDetail);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!reload) return;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/admin/orders/${selectedId}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok)
          throw new Error(result.message || "Could not load order details.");
        if (!controller.signal.aborted) {
          setDetail(result.order);
          setStatus("");
        }
      })
      .catch((error) => {
        if (!controller.signal.aborted) setError(error.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [selectedId, reload]);

  async function changeStatus() {
    if (!detail || !status || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(`/api/admin/orders/${detail.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, expectedUpdatedAt: detail.updatedAt }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not update status.");
      setNotice(result.message);
      setReload((value) => value + 1);
      router.refresh();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not update status.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function retryEmail(eventId: string) {
    if (!detail || busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch(
        `/api/admin/orders/${detail.id}/notifications/${eventId}`,
        { method: "POST" },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Could not send email.");
      setNotice(result.message);
      setReload((value) => value + 1);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not send email.",
      );
    } finally {
      setBusy(false);
    }
  }
  const availableStatuses = detail ? allowedOrderStatuses(detail) : [];
  const pendingEmail = detail?.history.some((event) => !event.emailSentAt);

  return (
    <div className="space-y-5">
      {error && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 p-3 text-sm text-red-800"
        >
          {error}
          <Button
            size="sm"
            variant="outline"
            disabled={busy || loading}
            className="ml-3"
            onClick={() => setReload((value) => value + 1)}
          >
            Reload details
          </Button>
        </div>
      )}
      {notice && (
        <p role="status" className="border bg-secondary/50 p-3 text-sm">
          {notice}
        </p>
      )}
      {loading && (
        <p role="status" className="flex items-center gap-2 text-sm">
          <Loader2 className="animate-spin" size={16} />
          Loading order…
        </p>
      )}
      {detail && !loading && (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <Status value={detail.status} />
            <span className="text-sm">
              Payment: <Status value={detail.paymentStatus} />
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              Placed {date(detail.createdAt)}
            </span>
          </div>
          <section
            id="order-status"
            className="rounded-lg border bg-secondary/30 p-4 space-y-3"
          >
            <h3 className="text-xl">Update order status</h3>
            <p className="text-sm text-muted-foreground">
              Each change emails {detail.customerEmail || "the customer"} with
              the order’s new status.
            </p>
            {availableStatuses.length > 0 ? (
              <div className="flex flex-col sm:flex-row gap-3">
                <label className="sr-only" htmlFor="new-order-status">
                  New order status
                </label>
                <select
                  id="new-order-status"
                  value={status}
                  onChange={(event) => setStatus(event.target.value)}
                  disabled={busy}
                  className="h-10 rounded-md border bg-background px-3 text-sm flex-1 disabled:opacity-50"
                >
                  <option value="">Choose a new status</option>
                  {availableStatuses.map((value) => (
                    <option key={value} value={value}>
                      {statusLabel(value)}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={changeStatus}
                  disabled={!status || busy}
                >
                  {busy ? "Saving…" : "Update & email customer"}
                </Button>
              </div>
            ) : (
              <p className="text-sm">
                {["cancelled", "returned"].includes(detail.status)
                  ? "This order has reached its final status."
                  : "No status changes are available. Payment must be received before fulfillment can begin."}
              </p>
            )}
            {pendingEmail && (
              <p className="text-xs text-amber-700">
                Note: A customer notification email is pending delivery. You can retry sending it from the Status History below.
              </p>
            )}
            {["cancelled", "returned"].includes(status) && (
              <p className="text-sm text-muted-foreground">
                This updates fulfillment only. It does not issue a payment
                refund.
              </p>
            )}
          </section>
          <div className="grid gap-5 sm:grid-cols-2">
            <section className="rounded-lg border p-4">
              <h3 className="text-lg mb-2">Customer</h3>
              <p>{detail.customerName || "Not recorded"}</p>
              <p className="text-sm break-all">
                {detail.customerEmail || "No email recorded"}
              </p>
              <p className="text-sm">
                {detail.customerPhone || "No phone recorded"}
              </p>
            </section>
            <section className="rounded-lg border p-4">
              <h3 className="text-lg mb-2">Shipping address</h3>
              <address className="not-italic text-sm">
                {Object.values(detail.address).some(Boolean)
                  ? Object.values(detail.address)
                      .filter(Boolean)
                      .map((line, index) => <p key={index}>{line}</p>)
                  : "No address recorded"}
              </address>
            </section>
          </div>
          <section>
            <h3 className="text-xl mb-3">Purchased items</h3>
            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Size / color</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Unit price</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">
                          {item.variant}
                        </p>
                      </TableCell>
                      <TableCell className="text-xs">
                        {item.size || "—"}
                        <br />
                        {item.color || "—"}
                      </TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {money(item.unitPrice, detail.currency)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {money(
                          item.unitPrice === null
                            ? null
                            : item.unitPrice * item.quantity,
                          detail.currency,
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {!detail.items.length && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No item details were saved for this order.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            {detail.items.some((item) => item.unitPrice === null) && (
              <p className="text-xs text-muted-foreground mt-2">
                Purchase prices were not saved for this older order. Its
                recorded paid total is shown below.
              </p>
            )}
          </section>
          <div className="grid sm:grid-cols-2 gap-5">
            <section className="rounded-lg border p-4 min-w-0">
              <h3 className="text-lg mb-3">Payment references</h3>
              <dl className="text-xs space-y-3">
                <div>
                  <dt className="text-muted-foreground">Razorpay order</dt>
                  <dd className="break-all mt-1">
                    {detail.razorpayOrderId || "Not recorded"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Razorpay payment</dt>
                  <dd className="break-all mt-1">
                    {detail.razorpayPaymentId || "Not recorded"}
                  </dd>
                </div>
              </dl>
            </section>
            <dl className="rounded-lg border p-4 text-sm space-y-2">
              {[
                ["Subtotal", detail.subtotalAmount],
                ["Delivery", detail.deliveryCharge],
                ["Discount", detail.discountAmount],
                ["Order total", detail.totalAmount],
                ["Total paid", detail.totalAmountPaid],
              ].map(([label, amount]) => (
                <div className="flex justify-between gap-4" key={label}>
                  <dt>{label}</dt>
                  <dd>{money(amount as number | null, detail.currency)}</dd>
                </div>
              ))}
              {detail.couponCode && (
                <div className="flex justify-between">
                  <dt>Coupon</dt>
                  <dd>{detail.couponCode}</dd>
                </div>
              )}
            </dl>
          </div>

          <section>
            <h3 className="text-xl mb-3">Status history</h3>
            {!detail.history.length ? (
              <p className="text-sm text-muted-foreground">
                No admin status changes yet.
              </p>
            ) : (
              <ol className="divide-y border rounded-lg px-4">
                {detail.history.map((event) => (
                  <li
                    key={event.id}
                    className="py-4 flex flex-wrap items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {statusLabel(event.fromStatus)} →{" "}
                        {statusLabel(event.toStatus)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {date(event.createdAt)} ·{" "}
                        {event.emailSentAt
                          ? `Email sent ${date(event.emailSentAt)}`
                          : "Email pending"}
                      </p>
                      <p className="text-xs text-muted-foreground break-all">
                        {event.recipientEmail}
                      </p>
                    </div>
                    {!event.emailSentAt && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => retryEmail(event.id)}
                      >
                        {busy ? "Sending…" : "Retry email"}
                      </Button>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
