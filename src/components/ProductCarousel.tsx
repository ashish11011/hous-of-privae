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
import { ArrowRight } from "lucide-react";

const ProductCarousel = () => {
  return (
    <div className=" px-4 ">
      <div className=" gap-3 lg:px-6 pt-3 pb-6 flex-col lg:flex-row flex items-center justify-between">
        <div className=" flex flex-col sm:flex-row lg:items-center gap-2">
          <div className=" flex gap-3 items-center">
            <ArrowRight
              stroke="#000"
              className=" hidden sm:block"
              strokeWidth={2.5}
              size={32}
            />
            <p
              style={{ wordSpacing: "6px" }}
              className=" text-4xl font-semibold md:pr-6 roboto uppercase tracking-tight"
            >
              It may intrest you
            </p>
          </div>
        </div>
        <div className=" w-full md:w-fit text-center duration-300 hover:bg-neutral-800 hover:text-white py-2 md:py-3 px-4 border border-black rounded-full text-lg roboto font-medium cursor-pointer">
          See all styles
        </div>
      </div>

      <div className="">
        <Carousel className="w-full max-w-[calc(100vw)] ">
          <CarouselContent className="-ml-1 pl-24 overflow-visible">
            {itemsData.map((item, index) => (
              <CarouselItem key={index} className="pl-1 basis-auto ">
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

export default ProductCarousel;

const buttonStyle =
  "rounded-xs bg-neutral-800 hover:scale-105  cursor-pointer hover:bg-neutral-950 hover:text-white text-white size-10 z-20";

function CategorieCard({ itemData }: { itemData: ItemData }) {
  return (
    <div className=" shrink-0 flex w-72 lg:w-80 flex-col  ">
      <Image
        src={itemData.image}
        alt={itemData.name}
        width={800}
        height={800}
        className=" h-auto w-80 object-cover"
      />

      <div className=" p-1 flex flex-col">
        <p className=" line-clamp-1">{itemData.name}</p>
        <p className=" text-red-400 text-sm roboto font-semibold">
          {itemData.price}INR
        </p>
      </div>
    </div>
  );
}

type ItemData = {
  name: string;
  image: string;
  price: string;
  type: string;
  details: string;
};

const itemsData = [
  {
    name: "Mulmul Luxe Tissue Mehram Lilac Saree",
    image: "/items/1.jpg",
    price: "13,950",
    type: "Saree (Luxe Tissue)",
    details:
      "Elegant lilac saree, luxe tissue fabric — ideal for daytime functions.",
  },
  {
    name: "Mulmul Organza Savani Yellow Saree",
    image: "/items/2.jpg",
    price: "14,500",
    type: "Saree (Organza)",
    details: "Bright yellow organza saree—vibrant choice for Haldi or mehndi.",
  },
  {
    name: "Mulmul Cotton Fifi Grey Kurta With Mulmul Cotton Wade Mirror Gota White Pant",
    image: "/items/3.png",
    price: "13,350",
    type: "Kurta Set (Cotton)",
    details: "Subtle grey kurta set in breathable cotton for elegant comfort.",
  },
  {
    name: "Rajvella Orange Mulmul Cotton Kurta & Pant Set",
    image: "/items/4.jpg",
    price: "8,950",
    type: "Kurta Set (Cotton)",
    details: "Cheerful orange cotton set—great for daytime festivities.",
  },
  {
    name: "Rajvella Steel Blue Mulmul Cotton Kurta & Pant Set",
    image: "/items/5.jpg",
    price: "8,950",
    type: "Kurta Set (Cotton)",
    details: "Classic steel blue kurta set—sleek yet comfortable.",
  },
  {
    name: "Aubriet Lilac Mulmul Cotton Kurta & Pant Set",
    image: "/items/6.jpg",
    price: "8,950",
    type: "Kurta Set (Cotton)",
    details: "Soft lilac match set—airy and light.",
  },
  {
    name: "Aubriet Mustard Mulmul Cotton Kurta & Pant Set",
    image: "/items/7.jpg",
    price: "8,950",
    type: "Kurta Set (Cotton)",
    details: "Warm mustard tone—great for daytime events.",
  },
  {
    name: "Rosabelle Rani Pink Mulmul Cotton Kurta Set",
    image: "/items/8.jpg",
    price: "9,950",
    type: "Kurta Set (Cotton)",
    details: "Bold pink kurta—perfect for bringing out the festive vibe.",
  },
  {
    name: "Rosabelle Steel Blue Mulmul Cotton Kurta Set",
    image: "/items/9.jpg",
    price: "9,950",
    type: "Kurta Set (Cotton)",
    details: "Steel blue Kurta set—cool yet refined.",
  },
  {
    name: "Mulmul Printed Linen Pia Yellow Kurta With Mulmul Printed Linen Pia Yellow Pant",
    image: "/items/10.jpg",
    price: "9,950",
    type: "Kurta Set (Printed Linen)",
    details: "Cheerful printed linen set in yellow—ideal for garden mehendi.",
  },
  {
    name: "Mulmul Printed Linen Pia Blue Kurta With Mulmul Printed Linen Pia Blue Pant",
    image: "/items/11.jpg",
    price: "9,950",
    type: "Kurta Set (Printed Linen)",
    details: "Printed linen in blue—lightweight elegance.",
  },
];
