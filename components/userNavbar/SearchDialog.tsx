"use client";
import { productHref } from "@/lib/productAdapter";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { useCurrency } from "@/contextCurrencyContext";
import ImageWithSkeleton from "../ImageWithSkeleton";
import { convertS3ToImageKit } from "@/src/hepler";

interface SearchDialogProps {
  open: boolean;
  onClose: () => void;
}

type SearchProduct = {
  id: string;
  variantId?: string | null;
  name: string;
  slug: string;
  sku?: string | null;
  fabric?: string | null;
  bannerImage?: string | null;
  basePrice?: number | null;
  colors?: string[] | null;
};

const quickSearches = [
  "Saree",
  "Sharara",
  "Chanderi",
  "Zardozi",
  "Occasion Wear",
  "Ready To Wear",
];

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { format } = useCurrency();

  useEffect(() => {
    if (!open) {
      setQ("");
      setResults([]);
    }
  }, [open]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    if (open) window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);

      try {
        const params = new URLSearchParams({
          q: q.trim(),
          limit: "8",
        });
        const response = await fetch(`/api/products/search?${params}`, {
          signal: controller.signal,
        });
        const payload = await response.json();

        if (!controller.signal.aborted) {
          setResults(Array.isArray(payload.products) ? payload.products : []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setResults([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [open, q]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = q.trim();

    if (!term) return;

    onClose();
    router.push(`/search?search=${encodeURIComponent(term)}`);
  }

  if (!open) return null;

  const hasQuery = q.trim().length > 0;

  return (
    <div
      className="fixed inset-0 z-[100] bg-white/95 flex items-start justify-center pt-20 px-4 animate-fade-in-up"
      onClick={onClose}
    >
      <div
        className="bg-white text-neutral-950 w-full max-w-2xl border border-neutral-900 shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-3 px-4 py-3 border-b border-neutral-900 bg-white"
        >
          <Search size={18} className="text-neutral-950" />
          <input
            autoFocus
            type="text"
            value={q}
            onChange={(event) => setQ(event.target.value)}
            placeholder="Search by name, fabric, colour, occasion..."
            className="flex-1 bg-white outline-none text-sm font-body text-neutral-950 placeholder:text-neutral-500"
          />
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-950"
            aria-label="Close search"
          >
            <X size={18} />
          </button>
        </form>

        <div className="max-h-[68vh] overflow-y-auto">
          <div className="px-5 py-5 border-b border-neutral-200">
            <p className="text-[10px] tracking-[0.25em] uppercase text-primary">
              Try searching
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickSearches.map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQ(term)}
                  className="border border-neutral-200 px-3 py-1.5 text-xs text-neutral-700 hover:border-primary hover:text-primary transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>

          <div className="px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[10px] tracking-[0.25em] uppercase text-neutral-500">
                {hasQuery ? "Search results" : "Suggestions"}
              </p>
              {loading && (
                <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">
                  Searching
                </span>
              )}
            </div>

            {!loading && hasQuery && results.length === 0 && (
              <p className="py-8 text-center text-sm font-body text-neutral-500">
                No matches for &quot;{q.trim()}&quot;.
              </p>
            )}

            <div className="grid gap-2">
              {results.map((product) => (
                <Link
                  key={product.variantId ?? product.id}
                  href={productHref(product)}
                  onClick={onClose}
                  className="flex items-center gap-3 border border-neutral-200 p-2 hover:border-primary transition-colors"
                >
                  <ImageWithSkeleton
                    src={convertS3ToImageKit(product.bannerImage)}
                    alt={product.name}
                    wrapperClassName="h-16 w-12 shrink-0 bg-neutral-100"
                    fit="cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-heading text-sm text-neutral-900">
                      {product.name}
                    </p>
                    <p className="truncate text-[11px] text-neutral-500">
                      {[product.fabric, product.sku].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-xs text-primary">
                    {format(product.basePrice ?? 0)}
                  </p>
                </Link>
              ))}
            </div>

            {hasQuery && results.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push(`/search?search=${encodeURIComponent(q.trim())}`);
                }}
                className="mt-4 w-full border border-neutral-900 px-4 py-3 text-xs uppercase tracking-[0.2em] text-neutral-900 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                View all results
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
