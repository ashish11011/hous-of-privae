import ProductCard from "@/components/ProductCard";
import { useGetAllProducts } from "@/src/hepler";
import React from "react";

const page = async () => {
  const productsData = await useGetAllProducts(null, null);
  const products = Array.isArray(productsData)
    ? productsData
    : productsData?.products || [];

  return (
    <div className="  container gap-y-16 w-full mx-auto py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {products?.map((prodcutItem: any, idx: number) => {
        return (
          <ProductCard
            className=" w-full lg:w-full max-w-80"
            product={prodcutItem}
            key={idx}
          />
        );
      })}
    </div>
  );
};

export default page;
