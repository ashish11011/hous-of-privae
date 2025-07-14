import { ProductCard } from "@/components/ProductCard";
import { productItemData } from "@/const/data/product";
import React from "react";

const Page = () => {
  return (
    <div className=" py-12 px-6 grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {productItemData.map((item, idx) => {
        return <ProductCard className=" lg:w-full" itemData={item} key={idx} />;
      })}
    </div>
  );
};

export default Page;
