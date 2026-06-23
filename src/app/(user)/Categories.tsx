"use client"

import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { CATEGORY_1 } from "@/const";
import Link from "next/link";

export function Categories() {
    return (
        <section className="py-16 md:py-24 px-4">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <p className="eyebrow mb-3">Curated for every occasion</p>
                    <h2 className="font-heading text-3xl md:text-5xl text-foreground heading-rule">
                        Shop by Category
                    </h2>
                    <div className="section-rule my-2" />
                </div>
                <div className=" grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-5">
                    {CATEGORY_1.map((cat, idx) => {
                        return (
                            <Link
                                key={cat.slug}
                                href={`/category/${cat.slug}`}
                                className="group relative overflow-hidden aspect-[3/4] bg-secondary"
                            >
                                <ImageWithSkeleton
                                    wrapperClassName="absolute inset-0 w-full h-full"
                                    src={cat.image}
                                    alt={cat.name}
                                    width={640}
                                    height={800}
                                    className="transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent group-hover:from-foreground/80 transition-colors duration-300" />

                                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                                    <h3 className="font-heading text-lg md:text-xl text-primary-foreground truncate">
                                        {cat.name}
                                    </h3>
                                    {cat.tagline && (
                                        <p className="text-primary-foreground/80 text-[10px] tracking-[0.18em] uppercase font-body mt-1 truncate">
                                            {cat.tagline}
                                        </p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}