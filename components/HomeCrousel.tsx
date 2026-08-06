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

interface StackedCarouselProps {
  landingBanners: {
    mobile: string[];
    desktop: string[];
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
        {landingBanners.desktop.map((desktopImage, idx) => {
          const mobileImage = landingBanners.mobile[idx] || desktopImage;
          return (
            <CarouselItem className="w-full  " key={idx}>
              <Image
                src={isMobile ? mobileImage : desktopImage}
                alt={`Banner ${idx + 1}`}
                width={1831}
                height={1448}
                className="w-full h-auto object-contain"
                priority={idx === 0}
              />
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
