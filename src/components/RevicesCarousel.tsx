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
    <div className=" py-20 max-w-7xl mx-auto">
      <div className=" px-6 pb-8 flex items-center flex-col gap-3 justify-between">
        <div className=" flex items-center justify-center w-full gap-2">
          {/* <p className="text-3xl w-full text-center font-semibold pr-6 roboto uppercase ">
            Haus Of{" "}
            <span className="sm:[word-spacing:16px]">
              Privae <br className="block sm:hidden" /> and Me
            </span>
          </p> */}
        </div>
        <div className=" duration-300 hover:bg-neutral-800 hover:text-white py-1 px-3 border border-black rounded-full roboto font-medium cursor-pointer">
          See All Reviews
        </div>
      </div>

      <div className="">
        <Carousel className="w-full ">
          <CarouselContent>
            {customerReviews.map((item: ReviewType, index) => (
              <CarouselItem className=" md:basis-1/2 lg:basis-1/3" key={index}>
                <ReviewCard itemData={item} />
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

function ReviewCard({ itemData }: { itemData: ReviewType }) {
  return (
    <div className=" flex  min-h-60 gap-1 w-full">
      <div className="relative w-full  h-full">
        <Image
          src={itemData.image}
          alt={itemData.name}
          width={160}
          height={160}
          className=" object-cover w-full h-full "
        />
      </div>

      <div className=" w-full  flex flex-col py-2 px-3">
        <p className="text-lg roboto font-semibold text-gray-900 mb-2  ">
          {itemData.name}
        </p>
        <p className=" roboto   text-gray-600 font-medium">{itemData.review}</p>
      </div>
    </div>
  );
}

const customerReviews = [
  {
    name: "Aarohi Deshmukh",
    review:
      "Wore Haus of Privae for a festive dinner and felt effortlessly elegant. It’s now my favourite in the wardrobe!",
    image: "/reviewimage.png",
  },
  {
    name: "Vritika Chauhan",
    review:
      "The detailing is even more beautiful in person. Super breathable and stitched to perfection!",
    image: "/reviewimage.png",
  },
  {
    name: "Ilisha Gokhale",
    review:
      "This felt like second skin. Perfect for long hours of celebration — light, soft, and stunning.",
    image: "/reviewimage.png",
  },
  {
    name: "Charvi Tyagi",
    review:
      "Haus of Privae blends comfort and tradition so well. Loved every bit of the outfit, from fit to finish.",
    image: "/reviewimage.png",
  },
  {
    name: "Naira Talwar",
    review:
      "Received so many compliments! It's rare to find pieces that look so regal yet feel so breathable.",
    image: "/reviewimage.png",
  },
  {
    name: "Vedika Raut",
    review:
      "Absolutely delighted with the quality. The color was rich, and the embroidery so delicate.",
    image: "/reviewimage.png",
  },
  {
    name: "Kyra Mahajan",
    review:
      "Felt graceful the moment I wore it. Haus of Privae has truly changed how I view ethnicwear.",
    image: "/reviewimage.png",
  },
  {
    name: "Devina Bhatt",
    review:
      "The fit was spot-on and didn’t need a single alteration. The whole look felt elevated and modern.",
    image: "/reviewimage.png",
  },
  {
    name: "Tia Sondhi",
    review:
      "Ordered this for a destination wedding — easy to pack, gorgeous to wear. 10/10 recommend!",
    image: "/reviewimage.png",
  },
  {
    name: "Zehra Merchant",
    review:
      "From the texture to the silhouette, everything screamed premium. Haus of Privae exceeded expectations.",
    image: "/reviewimage.png",
  },
];

type ReviewType = {
  name: string;
  review: string;
  image: string;
};
