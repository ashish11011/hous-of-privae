"use client";

import { Check, Gift } from "lucide-react";
import { useStore } from "@/src/hepler/store/zustand";
import { GIFT_WRAP_NOTE_LIMIT } from "@/lib/giftWrap";
import { cn } from "@/lib/utils";

export default function GiftWrapOption({
  compact = false,
  disabled = false,
  priceLabel = "₹500",
}: {
  compact?: boolean;
  disabled?: boolean;
  priceLabel?: string;
}) {
  const { giftWrap, giftWrapNote, setGiftWrap, setGiftWrapNote } = useStore();
  const selectedClass = giftWrap
    ? "border-[#ce9c33] bg-[#ce9c33]/[0.08]"
    : "border-[#e2d9d1]";

  if (compact)
    return (
      <button
        type="button"
        aria-pressed={giftWrap}
        disabled={disabled}
        onClick={() => setGiftWrap(!giftWrap)}
        className={cn(
          "mb-4 flex min-h-10 w-full items-center gap-2 border px-3 py-2 text-left disabled:opacity-50",
          selectedClass,
        )}
      >
        <Gift size={13} className="shrink-0 text-[#ce9c33]" />
        <span className="text-[10px] uppercase tracking-[0.2em]">
          Gift wrap
        </span>
        <span className="text-[10px] text-[#ce9c33]">{priceLabel}</span>
        {giftWrap && (
          <Check
            size={13}
            className="ml-auto text-[#ce9c33]"
            aria-hidden="true"
          />
        )}
      </button>
    );

  return (
    <section
      className="border border-[#e2d9d1] bg-[#f5f1eb] p-4"
      aria-labelledby="gift-wrap-heading"
    >
      <div className="mb-4 flex items-center gap-3">
        {/* <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-[#ce9c33] text-xs text-primary" aria-hidden="true">3</span> */}
        <h2 id="gift-wrap-heading" className="font-heading text-2xl">
          Gift wrapping
        </h2>
      </div>
      <div>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={giftWrap}
            disabled={disabled}
            onChange={(event) => setGiftWrap(event.target.checked)}
            className="mt-1 size-4 shrink-0 accent-[#ce9c33]"
          />
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <Gift size={13} className="text-[#ce9c33]" />
              <span className="text-[10px] uppercase tracking-[0.18em]">
                Gift wrap this order
              </span>
              <span className="text-[10px] text-[#ce9c33]">{priceLabel}</span>
            </span>
            <span className="mt-1 block text-xs leading-relaxed text-neutral-500">
              Wrapped in our cream-and-gold signature paper, finished with a
              hand-tied satin ribbon and an envelope for your note.
            </span>
          </span>
        </label>
        {giftWrap && (
          <div className="mt-5 sm:ml-7">
            <label
              htmlFor="gift-wrap-note"
              className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[9px] text-neutral-500"
            >
              <span className="uppercase tracking-[0.2em]">
                Handwritten note
              </span>
              <span>
                (optional · {GIFT_WRAP_NOTE_LIMIT - giftWrapNote.length}{" "}
                characters left)
              </span>
            </label>
            <textarea
              id="gift-wrap-note"
              value={giftWrapNote}
              maxLength={GIFT_WRAP_NOTE_LIMIT}
              disabled={disabled}
              onChange={(event) => setGiftWrapNote(event.target.value)}
              rows={3}
              placeholder="A few words for the recipient — written by hand on Privae stationery."
              className="mt-2 block w-full resize-y border border-[#e2d9d1] bg-[#f8f5f1] px-3 py-2 text-sm leading-relaxed placeholder:text-neutral-400 focus-visible:outline-[#ce9c33] disabled:opacity-50"
            />
          </div>
        )}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
        Your selection is recorded on the order and passed to the atelier
        packing team.
      </p>
    </section>
  );
}
