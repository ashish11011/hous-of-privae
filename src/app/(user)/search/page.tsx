import ProductCard from "@/components/ProductCard";
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
        searchedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
            {searchedProducts.map((item: any) => (
              <ProductCard itemData={item} key={item.id ?? item.slug} />
            ))}
          </div>
        ) : (
          <p className="text-center py-10 text-sm text-neutral-500">
            No products found for &quot;{searchString}&quot;.
          </p>
        )
      ) : (
        <p className=" text-center py-4">Search for any product</p>
      )}
    </div>
  );
};

export default page;
