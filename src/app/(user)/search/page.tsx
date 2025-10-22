import { ProductCard } from "@/components/ProductCard";
import { useGetSearchedProducts } from "@/src/hepler";
import React from "react";
import SearchInput from "./searchInput";

const page = async ({ params, searchParams }: any) => {
  const searchParamsData = await searchParams;
  const searchString = searchParamsData?.search || "";

  const searchedProducts = await useGetSearchedProducts(searchString as string);
  // getsearched products
  return (
    <div className=" mt-16">
      {/* input search */}
      <SearchInput defValue={searchString as string} />

      {searchString ? (
        <div className=" p-4 flex gap-4 flex-wrap justify-center">
          {searchedProducts.map((item: any, idx: number) => {
            return (
              <ProductCard className=" w-full" itemData={item} key={idx} />
            );
          })}
        </div>
      ) : (
        <p className=" text-center py-4">No products found</p>
      )}
    </div>
  );
};

export default page;
