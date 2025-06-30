import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import Image from "next/image";

const RevicesCarousel = () => {
  return (
    <div className=" py-24 max-w-7xl mx-auto">
      <div className=" px-6 pb-8 flex items-center flex-col gap-3 justify-between">
        <div className=" flex items-center justify-center w-full gap-2">
          <p className="text-3xl w-full text-center font-semibold pr-6 amr uppercase tracking-tighter">
            House Of{" "}
            <span className="sm:[word-spacing:16px]">
              Privae <br className="block sm:hidden" /> and Me
            </span>
          </p>
        </div>
        <div className=" duration-300 hover:bg-neutral-800 hover:text-white py-1 px-3 border border-black rounded-full roboto font-medium cursor-pointer">
          See All Reviews
        </div>
      </div>

      <div className="">
        <Carousel className="w-full ">
          <CarouselContent>
            {customerReviews.map((item: ReviewType, index) => (
              <CarouselItem className=" md:basis-1/2 lg:basis-1/4" key={index}>
                <CategorieCard itemData={item} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className={cn("left-6   z-20 ", buttonStyle)} />
          <CarouselNext className={cn("right-6", buttonStyle)} />
        </Carousel>
      </div>
    </div>
  );
};

export default RevicesCarousel;

const buttonStyle =
  "rounded-xs bg-neutral-800 hover:scale-105  cursor-pointer hover:bg-neutral-950 hover:text-white text-white size-10 z-20";

function CategorieCard({ itemData }: { itemData: ReviewType }) {
  return (
    <div className="relative w-[80%] mx-auto md:w-72 flex flex-col items-center py-4 text-center shrink-0">
      <div className="relative z-10">
        <Image
          src={itemData.image}
          alt={itemData.name}
          width={160}
          height={160}
          className="rounded-full object-cover border-4 border-white shadow-md"
        />
      </div>

      <div className="-mt-12 bg-yellow-50/60 py-6 px-4 pt-16 w-full  flex flex-col justify-center">
        <p className="text-lg font-semibold text-gray-900 mb-2 roboto">
          {itemData.name}
        </p>
        <p className="text-sm h-16 text-gray-600 font-medium leading-snug">
          {itemData.review}
        </p>
      </div>
    </div>
  );
}

const customerReviews = [
  {
    name: "Aanya Mehta",
    review:
      "Absolutely loved the fabric! It’s light, breathable, and the embroidery is just stunning. Perfect for summer weddings.",
    image: "/reviews/1.png",
  },
  {
    name: "Riya Kapoor",
    review:
      "I felt like a queen in this outfit. The fit was spot on and I got so many compliments!",
    image: "/reviews/2.png",
  },
  {
    name: "Simran Arora",
    review:
      "Soft on the skin and such a graceful drape. Ideal for long events when you want comfort and elegance together.",
    image: "/reviews/3.png",
  },
  {
    name: "Ishita Jain",
    review:
      "Wore it to my best friend’s mehndi. The pastel tones were dreamy and the look was effortlessly festive.",
    image: "/reviews/4.png",
  },
  {
    name: "Niyati Sharma",
    review:
      "It’s rare to find such lightweight festive wear that also feels luxurious. Mulmul got it just right.",
    image: "/reviews/5.png",
  },
  {
    name: "Tanya Bansal",
    review:
      "The color is even better in person. I danced all night and it never once felt heavy or itchy.",
    image: "/reviews/6.png",
  },
  {
    name: "Meher Khanna",
    review:
      "Got this for a small family function—looked classy and minimal. The detailing really makes it feel premium.",
    image: "/reviews/7.png",
  },
  {
    name: "Lavanya Singh",
    review:
      "Super fast delivery and the product quality exceeded expectations. I’m already looking for my next outfit!",
    image: "/reviews/8.png",
  },
  {
    name: "Kavya Patel",
    review:
      "Perfect fit, flattering silhouette, and such a rich finish. Loved every bit of it.",
    image: "/reviews/9.png",
  },
  {
    name: "Anika Reddy",
    review:
      "Light as a feather and so well stitched. Loved how breathable it felt even in the heat.",
    image: "/reviews/10.png",
  },
];

type ReviewType = {
  name: string;
  review: string;
  image: string;
};
