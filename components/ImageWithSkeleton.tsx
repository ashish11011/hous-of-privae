"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { convertS3ToImageKit } from "@/src/hepler/convertS3toImagekit";

/**
 * Image with a couture shimmer skeleton placeholder until it loads.
 * Use anywhere we previously had a blank/grey aspect-ratio box waiting for an <img>.
 *
 * The wrapper element controls aspect-ratio + sizing via `wrapperClassName`.
 * The <img> is absolutely positioned to fill, fading in once decoded.
 */
interface ImageWithSkeletonProps extends Omit<ImageProps, "src" | "alt" | "fill"> {
    src?: string | null;
    alt?: string;
    /** Tailwind classes for the outer wrapper (aspect ratio, rounding, etc). */
    wrapperClassName?: string;
    /** How the image should fit the wrapper. */
    fit?: "cover" | "contain";
}

const ImageWithSkeleton = ({
    wrapperClassName,
    className,
    fit = "cover",
    src,
    width,
    height,
    sizes = "(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw",
    onLoad,
    onError,
    alt = "",
    ...imgProps
}: ImageWithSkeletonProps) => {
    const imageSrc = convertS3ToImageKit(src);
    const isLocal = !src || (src.startsWith("/") && !src.startsWith("/haus-of-privae/") && !src.startsWith("/tr:"));
    // Track the source so reused search results reset their placeholder. Next's
    // Image also calls onLoad for images already cached before hydration.
    const [settledSrc, setSettledSrc] = useState<string | null>(null);
    const loaded = settledSrc === imageSrc;

    return (
        <div className={cn("relative overflow-hidden", wrapperClassName)}>
            {!loaded && <div className="absolute inset-0 img-skeleton" aria-hidden="true" />}
            <Image
                {...imgProps}
                key={imageSrc}
                src={imageSrc}
                alt={alt}
                fill
                sizes={sizes}
                unoptimized={imgProps.unoptimized ?? isLocal}
                loading={imgProps.loading ?? "lazy"}
                decoding={imgProps.decoding ?? "async"}
                onLoad={(e) => {
                    setSettledSrc(imageSrc);
                    onLoad?.(e);
                }}
                onError={(e) => {
                    // Show the alt text instead of leaving an endless shimmer.
                    setSettledSrc(imageSrc);
                    onError?.(e);
                }}
                className={cn(
                    "absolute inset-0 w-full h-full transition-opacity duration-500",
                    fit === "cover" ? "object-cover" : "object-contain",
                    loaded ? "opacity-100" : "opacity-0",
                    className,
                )}
            />
        </div>
    );
};

export default ImageWithSkeleton;
