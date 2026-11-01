"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import { accountRequest } from "./shared";
import { toast } from "sonner";
const ownerKey = "hop-wishlist-owner";
export default function AccountSync() {
  const { data: session, status } = useSession();
  const userId = (session as { id?: string } | null)?.id;
  useEffect(() => {
    if (status === "loading") return;
    const owner = localStorage.getItem(ownerKey);
    if (status === "unauthenticated") {
      if (owner) {
        userWishlistStore.setState({ productWishlist: [] });
        localStorage.removeItem(ownerKey);
      }
      return;
    }
    if (!userId) return;
    let cancelled = false;
    let unsubscribe: (() => void) | undefined;
    let timer: ReturnType<typeof setTimeout>;
    let baseline = new Set<string>();
    let saving = false;
    const initial = new Set(
      userWishlistStore.getState().productWishlist.map((item) => item.id),
    );
    if (owner && owner !== userId) {
      userWishlistStore.setState({ productWishlist: [] });
      initial.clear();
    }
    async function save() {
      if (cancelled || saving) return;
      const desired = new Set(
        userWishlistStore.getState().productWishlist.map((item) => item.id),
      );
      const add = [...desired].filter((id) => !baseline.has(id));
      const remove = [...baseline].filter((id) => !desired.has(id));
      if (!add.length && !remove.length) return;
      saving = true;
      try {
        await accountRequest("wishlist", { add, remove });
        baseline = desired;
        window.dispatchEvent(new Event("hop-wishlist-synced"));
      } catch {
        if (!cancelled)
          toast.error(
            "Wishlist changes could not sync. Your saved pieces are still on this device.",
          );
      } finally {
        saving = false;
        const current = new Set(
          userWishlistStore.getState().productWishlist.map((item) => item.id),
        );
        if (
          !cancelled &&
          (current.size !== desired.size ||
            [...current].some((id) => !desired.has(id)))
        )
          timer = setTimeout(() => void save(), 500);
      }
    }
    void (async () => {
      try {
        const server = await accountRequest<{ ids: string[] }>("wishlist");
        if (cancelled) return;
        const current = new Set(
          userWishlistStore.getState().productWishlist.map((item) => item.id),
        );
        const add =
          owner === userId
            ? [...current].filter((id) => !initial.has(id))
            : [...current];
        const remove =
          owner === userId ? [...initial].filter((id) => !current.has(id)) : [];
        const merged =
          add.length || remove.length
            ? await accountRequest<{ ids: string[] }>("wishlist", {
                add,
                remove,
              })
            : server;
        if (cancelled) return;
        baseline = new Set(merged.ids);
        const latest = new Set(
          userWishlistStore.getState().productWishlist.map((item) => item.id),
        );
        const next = new Set(merged.ids);
        for (const id of latest) if (!current.has(id)) next.add(id);
        for (const id of current) if (!latest.has(id)) next.delete(id);
        userWishlistStore.setState({
          productWishlist: [...next].map((id) => ({ id })),
        });
        localStorage.setItem(ownerKey, userId);
        unsubscribe = userWishlistStore.subscribe(() => {
          clearTimeout(timer);
          timer = setTimeout(() => void save(), 400);
        });
        window.dispatchEvent(new Event("hop-wishlist-synced"));
        void save();
      } catch {
        /* The local wishlist remains usable while the account schema is pending. */
      }
    })();
    return () => {
      cancelled = true;
      unsubscribe?.();
      clearTimeout(timer);
    };
  }, [status, userId]);
  useEffect(() => {
    if (status === "loading") return;
    const code = new URLSearchParams(window.location.search).get("ref");
    let cancelled = false;
    void (async () => {
      try {
        if (code && /^[a-f0-9]{16}$/i.test(code))
          await fetch("/api/referrals/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code }),
          });
        if (status === "authenticated" && !cancelled)
          await fetch("/api/referrals/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ claim: true }),
          });
      } catch {
        /* A referral lookup must not interrupt browsing or sign-in. */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [status, userId]);
  return null;
}
