"use client";
import React from "react";
import { Carousel, CarouselContent, CarouselItem } from "../ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const UpperNavBar = () => {
  const navbarHeadLines = [
    "Lorem ipsum dolor sit amet consectetur adipisicing",
    "Lorem ipsum dolor sit amet consectetur adipisicing",
  ];
  return (
    <div className=" px-4  w-full max-w-2xl mx-auto overflow-hidden text-center text-base">
      <Carousel
        plugins={[
          Autoplay({
            delay: 2000,
          }),
        ]}
      >
        <CarouselContent>
          {navbarHeadLines.map((item, idx) => {
            return <CarouselItem key={idx}>{item}</CarouselItem>;
          })}
        </CarouselContent>
      </Carousel>
    </div>
  );
};

export default UpperNavBar;
