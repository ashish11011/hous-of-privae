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
import { userWishlistStore, useStore } from "@/src/hepler/store/zustand";
import { useIsMobile } from "@/src/hooks/use-mobile";
import { CartProduct } from "@/types";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { convertS3ToImageKit, formatNumberWithCommas } from "@/src/hepler";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Heart, Minus, Plus } from "lucide-react";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import TailoredFitFormModal from "@/components/productCustomization";
import SizeGuideSheet from "@/components/sizeChartSheet";

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
  const { addItemToStore, increaseQuantity, decreaseQuantity, productStore } =
    useStore();
  const { addItemToWishlist, productWishlist, removeItemFromWishlist } =
    userWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(productData.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(
    productData.sizes?.[0]
  );

  const sizes = ["XS", "S", "M", "L"]; // You can also make this dynamic

  const handleAddToCart = () => {
    toast.success("Item added to cart", {
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

  function removeWishlistHandler(id: string) {
    removeItemFromWishlist(id);
    toast.success("Removed from wishlist");
  }

  function addWishlistHandler(id: string) {
    addItemToWishlist(id);
    toast.success("Added to wishlist");
  }

  return (
    <div className=" h-fit sticky top-16">
      <Toaster position="top-right" />
      {/* Name */}
      <p className="roboto text-2xl   mb-1 font-semibold">{productData.name}</p>
      <p className=" mb-3">{productData.sku}</p>

      {/* Price */}
      <p className="roboto tracking-wider mb-6 font-semibold">
        INR{" "}
        <span className=" font-bold">
          {formatNumberWithCommas(productData.basePrice)}
        </span>
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

      {/* <div className="col-span-1 max-w-56 h-12 border border-gray-400  rounded overflow-hidden flex items-center justify-end  gap-2">
        <button
          className="flex items-center justify-center hover:bg-neutral-200 cursor-pointer px-3 py-2 duration-200 h-full w-full "

        >
          <Minus size={16} />
        </button>
        <span className="">

        </span>
        <button className="flex items-center justify-center hover:bg-neutral-200 cursor-pointer px-3 py-2 duration-200 h-full w-full ">
          <Plus size={16} />
        </button>
      </div> */}

      <div className=" w-full grid grid-cols-2 gap-4">
        {productStore.filter(
          (item) => item.id === productData.id && item.size === selectedSize
        )[0]?.quantity ? (
          <ButtonGroup className=" w-full">
            <Button
              className=" w-16 h-10"
              onClick={() =>
                decreaseQuantity({
                  id: productData.id,
                  color: selectedColor,
                  size: selectedSize as string,
                })
              }
              variant={"outline"}
            >
              <Minus />
            </Button>
            <ButtonGroupText className=" w-16 h-10 text-center">
              <p className=" w-full">
                {
                  productStore.filter(
                    (item) =>
                      item.id === productData.id && item.size === selectedSize
                  )[0]?.quantity
                }
              </p>
            </ButtonGroupText>
            <Button
              className=" w-16 h-10"
              onClick={() =>
                increaseQuantity({
                  id: productData.id,
                  color: selectedColor,
                  size: selectedSize as string,
                })
              }
              variant={"outline"}
            >
              <Plus />
            </Button>
          </ButtonGroup>
        ) : (
          <Button
            size={"lg"}
            onClick={() => handleAddToCart()}
            className=" h-10 uppercase"
          >
            ADD TO wardrobe
          </Button>
        )}
        {productWishlist.filter((item) => item.id === productData.id)[0] ? (
          <Button
            onClick={() => removeWishlistHandler(productData.id)}
            variant={"outline"}
            className=" h-10"
            size={"lg"}
          >
            <Heart fill="#38080d" />
            <p>Remove item</p>
          </Button>
        ) : (
          <Button
            onClick={() => addWishlistHandler(productData.id)}
            variant={"outline"}
            className=" h-10"
            size={"lg"}
          >
            <Heart />
            <p>Add to wishlist</p>
          </Button>
        )}
      </div>

      {/* Size Selector */}
      {/* <div>
        <p className=" roboto text-xl   mb-3 font-semibold">
          Additional Information
        </p>

        
      </div> */}

      <Separator className="my-6" />

      <Accordion defaultValue={["1", "2", "3", "4", "5"]} type="multiple">
        <AccordionItem value="1">
          <AccordionTrigger>Return & Refund</AccordionTrigger>
          <AccordionContent>
            Hassle-free 7-day return and exchange available.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="2">
          <AccordionTrigger>Additional Information</AccordionTrigger>
          <AccordionContent>
            <div className=" space-y-3">
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
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="3">
          <AccordionTrigger>Modle Info</AccordionTrigger>
          <AccordionContent>
            <div className="text-sm text-gray-600 border rounded px-3 py-2  flex items-center gap-3">
              <TInfoCircle />
              Model height: {productData.model_height} · Size - S
            </div>
            <SizeGuideSheet />
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="4">
          <AccordionTrigger>Delivery Info</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              Your order will be delivered within{" "}
              <span className="font-medium text-foreground">
                3-5 business days
              </span>
              .
            </p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="5">
          <AccordionTrigger>Product Description</AccordionTrigger>
          <AccordionContent>
            <p className="roboto   mb-3">{productData.description}</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="6">
          <AccordionTrigger>Want to customize?</AccordionTrigger>
          <AccordionContent>
            <p className="text-sm text-muted-foreground">
              We'd love to help you create something unique. Please email us at{" "}
              <a
                href="mailto:queries.hausofprivae@gmail.com"
                className="text-primary underline hover:text-primary/80"
              >
                queries.hausofprivae@gmail.com
              </a>{" "}
              or call us at{" "}
              <a
                href="tel:+917023117408"
                className="text-primary underline hover:text-primary/80"
              >
                +91&nbsp;70231&nbsp;17408
              </a>
              .
              <TailoredFitFormModal />
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* <div>
        <p className=" roboto text-xl   mb-3 font-semibold">Return & Refund</p>

        <p className=" mb-4">
          Hassle-free 7-day return and exchange available.
        </p>
      </div> */}
      {/* Model Info */}
    </div>
  );
};
