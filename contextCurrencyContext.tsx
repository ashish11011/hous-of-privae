"use client"
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";

/**
 * All product prices are authored in INR. Other currencies are derived using
 * a fixed conversion rate (approximate, for display only).
 *
 * International orders also have:
 *   - a per-region shipping fee at prevailing courier rates (USD)
 *   - free shipping when order subtotal ≥ USD 200 equivalent
 */

export type CurrencyCode = "INR" | "USD" | "GBP" | "EUR" | "AED" | "AUD" | "CAD" | "SGD";

export interface Country {
    code: string; // ISO-3166 alpha-2
    name: string;
    flag: string; // emoji
    currency: CurrencyCode;
    /** 1 INR = rate × currency. Approximate display rates. */
    rate: number;
    symbol: string;
    isInternational: boolean;
    /** Flat shipping fee charged in USD for this region (prevailing rate). 0 = free / domestic. */
    shippingFeeUSD: number;
}

export const COUNTRIES: Country[] = [
    { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", rate: 1, symbol: "₹", isInternational: false, shippingFeeUSD: 0 },
    { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", rate: 0.012, symbol: "$", isInternational: true, shippingFeeUSD: 35 },
    { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", rate: 0.0095, symbol: "£", isInternational: true, shippingFeeUSD: 30 },
    { code: "EU", name: "Europe (EUR)", flag: "🇪🇺", currency: "EUR", rate: 0.011, symbol: "€", isInternational: true, shippingFeeUSD: 30 },
    { code: "AE", name: "UAE", flag: "🇦🇪", currency: "AED", rate: 0.044, symbol: "د.إ", isInternational: true, shippingFeeUSD: 20 },
    { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", rate: 0.018, symbol: "A$", isInternational: true, shippingFeeUSD: 40 },
    { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", rate: 0.016, symbol: "C$", isInternational: true, shippingFeeUSD: 35 },
    { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", rate: 0.016, symbol: "S$", isInternational: true, shippingFeeUSD: 25 },
];

/** Markup applied on top of INR price for international orders (covers duties, FX, handling). */
export const INTERNATIONAL_MARKUP = 1.5;
/** Free shipping threshold for international orders, in USD. */
export const INTERNATIONAL_FREE_SHIPPING_USD = 200;
/** Default international shipping fee (USD), shown when subtotal < free threshold. */
export const INTERNATIONAL_SHIPPING_USD = 25;

interface CurrencyContextValue {
    country: Country;
    setCountry: (code: string) => void;
    /** Convert an INR price to the currently selected currency (with markup if international). */
    convert: (inr: number) => number;
    /** Format an INR price using the selected currency. */
    format: (inr: number) => string;
    /** Format a value already in the selected currency. */
    formatNative: (amount: number) => string;
    isInternational: boolean;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

const STORAGE_KEY = "hop-country-code";

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
    const [code, setCode] = useState<string>(() => {
        if (typeof window === "undefined") return "IN";
        return window.localStorage.getItem(STORAGE_KEY) ?? "IN";
    });

    useEffect(() => {
        if (typeof window !== "undefined") {
            window.localStorage.setItem(STORAGE_KEY, code);
        }
    }, [code]);

    const country = useMemo(() => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0], [code]);

    const value = useMemo<CurrencyContextValue>(() => {
        const convert = (inr: number) => {
            const base = country.isInternational ? inr * INTERNATIONAL_MARKUP : inr;
            return base * country.rate;
        };
        const formatNative = (amount: number) => {
            // Use Intl for correct symbol placement, grouping and decimals per currency.
            try {
                const locale =
                    country.currency === "INR" ? "en-IN" :
                        country.currency === "GBP" ? "en-GB" :
                            country.currency === "EUR" ? "en-IE" :
                                country.currency === "AED" ? "en-AE" :
                                    country.currency === "AUD" ? "en-AU" :
                                        country.currency === "CAD" ? "en-CA" :
                                            country.currency === "SGD" ? "en-SG" :
                                                "en-US";
                const useDecimals = country.currency !== "INR" && amount < 100;
                return new Intl.NumberFormat(locale, {
                    style: "currency",
                    currency: country.currency,
                    minimumFractionDigits: useDecimals ? 2 : 0,
                    maximumFractionDigits: useDecimals ? 2 : 0,
                    currencyDisplay: "symbol",
                }).format(useDecimals ? Math.round(amount * 100) / 100 : Math.round(amount));
            } catch {
                return `${country.symbol}${Math.round(amount).toLocaleString("en-US")}`;
            }
        };
        const format = (inr: number) => formatNative(convert(inr));
        return {
            country,
            setCountry: setCode,
            convert,
            format,
            formatNative,
            isInternational: country.isInternational,
        };
    }, [country]);

    return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
};

export const useCurrency = () => {
    const ctx = useContext(CurrencyContext);
    if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
    return ctx;
};
