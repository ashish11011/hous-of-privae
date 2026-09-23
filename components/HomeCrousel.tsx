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

const bannerContent = [
  {
    href: "/product",
    mobLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/1-mob.mp4",
    webLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/1-web.mp4",
    type: "video",
  },
  {
    href: "/product",
    mobLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/2-mob.png",
    webLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/2-web.png",
    type: "img",
  },
  {
    href: "/about-us/",
    mobLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/3-mob.mp4",
    webLink:
      "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/3-web.mp4",
    type: "video",
  },
];

export default function StackedCarousel() {
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
    <Carousel
      className="w-full max-h-screen overflow-hidden"
      setApi={setApi}
      opts={{ loop: true }}
      plugins={[
        Autoplay({
          delay: 3000,
          stopOnInteraction: false,
          stopOnMouseEnter: true,
        }),
      ]}
    >
      <CarouselContent className="h-fit">
        {bannerContent.map((item, idx) => {
          const src = isMobile ? item.mobLink : item.webLink;

          const media =
            item.type === "video" ? (
              <video
                src={src}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-contain"
              />
            ) : (
              <Image
                src={src}
                alt={`Banner ${idx + 1}`}
                width={1831}
                height={1448}
                className="w-full h-auto object-contain"
                priority={idx === 0}
              />
            );

          return (
            <CarouselItem className="w-full" key={idx}>
              {item.href ? (
                <Link
                  href={item.href}
                  className="block"
                  aria-label={`Open banner ${idx + 1}`}
                >
                  {media}
                </Link>
              ) : (
                media
              )}
            </CarouselItem>
          );
        })}
      </CarouselContent>
    </Carousel>
  );
}
