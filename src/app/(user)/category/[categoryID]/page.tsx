import { ProductCard } from "@/components/ProductCard";
import { productItemData } from "@/const/data/product";
import React from "react";
import { getProductByCategory } from "../../../../../lib";

const Page = async ({ params }: { params: any }) => {
  const categoryID = (await params).categoryID;
  const productsData = await getProductByCategory(categoryID);

  if (!productsData || productsData.length === 0)
    return <div>no products found</div>;
  return (
    <div className="py-12 px-6 flex flex-col gap-12">
      <h3 className=" text-3xl font-medium text-center w-full">
        Category - {categoryID}
      </h3>
      <div className="  grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {productsData.map((item, idx) => {
          return (
            <ProductCard
              className=" w-full lg:w-full"
              itemData={item}
              key={idx}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Page;
