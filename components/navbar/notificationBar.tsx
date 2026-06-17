"use client"
import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import CountrySelector from "./CountrySelector";
import { useCurrency } from "@/contextCurrencyContext";

interface NotificationBarProps {
    messages?: string[];
}

interface Announcement {
    message: string;
    audience: "all" | "india" | "international";
}

const FALLBACK_INDIA = [
    "Aarambh Collection · Now Live",
    "Complimentary Shipping Across India",
    "Handcrafted in Jaipur",
];
const FALLBACK_INTL = [
    "Aarambh Collection · Now Live",
    "Worldwide Delivery Available",
    "Handcrafted in India",
];

const NotificationBar = ({ messages }: NotificationBarProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [announcements, setAnnouncements] = useState<Announcement[] | null>(null);
    const { isInternational } = useCurrency();

    useEffect(() => {
        let cancelled = false;
        (async () => {
        })();
        return () => {
            cancelled = true;
        };
    }, []);

    const rotation = useMemo(() => {
        if (messages && messages.length > 0) return messages;
        if (announcements && announcements.length > 0) {
            const filtered = announcements.filter((a) =>
                a.audience === "all" || a.audience === (isInternational ? "international" : "india"),
            );
            if (filtered.length > 0) return filtered.map((a) => a.message);
        }
        return isInternational ? FALLBACK_INTL : FALLBACK_INDIA;
    }, [messages, announcements, isInternational]);

    useEffect(() => {
        setCurrentIndex(0);
    }, [rotation]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % rotation.length);
        }, 4000);
        return () => clearInterval(timer);
    }, [rotation.length]);

    if (!isVisible) return null;

    return (
        <div className="bg-primary relative">
            <div className="container mx-auto px-4 flex items-center justify-between py-2 md:py-2.5 gap-3">
                <div className="w-12 md:w-24" aria-hidden />
                <p className="flex-1 text-center text-[10px] md:text-xs tracking-[0.2em] uppercase font-body text-primary-foreground transition-opacity duration-500 truncate">
                    {rotation[currentIndex]}
                </p>
                <div className="flex items-center gap-3 md:gap-4">
                    <CountrySelector />
                    <button
                        onClick={() => setIsVisible(false)}
                        className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <X size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationBar;
