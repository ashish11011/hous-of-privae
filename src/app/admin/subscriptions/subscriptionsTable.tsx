"use client";

import ShadcnPagination from "@/components/pagination";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PAGINATION_LIMIT } from "@/const";
import { Download } from "lucide-react";
import { useRouter } from "next/navigation";

interface Subscription {
  id: string;
  email: string;
  createdAt: Date | string | null;
}

interface SubscriptionsTableProps {
  subscriptions: Subscription[];
  exportSubscriptions: Subscription[];
  total?: number;
  currentPage?: number;
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function formatDate(value: Date | string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString();
}

export default function SubscriptionsTable({
  subscriptions,
  exportSubscriptions,
  total = 0,
  currentPage = 1,
}: SubscriptionsTableProps) {
  const router = useRouter();
  const totalPages = Math.ceil(total / PAGINATION_LIMIT);

  function exportCsv() {
    const rows = [
      ["Email", "Subscribed At"],
      ...exportSubscriptions.map((subscription) => [
        subscription.email,
        subscription.createdAt
          ? new Date(subscription.createdAt).toISOString()
          : "",
      ]),
    ];
    const csv = rows
      .map((row) => row.map((cell) => csvEscape(cell)).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `haus-of-privae-subscriptions-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Subscriptions</h1>
          <p className="text-sm text-muted-foreground">
            {total} newsletter email{total === 1 ? "" : "s"} collected.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={exportCsv}
          disabled={exportSubscriptions.length === 0}
        >
          <Download size={14} />
          Export Emails
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subscribed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-8">
                  No subscriptions yet.
                </TableCell>
              </TableRow>
            ) : (
              subscriptions.map((subscription, idx) => (
                <TableRow key={subscription.id}>
                  <TableCell>
                    {(currentPage - 1) * PAGINATION_LIMIT + idx + 1}
                  </TableCell>
                  <TableCell>{subscription.email}</TableCell>
                  <TableCell>{formatDate(subscription.createdAt)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <ShadcnPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) =>
              router.push(`/admin/subscriptions?page=${page}`)
            }
          />
        )}
      </div>
    </div>
  );
}
