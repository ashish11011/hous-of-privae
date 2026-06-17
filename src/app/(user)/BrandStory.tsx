"use client"
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface Pillar {
    id: string;
    title: string;
    subtitle: string;
    image_url: string;
}

const BrandStorySection = () => {
    const [stories, setStories] = useState<Pillar[]>([
        {
            "id": "d9cc3f11-0192-47d9-80b3-8a052940d816",
            "title": "Consciously Crafted",
            "subtitle": "Every piece is made using premium home grown fabric — soft on you and the planet.",
            "image_url": "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/brand-consciously-crafted-DByNvh-q.jpg"
        },
        {
            "id": "6f873e2d-761c-4ebd-bdc2-e4d7722af8d1",
            "title": "Fast & Reliable Delivery",
            "subtitle": "From our studio to your wardrobe — enjoy quick, seamless and safe delivery.",
            "image_url": "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/brand-delivery-D_6vb1Fb.jpg"
        },
        {
            "id": "175968ad-3d63-46bf-a910-958da404a1ea",
            "title": "Bespoke Tailoring",
            "subtitle": "Every silhouette is refined to your measure — where craftsmanship meets quiet luxury.",
            "image_url": "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/brand-tailoring-MRavwXb5.jpg"
        },
        {
            "id": "355cb64d-b5ce-4312-84e3-7e2b5567dcd9",
            "title": "Proudly Indian",
            "subtitle": "Born in India, made for everybody — every thread reflects local craftsmanship and care.",
            "image_url": "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/brand-proudly-indian-BO5W4sP8.jpg"
        }
    ]);

    useEffect(() => {
        let cancelled = false;

        return () => {
            cancelled = true;
        };
    }, []);

    if (stories.length === 0) return null;

    return (
        <section className="py-16 md:py-24 bg-background">
            <div className="container mx-auto px-4">
                <div className="text-center mb-10">
                    <p className="eyebrow mb-3">What sets us apart</p>
                    <h2 className="font-body text-2xl md:text-4xl font-semibold text-foreground tracking-wide uppercase heading-rule">
                        The Privae Promise
                    </h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-6">
                    {stories.map((story) => (
                        <div key={story.id} className="group relative overflow-hidden aspect-[3/4]">
                            <ImageWithSkeleton
                                wrapperClassName="absolute inset-0 w-full h-full"
                                src={story.image_url}
                                alt={story.title}
                                className="transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default BrandStorySection;


const ImageWithSkeleton = ({
    wrapperClassName,
    className,
    fit = "cover",
    onLoad,
    alt = "",
    ...imgProps
}: any) => {
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
