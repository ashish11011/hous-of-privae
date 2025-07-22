"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { sampleProductData } from "@/const/data/sampleProdccutData";
import { InfoCircle } from "@/lib/incons";
import { useState } from "react";

const Page = () => {
  const productData = sampleProductData;
  const images = productData.images || [];
  const imagesLength = images.length;

  return (
    <div className="grid grid-cols-4 lg:grid-cols-6 w-full gap-4">
      {/* Left Side - Images */}
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

      {/* Right Side - Placeholder */}
      <div className="w-full p-6 xl:p-10 col-span-4 lg:col-span-2">
        <ProductRightMenu />
      </div>
    </div>
  );
};

export default Page;

const ProductRightMenu = () => {
  const productData = sampleProductData;

  const [selectedColor, setSelectedColor] = useState(productData.colors?.[0]);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const sizes = ["XS", "S", "M", "L"]; // You can also make this dynamic

  return (
    <>
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
        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded"
      >
        ADD TO BASKET
      </Button>
    </>
  );
};
