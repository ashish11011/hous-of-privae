"use client";
import React, { useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { navBarHeight } from "@/const";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/src/hooks/use-mobile";
import Image from "next/image";
import Link from "next/link";

type BannerItem = {
  image: string;
  href?: string;
};

interface StackedCarouselProps {
  landingBanners: {
    mobile: BannerItem[];
    desktop: BannerItem[];
  };
}

export default function StackedCarousel({
  landingBanners,
}: StackedCarouselProps) {
  const isMobile = useIsMobile();
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }
    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  if (isMobile === null) {
    return null;
  }
  return (
    <Carousel className="w-full ">
      <CarouselContent className="h-fit">
        {landingBanners.desktop.map((desktopBanner, idx) => {
          const mobileBanner = landingBanners.mobile[idx] || desktopBanner;
          const image = isMobile ? mobileBanner.image : desktopBanner.image;
          const href = desktopBanner.href || mobileBanner.href;
          const bannerImage = (
            <Image
              src={image}
              alt={`Banner ${idx + 1}`}
              width={1831}
              height={1448}
              className="w-full h-auto object-contain"
              priority={idx === 0}
            />
          );

          return (
            <CarouselItem className="w-full  " key={idx}>
              {href ? (
                <Link href={href} className="block" aria-label={`Open banner ${idx + 1}`}>
                  {bannerImage}
                </Link>
              ) : (
                bannerImage
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
