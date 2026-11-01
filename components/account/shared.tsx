"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
export async function accountRequest<T>(
  resource: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const response = await fetch(
    `/api/account/${resource}/`,
    body === undefined
      ? { cache: "no-store", redirect: "error" }
      : {
          method,
          redirect: "error",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
  );
  const payload = await response.json();
  if (!response.ok)
    throw new Error(payload.message || "Unable to load this account section.");
  if (body !== undefined && payload.success !== true)
    throw new Error(
      "Your changes were not confirmed. Please refresh and try again.",
    );
  return payload.data as T;
}
export function useAccount<T>(resource: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestVersion = useRef(0);
  const reload = useCallback(
    async (options: { throwOnError?: boolean } = {}) => {
      const version = ++requestVersion.current;
      try {
        setError("");
        const result = await accountRequest<T>(resource);
        if (version === requestVersion.current) setData(result);
        return result;
      } catch (failure) {
        if (version === requestVersion.current)
          setError(
            failure instanceof Error
              ? failure.message
              : "Unable to load this account section.",
          );
        if (options.throwOnError) throw failure;
      } finally {
        if (version === requestVersion.current) setLoading(false);
      }
    },
    [resource],
  );
  useEffect(() => {
    void reload();
    return () => {
      requestVersion.current++;
    };
  }, [reload]);
  return { data, setData, loading, error, reload };
}
export function AccountState({
  loading,
  error,
  retry,
  children,
}: {
  loading: boolean;
  error: string;
  retry: () => unknown;
  children: React.ReactNode;
}) {
  if (loading)
    return (
      <div role="status" className="text-center py-16 text-primary">
        <Loader2 size={25} className="animate-spin mx-auto" />
        <span className="sr-only">Loading your account</span>
      </div>
    );
  if (error)
    return (
      <div role="status" className="bg-card border border-border p-6 space-y-4">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button type="button" variant="outline" onClick={() => retry()}>
          Try again
        </Button>
      </div>
    );
  return <>{children}</>;
}
export function EmptyState({
  icon,
  title,
  body,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="text-center py-16 space-y-4 bg-card/30">
      <span className="inline-flex size-12 items-center justify-center text-primary">
        {icon}
      </span>
      <h2 className="font-heading text-2xl text-foreground">{title}</h2>
      <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
        {body}
      </p>
      {children}
    </div>
  );
}
export const accountAction =
  "inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 text-xs tracking-[0.15em] uppercase font-body disabled:opacity-50";
export function accountDate(value: string, time = false) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
    ...(time ? { hour: "2-digit", minute: "2-digit" } : {}),
  }).format(new Date(value));
}
export function accountMoney(amount: number) {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
export function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-card p-4 md:p-5">
      <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground font-body">
        {label}
      </p>
      <p className="font-heading text-2xl md:text-3xl mt-2">{value}</p>
    </div>
  );
}
