import React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import { ProductCard } from "./ProductCard";
import { useGetAllProducts } from "@/src/hepler";
import Link from "next/link";

const ProductCarousel = async () => {
  const productsData: any = await useGetAllProducts(1, 8);
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
              className=" text-2xl md:text-4xl font-semibold md:pr-6 font2 capitalize tracking-tight"
            >
              It may interest you
            </p>
          </div>
        </div>
        <Link href={`/product`} className=" w-full md:w-fit ml-auto">
          <div className=" w-full md:w-fit text-center duration-300 hover:bg-neutral-800 hover:text-white py-2 md:py-3 px-4 border border-black rounded-full text-lg roboto font-medium cursor-pointer">
            See all styles
          </div>
        </Link>
      </div>

      <div className="">
        <Carousel className="w-full max-w-[calc(100vw)] ">
          <CarouselContent className="-ml-1  overflow-visible">
            {productsData?.products?.map((item: any, index: number) => (
              <CarouselItem key={index} className="pl-1 basis-auto ">
                <ProductCard itemData={item} />
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
  "rounded-xs bg-neutral-800 hover:scale-105 disabled:hidden cursor-pointer hover:bg-neutral-950 hover:text-white text-white size-10 z-20";
