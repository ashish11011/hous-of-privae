import { ImgHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image with a couture shimmer skeleton placeholder until it loads.
 * Use anywhere we previously had a blank/grey aspect-ratio box waiting for an <img>.
 *
 * The wrapper element controls aspect-ratio + sizing via `wrapperClassName`.
 * The <img> is absolutely positioned to fill, fading in once decoded.
 */
interface ImageWithSkeletonProps extends ImgHTMLAttributes<HTMLImageElement> {
    /** Tailwind classes for the outer wrapper (aspect ratio, rounding, etc). */
    wrapperClassName?: string;
    /** How the image should fit the wrapper. */
    fit?: "cover" | "contain";
}

const ImageWithSkeleton = ({
    wrapperClassName,
    className,
    fit = "cover",
    onLoad,
    alt = "",
    ...imgProps
}: ImageWithSkeletonProps) => {
    const [loaded, setLoaded] = useState(false);

    return (
        <div className={cn("relative overflow-hidden", wrapperClassName)}>
            {!loaded && <div className="absolute inset-0 img-skeleton" aria-hidden="true" />}
            <img
                {...imgProps}
                alt={alt}
                loading={imgProps.loading ?? "lazy"}
                decoding={imgProps.decoding ?? "async"}
                onLoad={(e) => {
                    setLoaded(true);
                    onLoad?.(e);
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
