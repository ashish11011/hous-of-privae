"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Heart, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useStore, userWishlistStore } from "@/src/hepler/store/zustand";
import { useCurrency } from "@/contextCurrencyContext";
import { getProductFromIds } from "@/src/hepler/order/getPorductFromids";
import { productHref } from "@/lib/productAdapter";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

type SavedProduct = Awaited<ReturnType<typeof getProductFromIds>>[number];
const actionClass = "flex min-h-11 w-full items-center justify-center bg-primary px-4 py-3 text-center text-[10px] uppercase tracking-[0.2em] text-primary-foreground hover:bg-primary/90";

export default function ShoppingPanel({ kind, children }: { kind: "cart" | "wishlist"; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { productStore: cart, increaseQuantity, decreaseQuantity, removeItemFromStore } = useStore();
  const { productWishlist, removeItemFromWishlist } = userWishlistStore();
  const { format } = useCurrency();
  const [saved, setSaved] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [retry, setRetry] = useState(0);
  const isCart = kind === "cart";
  const count = isCart ? cart.reduce((sum, item) => sum + item.quantity, 0) : productWishlist.length;
  const subtotal = cart.reduce((sum, item) => sum + item.basePrice * item.quantity, 0);

  useEffect(() => {
    if (!open || isCart) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    getProductFromIds(productWishlist.map(item => item.id))
      .then(items => { if (!cancelled) setSaved(items); })
      .catch(() => { if (!cancelled) setError(true); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, isCart, productWishlist, retry]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="w-full sm:max-w-[450px] gap-0 border-[#e2d9d1] bg-[#f8f5f1] text-[#302725]">
        <SheetHeader className="shrink-0 border-b border-[#e2d9d1] px-6 py-7">
          <p className="text-[9px] uppercase tracking-[0.35em] text-[#ad8649]">{isCart ? "Your selection" : "Your edit"}</p>
          <SheetTitle className="mt-2 font-heading text-2xl text-[#302725]">
            {isCart ? "The Bag" : "Wishlist"} <span className="font-body text-sm text-neutral-500">({count})</span>
          </SheetTitle>
          <SheetDescription className="sr-only">{isCart ? "Review your bag and continue to checkout." : "Your saved pieces. Choose a piece to select its size and add it to your bag."}</SheetDescription>
        </SheetHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-8">
          {count === 0 ? (
            <div className="flex h-full min-h-52 flex-col items-center justify-center gap-5 text-center">
              {isCart ? <ShoppingBag className="size-8 text-[#ad8649]" strokeWidth={1} /> : <Heart className="size-8 text-[#ad8649]" strokeWidth={1} />}
              <h3 className="font-heading text-xl">{isCart ? "Your bag is empty" : "Your wishlist awaits"}</h3>
              <p className="max-w-64 text-sm leading-relaxed text-neutral-500">{isCart ? "Discover a piece to make your own." : "Save the pieces you love and return when the occasion calls."}</p>
              <SheetClose asChild><Link href="/product" className="border-b border-primary pb-1 text-[10px] uppercase tracking-[0.2em] text-primary">Explore collection</Link></SheetClose>
            </div>
          ) : isCart ? (
            <ul className="space-y-7">
              {cart.map(item => (
                <li key={JSON.stringify([item.id, item.variantId, item.size, item.color, item.variant])} className="flex gap-4">
                  <SheetClose asChild><Link href={productHref(item)} className="w-20 shrink-0">
                    <ImageWithSkeleton src={item.bannerImage} alt={item.name ?? "Saved piece"} wrapperClassName="h-28 w-20" fit="cover" />
                  </Link></SheetClose>
                  <div className="min-w-0 flex-1">
                    <SheetClose asChild><Link href={productHref(item)} className="font-heading text-base">{item.name}</Link></SheetClose>
                    <p className="mt-1 text-[11px] leading-relaxed text-neutral-500">{[item.variant === "unstitched" ? null : item.size, item.color, item.variant ?? "stitched"].filter(Boolean).join(" · ")}</p>
                    <p className="mt-2 text-xs text-primary">{format(item.basePrice * item.quantity)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-3">
                      <div className="flex items-center border border-[#ded5cd]">
                        <button type="button" aria-label={`Decrease quantity of ${item.name}`} disabled={item.quantity <= 1} onClick={() => decreaseQuantity(item)} className="flex size-8 items-center justify-center disabled:opacity-30"><Minus size={12} /></button>
                        <span aria-live="polite" className="min-w-5 text-center text-xs">{item.quantity}</span>
                        <button type="button" aria-label={`Increase quantity of ${item.name}`} onClick={() => increaseQuantity(item)} className="flex size-8 items-center justify-center"><Plus size={12} /></button>
                      </div>
                      <button type="button" onClick={() => removeItemFromStore(item)} aria-label={`Remove ${item.name} from bag`} className="flex min-h-8 items-center gap-1 text-[11px] text-neutral-500 hover:text-primary"><Trash2 size={12} /> Remove</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : loading ? <p role="status" className="text-sm text-neutral-500">Loading your wishlist…</p>
            : error ? <div role="alert" className="space-y-3 text-sm"><p>We couldn’t load your wishlist.</p><button onClick={() => setRetry(value => value + 1)} className="underline">Try again</button></div>
            : <ul className="space-y-7">
              {productWishlist.map(({ id }) => {
                const item = saved.find(product => product.wishlistKey === id);
                if (!item) return <li key={id} className="text-sm text-neutral-500">This saved piece is no longer available. <button onClick={() => removeItemFromWishlist(id)} className="underline">Remove</button></li>;
                return <li key={id} className="flex gap-4">
                  <SheetClose asChild><Link href={productHref(item)} className="w-20 shrink-0"><ImageWithSkeleton src={item.bannerImage} alt={item.name ?? "Saved piece"} wrapperClassName="h-28 w-20" fit="cover" /></Link></SheetClose>
                  <div className="min-w-0 flex-1">
                    <SheetClose asChild><Link href={productHref(item)} className="font-heading text-base">{item.name}</Link></SheetClose>
                    <p className="mt-1 text-[11px] text-neutral-500">{item.colors?.join(" · ")}</p>
                    <p className="mt-2 text-xs text-primary">{format(item.basePrice ?? 0)}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-4">
                      <SheetClose asChild><Link href={productHref(item)} className="border-b border-primary text-[10px] uppercase tracking-widest text-primary">Choose options</Link></SheetClose>
                      <button onClick={() => removeItemFromWishlist(id)} aria-label={`Remove ${item.name} from wishlist`} className="flex min-h-8 items-center gap-1 text-[11px] text-neutral-500"><Trash2 size={12} /> Remove</button>
                    </div>
                  </div>
                </li>;
              })}
            </ul>}
        </div>

        {count > 0 && <SheetFooter className="shrink-0 border-t border-[#e2d9d1] px-6 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
          {isCart ? <>
            <div className="mb-2 flex justify-between text-sm"><span className="text-neutral-500">Subtotal</span><span aria-live="polite">{format(subtotal)}</span></div>
            <p className="mb-3 text-[11px] text-neutral-500">Shipping and discounts calculated at checkout.</p>
            <SheetClose asChild><Link href="/checkout" className={actionClass}>Proceed to checkout</Link></SheetClose>
          </> : <SheetClose asChild><Link href="/product" className={actionClass}>Continue exploring</Link></SheetClose>}
        </SheetFooter>}
      </SheetContent>
    </Sheet>
  );
}
