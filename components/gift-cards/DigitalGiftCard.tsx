import { Gift } from "lucide-react";

type Props = {
  amount: number;
  recipientName?: string;
  senderName?: string;
  message?: string;
  suffix?: string | null;
  status?: "preview" | "pending" | "active" | "spent";
  compact?: boolean;
};
export default function DigitalGiftCard({
  amount,
  recipientName,
  senderName,
  message,
  suffix,
  status = "preview",
  compact = false,
}: Props) {
  return (
    <div
      className="relative isolate aspect-[1.586/1] w-full overflow-hidden rounded-sm bg-primary text-primary-foreground shadow-xl"
      aria-label={`Privae Experience gift card for ${recipientName || "someone special"}`}
    >
      <img
        src="/gift-cards/paper-relief.png"
        alt=""
        className="absolute inset-0 z-0 h-full w-full scale-[1.03] object-cover opacity-30 contrast-200 mix-blend-soft-light"
        width={1536}
        height={1024}
      />
      <div className="absolute inset-3 z-10 border border-gold/55 md:inset-4" />
      <div className="absolute inset-[0.95rem] z-10 border border-white/15 md:inset-[1.2rem]" />
      <div
        className={`relative z-20 flex h-full flex-col justify-between ${compact ? "p-6" : "p-7 sm:p-9"}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-body text-[8px] font-medium uppercase tracking-[0.28em] text-gold sm:text-[10px]">
              Haus of Privae
            </p>
            <h3
              className={`mt-1 font-heading leading-none ${compact ? "text-2xl" : "text-3xl sm:text-4xl"}`}
            >
              Privae Experience
            </h3>
          </div>
          <span className="flex size-8 sm:size-10 shrink-0 items-center justify-center rounded-full border border-gold/60 text-gold">
            <Gift size={compact ? 14 : 17} strokeWidth={1.25} />
          </span>
        </div>
        <div className="min-h-0">
          <p className="font-body text-[8px] uppercase tracking-[0.24em] text-white/60 sm:text-[9px]">
            For
          </p>
          <p
            className={`truncate font-heading ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}
          >
            {recipientName?.trim() || "Someone special"}
          </p>
          {message?.trim() && (
            <p className="mt-1 line-clamp-2 max-w-[90%] font-heading text-xs italic leading-snug text-white/80 sm:text-sm">
              “{message.trim()}”
            </p>
          )}
        </div>
        <div className="flex items-end justify-between gap-3 border-t border-gold/40 pt-3">
          <div className="min-w-0">
            <p className="font-body text-[8px] uppercase tracking-[0.22em] text-white/55">
              Gift value
            </p>
            <p
              className={`font-heading text-gold ${compact ? "text-xl" : "text-2xl sm:text-3xl"}`}
            >
              {amount > 0
                ? `₹${amount.toLocaleString("en-IN")}`
                : "Your chosen value"}
            </p>
            {senderName?.trim() && (
              <p className="mt-0.5 truncate font-body text-[8px] text-white/65 sm:text-[9px]">
                From {senderName.trim()}
              </p>
            )}
          </div>
          <div className="shrink-0 text-right">
            <p className="font-body text-[8px] uppercase tracking-[0.18em] text-white/55">
              Digital gift card
            </p>
            <p className="mt-1 font-body text-[9px] text-white sm:text-[10px]">
              {status === "pending"
                ? "Awaiting activation"
                : status === "spent"
                  ? "Beautifully spent"
                  : suffix
                    ? `•••• ${suffix}`
                    : "Made for someone special"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
