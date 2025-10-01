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
import { TInfoCircle } from "@/lib/icons";
import { useStore } from "@/src/hepler/store/zustand";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { CartProduct } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function ProductInformation({ productData }: any) {
  const { images = [], bannerImage, ...productDetails } = productData;
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
              {images.map((image: string, idx: number) => {
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
                  {images.map((image: string, idx: number) => (
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
                {images.map((image: string, idx: number) => {
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
          <ProductAbout productData={productData} />
        </div>
      </div>
    </>
  );
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  fabric: string | null;
  care: string | null;
  style_note: string | null;
  customization: string | null;
  model_height: string | null;
  description: string;
  bannerImage: string;
  basePrice: number;
  categoryId1: string;
  categoryId2: string | null;
  slug: string;
  images: string[];
  sizes: string[];
  colors: string[]; // hex codes
  materials: string[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

const ProductAbout = ({ productData }: { productData: Product }) => {
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

  const productExtraDetails = [
    {
      name: "care",
      value: productData.care,
      label: "Care",
    },
    {
      name: "style_note",
      value: productData.style_note,
      label: "Style Note",
    },
    {
      name: "customization",
      value: productData.customization,
      label: "Customization",
    },
    // {
    //   name: "model_height",
    //   value: productData.model_height,
    //   label: "Model Height",
    // },
  ];

  return (
    <div className=" h-fit sticky top-16">
      {/* Name */}
      <p className="roboto text-2xl  text-gray-800 mb-3 font-semibold">
        {productData.name}
      </p>
      <p className="roboto  text-gray-800 mb-3">{productData.description}</p>

      {/* Price */}
      <p className="roboto tracking-wider mb-6 font-semibold">
        INR <span className="text-green-700">{productData.basePrice}</span>
      </p>

      {/* Color Selector */}
      <div className="flex gap-2 items-center flex-wrap mb-4">
        {productData.colors?.map((color: string, idx: number) => (
          <button
            key={idx}
            onClick={() => setSelectedColor(color)}
            className={`size-8 shrink-0 p-0.5 rounded-full border-2 ${
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

      <div className="flex gap-2 items-center mb-6">
        {productData.sizes.map((size: string) => (
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

      <Separator className="my-6" />

      {/* Size Selector */}
      <div>
        <p className=" roboto text-xl  text-gray-800 mb-3 font-semibold">
          Additional Information
        </p>

        <div className=" mb-4 space-y-3">
          {productExtraDetails.map((extraDetailItem, idx) => {
            return (
              <div key={idx}>
                <span className=" font-semibold">
                  {extraDetailItem.label} -{" "}
                </span>
                <span>{extraDetailItem.value}</span>
              </div>
            );
          })}
        </div>
      </div>

      <Separator className="my-6" />

      {/* Model Info */}
      <div className="text-sm text-gray-600 border rounded px-3 py-2 mb-6 flex items-center gap-3">
        <TInfoCircle />
        Model height: 176 cm · Size S
      </div>

      {/* <p className=" mb-4">View size guide</p> */}

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
