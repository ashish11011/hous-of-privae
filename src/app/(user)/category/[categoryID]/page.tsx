// import { ProductCard } from "@/components/ProductCard";
import ProductCard from "@/components/ProductCard";
import { CATEGORY_1 } from "@/const";
import { getProductByCategory } from "@/lib";
import React from "react";

export async function generateStaticParams() {
  const categories = CATEGORY_1; // should return list of category IDs like [{ categoryID: 'shoes' }, { categoryID: 'bags' }]
  return categories.map((cat) => ({
    categoryID: cat.id,
  }));
}

export const revalidate = 86400;

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
      <div className="  container gap-y-16 w-full mx-auto py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {productsData.map((item, idx) => {
          return (
            <ProductCard
              className=" w-full lg:w-full"
              product={item}
              key={idx}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Page;
