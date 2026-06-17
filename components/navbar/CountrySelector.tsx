import { Globe, Check } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COUNTRIES, useCurrency } from "@/contextCurrencyContext";

const CountrySelector = () => {
    const { country, setCountry } = useCurrency();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    className="flex items-center gap-1.5 text-primary-foreground/90 hover:text-primary-foreground transition-colors text-[10px] md:text-[11px] tracking-[0.15em] uppercase font-body"
                    aria-label="Select country and currency"
                >
                    <Globe size={12} />
                    <span>{country.flag}</span>
                    <span className="hidden sm:inline">{country.currency}</span>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 bg-background border-border">
                <DropdownMenuLabel className="text-[10px] tracking-[0.15em] uppercase font-body text-muted-foreground">
                    Ship to
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {COUNTRIES.map((c) => {
                    const active = c.code === country.code;
                    return (
                        <DropdownMenuItem
                            key={c.code}
                            onClick={() => setCountry(c.code)}
                            className="flex items-center justify-between gap-2 cursor-pointer font-body text-sm"
                        >
                            <span className="flex items-center gap-2">
                                <span className="text-base leading-none">{c.flag}</span>
                                <span className="text-foreground">{c.name}</span>
                            </span>
                            <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                {c.currency}
                                {active && <Check size={12} className="text-primary" />}
                            </span>
                        </DropdownMenuItem>
                    );
                })}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default CountrySelector;
