"use client";
import { ProductCard } from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { sampleProductData } from "@/const/data/sampleProdccutData";
import { useStore } from "@/hepler/store/zustand";
import { useIsMobile } from "@/lib/Hooks";
import { InfoCircle } from "@/lib/incons";
import { CartProduct } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";

const Page = () => {
  const productData = sampleProductData;
  const images = productData.images || [];
  const imagesLength = images.length;

  const [isPageLoaded, setIsPageLoaded] = useState(false);
  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const isMobile = useIsMobile();

  return (
    <>
      <div className="grid grid-cols-4 lg:grid-cols-6 w-full gap-4">
        {/* Left Side - Images */}

        {isPageLoaded ? (
          !isMobile ? (
            <div className="w-full col-span-4 flex flex-wrap">
              {images.map((image, idx) => {
                let widthClass = "w-1/2"; // Default width

                // For odd number of images, last row can be 3
                if (imagesLength % 2 !== 0 && idx >= imagesLength - 3) {
                  widthClass = "w-1/3";
                }

                return (
                  <div key={idx} className={`${widthClass} p-0.5 h-auto`}>
                    <img
                      className="w-full h-auto object-cover "
                      src={image}
                      alt={`Image ${idx + 1}`}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className=" col-span-4">
              <Carousel
                plugins={[
                  Autoplay({
                    delay: 2000,
                  }),
                ]}
              >
                <CarouselContent>
                  {images.map((image, idx) => (
                    <CarouselItem key={idx}>
                      <img
                        className="w-full h-auto object-cover "
                        src={image}
                        alt={`Image ${idx + 1}`}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext className=" right-5 " />
                <CarouselPrevious className=" left-6" />
              </Carousel>
              <div className=" flex overflow-x-auto gap-3 p-3">
                {images.map((image, idx) => {
                  return (
                    <Image
                      className=" w-16 h-auto"
                      src={image}
                      alt={`Image ${idx + 1}`}
                      width={100}
                      height={100}
                    />
                  );
                })}
              </div>
            </div>
          )
        ) : null}

        {/* Right Side - Placeholder */}
        <div className="w-full p-4 md:p-6 xl:p-10 col-span-4 lg:col-span-2">
          <ProductRightMenu />
        </div>
      </div>
      <p className=" my-10 md:mt-20 md:mb-12 text-3xl roboto font-medium text-center">
        Shop the look
      </p>

      <div className=" px-4 grid max-w-7xl mx-auto grid-cols-2 md:grid-cols-4 pb-8 gap-2 md:gap-4 w-full">
        {Array.from({ length: 4 }).map((_, index) => (
          <ProductCard
            className=" lg:w-full w-full"
            itemData={{
              name: sampleProductData.name,
              image: sampleProductData.bannerImage,
              price: String(sampleProductData.basePrice),
              type: sampleProductData.categoryId2,
              details: sampleProductData.description,
            }}
          />
        ))}
      </div>
    </>
  );
};

export default Page;

const ProductRightMenu = () => {
  const productData = sampleProductData;
  const { addItemToStore } = useStore();

  const [selectedColor, setSelectedColor] = useState(productData.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizes = ["XS", "S", "M", "L"]; // You can also make this dynamic

  const handleAddToCart = () => {
    if (selectedColor && selectedSize) {
      const product: CartProduct = {
        id: productData.id,
        name: productData.name,
        basePrice: productData.basePrice,
        slug: productData.slug,
        quantity: 1,
        bannerImage: productData.bannerImage,
        size: selectedSize,
        color: selectedColor,
      };
      addItemToStore(product);
    }
  };

  return (
    <div className=" h-fit sticky top-16">
      {/* Name */}
      <p className="roboto text-lg text-gray-800 mb-3 font-medium">
        {productData.name}
      </p>

      {/* Price */}
      <p className="roboto tracking-wider mb-6 font-semibold">
        {productData.basePrice} INR
      </p>

      {/* Color Selector */}
      <div className="flex gap-2 items-center mb-6">
        {productData.colors?.map((color, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedColor(color)}
            className={`size-8 p-0.5 rounded-full border-2 ${
              selectedColor === color ? "border-black" : "border-gray-300"
            }`}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          </button>
        ))}
      </div>

      <Separator className="my-4" />

      {/* Size Selector */}
      <div className="flex gap-2 items-center mb-6">
        {sizes.map((size) => (
          <button
            key={size}
            onClick={() => setSelectedSize(size)}
            className={`px-4 py-1 border rounded-full text-sm  font-medium transition ${
              selectedSize === size
                ? "bg-neutral-100 text-black ring-2 ring-blue-400"
                : "border-gray-400 text-gray-800"
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Model Info */}
      <div className="text-sm text-gray-600 border rounded px-3 py-2 mb-4 flex items-center gap-3">
        <InfoCircle />
        Model height: 176 cm · Size S
      </div>

      <p className=" mb-4">View size guide</p>

      {/* Add to Basket */}
      <Button
        size={"lg"}
        onClick={() => handleAddToCart()}
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
      >
        ADD TO BASKET
      </Button>
    </div>
  );
};
