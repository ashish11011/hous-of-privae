"use client";
import React from "react";
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

const slides = [
  {
    id: 0,
    image: "/crousel/web1.jpg",
    imageMob: "/crousel/mb1.jpg",
    title: "Slide 1",
  },
  {
    id: 1,
    image: "/crousel/web2-bg.jpg",
    imageMob: "/crousel/mob2-bg.jpg",
    title: "Slide 2",
  },
  {
    id: 2,
    image: "/crousel/web3.jpg",
    imageMob: "/crousel/mb3.jpg",
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

  const slideCrouselItems = [
    <CarouselItem
      className=" flex relative items-center h-full justify-center bg-[#D5D6CF] w-screen"
      key={0}
    >
      <Image
        src={isMobile ? slides[1].imageMob : slides[1].image}
        alt={slides[1].title}
        width={1200}
        height={1200}
        className=" h-full absolute  inset-0 w-full object-cover"
      />

      <div className="text-white mx-auto w-full p-2 md:p-4 max-w-7xl z-10 flex items-center justify-end h-[80%] space-y-5 flex-col">
        <Image
          src={"/white-logo.png"}
          alt="logo"
          className=" size-32 md:size-44 object-contain"
          width={200}
          height={200}
        />
        <p className=" text-xl md:text-2xl font-semibold">
          Welcome to Haus of Privae
        </p>
        <p className=" md:text-xl  ">
          Thank you for visiting our world of timeless elegance. At Haus of
          Privae, we believe luxury should not only be exquisite but also
          responsible. Every piece we create blends meticulous craftsmanship,
          refined design, and eco-conscious practices allowing you to embrace
          sophistication without compromise. <br /> We are honored to share our
          vision with you: a future where fashion celebrates individuality,
          sustainability, and the art of living beautifully. Your presence here
          is the first step in that journey with us.
        </p>
        <p className=" text-xl md:text-2xl font-semibold">
          Welcome to a more thoughtful kind of luxury.
        </p>
      </div>
    </CarouselItem>,
    <CarouselItem
      className=" flex items-center h-full justify-center bg-[#D5D6CF] w-screen"
      key={0}
    >
      <Image
        src={isMobile ? slides[0].imageMob : slides[0].image}
        alt={slides[0].title}
        width={1200}
        height={1200}
        className=" h-full w-full object-cover"
      />
    </CarouselItem>,

    <CarouselItem
      className=" flex items-center h-full justify-center bg-[#D5D6CF] w-screen"
      key={0}
    >
      <Image
        src={isMobile ? slides[2].imageMob : slides[2].image}
        alt={slides[2].title}
        width={1200}
        height={1200}
        className=" h-full w-full object-cover"
      />
    </CarouselItem>,
  ];

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
      style={{ height: `calc(100vh - ${navBarHeight})` }}
      className={cn(`h-[80vh] lg:h-[calc(100vh-${navBarHeight})]`)}
    >
      <CarouselContent
        style={{ height: `calc(100vh - ${navBarHeight})` }}
        className={cn(`h-[80vh] lg:h-[calc(100vh-${navBarHeight})]`)}
      >
        {slideCrouselItems.map((item, idx) =>
          React.cloneElement(item, { key: idx })
        )}
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
