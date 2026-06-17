"use client"
import { forwardRef, useEffect, useState } from "react";
import { Play, Instagram, Youtube } from "lucide-react";


interface IGMedia {
    id: string;
    caption: string | null;
    media_type: string;
    media_url: string;
    thumbnail_url: string | null;
    permalink: string;
}

const ytWatchUrl = (v: any) =>
    v.isShort ? `https://youtube.com/shorts/${v.id}` : `https://youtu.be/${v.id}`;

const useInstagramMedia = () => {
    const [media, setMedia] = useState<IGMedia[]>([]);
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {

            } catch {
                /* noop — fallbacks will be used */
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);
    return media;
};

const Tile = ({ tile, featured = false }: { tile: any; featured?: boolean }) => {
    // Unified portrait aspect for clean alignment across all tiles
    const aspectCls = "aspect-[4/5]";
    const Icon = tile.source === "youtube" ? Youtube : Instagram;

    return (
        <a
            href={tile.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${tile.title} — open on ${tile.source === "youtube" ? "YouTube" : "Instagram"}`}
            className={`group relative block overflow-hidden rounded-md bg-muted shadow-md hover:shadow-xl transition-shadow ${aspectCls}`}
        >
            <div className="absolute inset-0 img-skeleton" aria-hidden />
            <img
                src={tile.thumb}
                alt={tile.title}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = "";
                }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/20 to-transparent" />

            <div className="absolute top-3 left-3 inline-flex items-center justify-center w-7 h-7 rounded-full bg-background/90 text-foreground">
                <Icon size={12} />
            </div>

            {tile.source === "youtube" && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className={`inline-flex items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-lg transition-transform duration-300 group-hover:scale-110 ${featured ? "w-14 h-14 md:w-16 md:h-16" : "w-10 h-10"}`}>
                        <Play size={featured ? 22 : 16} fill="currentColor" className="translate-x-0.5" />
                    </span>
                </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 p-3 md:p-5">
                <p className={`text-primary-foreground font-heading leading-tight ${featured ? "text-xl md:text-3xl" : "text-base md:text-lg"}`}>
                    {tile.title}
                </p>
                <p className="text-primary-foreground/70 text-[10px] tracking-[0.25em] uppercase font-body mt-1">
                    {tile.source === "youtube" ? "Watch on YouTube" : "View on Instagram"}
                </p>
            </div>
        </a>
    );
};

const WatchTheMaisonSection = forwardRef<HTMLElement>((_, ref) => {
    const enabled = true;
    const title = "The Privae Lens";
    const tagline = "A closer look — campaigns, fittings and the moments in between.";
    const igMedia = useInstagramMedia();

    if (!enabled) return null;




    return (
        <section ref={ref} className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                    <p className="eyebrow mb-3">Journal</p>
                    <h2 className="font-heading text-3xl md:text-5xl text-foreground heading-rule">
                        {title}
                    </h2>
                    {tagline && (
                        <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-body mt-4">
                            {tagline}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-5 max-w-5xl mx-auto">

                </div>

                <div className="mt-8 flex items-center justify-center gap-6">
                    <a
                        href={"https://www.youtube.com/@hausofprivae"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-primary hover:opacity-70 transition-opacity"
                    >
                        <Youtube size={14} /> YouTube
                    </a>
                    <a
                        href={"https://www.instagram.com/hausofprivae"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-primary hover:opacity-70 transition-opacity"
                    >
                        <Instagram size={14} /> Instagram
                    </a>
                </div>
            </div>
        </section>
    );
});

WatchTheMaisonSection.displayName = "WatchTheMaisonSection";

export default WatchTheMaisonSection;
