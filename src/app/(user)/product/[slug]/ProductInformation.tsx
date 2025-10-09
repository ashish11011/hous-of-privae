"use client";
import { motion } from "motion/react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { TInfoCircle } from "@/lib/icons";
import { useStore } from "@/src/hepler/store/zustand";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { CartProduct } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertS3ToImageKit } from "@/src/hepler";

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
                    <Image
                      className="w-full h-auto object-cover "
                      src={convertS3ToImageKit(image)}
                      alt={`Image ${idx + 1}`}
                      width={100}
                      height={100}
                      priority
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
                      <Image
                        className="w-full h-auto object-cover "
                        src={convertS3ToImageKit(image)}
                        alt={`Image ${idx + 1}`}
                        width={100}
                        height={100}
                        priority
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselNext className=" right-5 " />
                <CarouselPrevious className=" left-6" />
              </Carousel>
              <div className=" flex overflow-x-auto gap-3 p-3">
                {images.map((image: string, idx: number) => {
                  console.log(convertS3ToImageKit(image));
                  return (
                    <Image
                      className=" w-16 h-auto"
                      src={convertS3ToImageKit(image)}
                      alt={`Image ${idx + 1}`}
                      width={100}
                      height={100}
                      priority
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
  const [selectedSize, setSelectedSize] = useState<string | null>(
    productData.sizes?.[0]
  );

  const sizes = ["XS", "S", "M", "L"]; // You can also make this dynamic

  const handleAddToCart = () => {
    toast("Item added to cart", {
      // description: "Sunday, December 03, 2023 at 9:00 AM",
      // action: {
      //   label: "Undo",
      //   onClick: () => console.log("Undo"),
      // },
    });

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
      <Toaster />

      {/* Name */}
      <p className="roboto text-2xl   mb-3 font-semibold">{productData.name}</p>
      <p className="roboto   mb-3">{productData.description}</p>

      {/* Price */}
      <p className="roboto tracking-wider mb-6 font-semibold">
        INR <span className=" font-bold">{productData.basePrice}</span>
      </p>

      {/* Color Selector */}
      {/* <div className="flex gap-2 items-center flex-wrap mb-4">
        {productData.colors?.map((color: string, idx: number) => (
          <button
            key={idx}
            // onClick={() => setSelectedColor(color)}
            className={`size-8 shrink-0 p-0.5 rounded-full border-2 

            `}
          >
            <div
              className="w-full h-full rounded-full"
              style={{ backgroundColor: color }}
            ></div>
          </button>
        ))}
      </div> */}

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

      {/* Add to Basket */}
      <motion.button
        onClick={() => handleAddToCart()}
        whileTap={{ scale: 0.98, backgroundColor: "#666" }}
        className="w-full bg-[#38080d] uppercase text-white font-semibold py-3 rounded"
      >
        ADD TO wardrobe
      </motion.button>

      <Separator className="my-6" />

      {/* Size Selector */}
      <div>
        <p className=" roboto text-xl   mb-3 font-semibold">
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

      <div>
        <p className=" roboto text-xl   mb-3 font-semibold">Return & Refund</p>

        <p className=" mb-4">
          Hassle-free 7-day return and exchange available.
        </p>
      </div>
      {/* Model Info */}
      <div className="text-sm text-gray-600 border rounded px-3 py-2 mb-6 flex items-center gap-3">
        <TInfoCircle />
        Model height: {productData.model_height} · Size - S
      </div>
    </div>
  );
};
