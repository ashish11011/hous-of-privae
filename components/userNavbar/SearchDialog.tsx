"use client"
import { useEffect, useMemo, useState } from "react";

import { Search, X } from "lucide-react";
import { useCurrency } from "@/contextCurrencyContext";

interface SearchDialogProps {
    open: boolean;
    onClose: () => void;
}

const SearchDialog = ({ open, onClose }: SearchDialogProps) => {
    const [q, setQ] = useState("");
    const { format } = useCurrency();

    useEffect(() => {
        if (!open) setQ("");
    }, [open]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [open, onClose]);

    const results = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return [];
        // return products
        //   .filter((p) => {
        //     const haystack = [p.name, p.fabric, p.color, p.occasion, p.work, p.category]
        //       .filter(Boolean)
        //       .join(" ")
        //       .toLowerCase();
        //     return haystack.includes(term);
        //   })
        //   .slice(0, 8);
    }, [q]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] bg-foreground/40 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fade-in-up" onClick={onClose}>
            <div className="bg-background w-full max-w-2xl shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                    <Search size={18} className="text-primary" />
                    <input
                        autoFocus
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search by name, fabric, colour, occasion…"
                        className="flex-1 bg-transparent outline-none text-sm font-body text-foreground placeholder:text-muted-foreground"
                    />
                    <button onClick={onClose} className="text-muted-foreground hover:text-foreground" aria-label="Close search">
                        <X size={18} />
                    </button>
                </div>
                {/* <div className="max-h-[60vh] overflow-y-auto">
          {q.trim() && results.length === 0 && (
            <p className="px-5 py-10 text-center text-sm font-body text-muted-foreground">No matches for "{q}".</p>
          )}
          {!q.trim() && (
            <div className="px-5 py-8 text-sm font-body text-muted-foreground space-y-2">
              <p className="text-[10px] tracking-[0.25em] uppercase text-primary">Try searching</p>
              <div className="flex flex-wrap gap-2">
                {["Saree", "Sharara", "Lilac", "Bridal", "Chanderi", "Zardozi"].map((t) => (
                  <button key={t} onClick={() => setQ(t)} className="px-3 py-1 bg-secondary text-foreground text-xs hover:bg-primary hover:text-primary-foreground transition-colors">
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
          {results.map((p) => (
            <Link
              key={p.id}
              to={`/product/${p.id}`}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/40 border-b border-border last:border-0"
            >
              <img src={p.image} alt={p.name} className="w-12 h-16 object-cover bg-secondary" />
              <div className="flex-1 min-w-0">
                <p className="font-heading text-sm text-foreground truncate">{p.name}</p>
                <p className="text-[11px] font-body text-muted-foreground truncate">{p.fabric} · {p.color}</p>
              </div>
              <p className="text-sm font-body text-primary whitespace-nowrap">{format(p.price)}</p>
            </Link>
          ))}
        </div> */}
            </div>
        </div>
    );
};

export default SearchDialog;
