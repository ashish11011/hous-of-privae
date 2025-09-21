"use client";
import React from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
} from "./ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import SampleImage from "./sampleImage";
import { navBarHeight } from "@/const";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/src/hooks/use-mobile";

const slides = [
  {
    id: 0,
    image: "/C_1.webp",
    imageMob: "/m1.jpeg",
    title: "Slide 1",
  },
  {
    id: 1,
    image: "/C_2.webp",
    imageMob: "/m2.jpeg",
    title: "Slide 2",
  },
  {
    id: 2,
    image: "/C_3.webp",
    imageMob: "/m3.jpeg",
    title: "Slide 3",
  },
];

export default function StackedCarousel() {
  const isMobile = useIsMobile();

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
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
      plugins={[
        Autoplay({
          delay: 2000,
        }),
      ]}
      setApi={setApi}
      className={`h-[80vh] lg:h-[calc(100vh-${navBarHeight})]`}
    >
      <CarouselContent
        className={`h-[80vh]  lg:h-[calc(100vh-${navBarHeight})]`}
      >
        {slides.map((itemData, index) => (
          <CarouselItem
            className=" flex items-center justify-center bg-[#D5D6CF] w-screen"
            key={index}
          >
            {/* <Image
              src={isMobile ? itemData.imageMob : itemData.image}
              alt={itemData.title}
              width={1200}
              height={1200}
              className=" h-full w-full object-cover"
            /> */}
            <div className=" size-96 ">
              <SampleImage />
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      {/* <CarouselPrevious />
      <CarouselNext /> */}

      <div className=" absolute bottom-4 left-1/2 -translate-x-1/2  flex gap-2 py-2">
        {Array.from({ length: count }).map((_, index) => (
          <div
            onClick={() => api?.scrollTo(index)}
            key={index}
            className={cn(" cursor-pointer inline-flex h-1 w-8 rounded-full", {
              "bg-muted": current !== index + 1,
              "bg-primary": current === index + 1,
            })}
          />
        ))}
      </div>
    </Carousel>
  );
}
