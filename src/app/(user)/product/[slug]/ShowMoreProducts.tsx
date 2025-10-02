import { ProductCard } from "@/components/ProductCard";
import React from "react";

const ShowMoreProducts = ({ simillarProducts }: any) => {
  return (
    <div>
      <p className=" my-10 md:mt-20 md:mb-12 text-3xl roboto font-medium capitalize text-center">
        Shop the look
      </p>

      <div className=" px-4 grid max-w-7xl mx-auto grid-cols-2 md:grid-cols-4 pb-8 gap-2 md:gap-4 w-full">
        {simillarProducts.map((item: any, index: number) => (
          <ProductCard
            key={index}
            className=" lg:w-full w-full"
            itemData={item}
          />
        ))}
      </div>
    </div>
  );
};

export default ShowMoreProducts;
