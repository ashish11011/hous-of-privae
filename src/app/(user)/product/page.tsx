import { ProductCard } from "@/components/ProductCard";
import { useGetAllProducts } from "@/src/hepler";
import React from "react";

const page = async () => {
  const productsData = await useGetAllProducts(null, null);
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.products || [];

  return (
    <div className=" flex gap-5 flex-wrap w-full mx-auto items-center justify-center p-6">
      {products?.map((prodcutItem: any, idx: number) => {
        return (
          <ProductCard
            className=" w-full lg:w-full max-w-80"
            itemData={prodcutItem}
            key={idx}
          />
        );
      })}
    </div>
  );
};

export default page;
