"use client";
import { ProductCard } from "@/components/ProductCard";
import { getProductFromIds } from "@/src/hepler/order/getPorductFromids";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import React, { useEffect } from "react";

const page = () => {
  const { productWishlist } = userWishlistStore();
  const [productList, setProductList] = React.useState<any>([]);
  useEffect(() => {
    async function getAllProducts() {
      const ids = productWishlist.map((p) => p.id);
      const res = await getProductFromIds(ids);
      setProductList(res);
    }
    getAllProducts();
  }, [productWishlist]);
  return (
    <div className=" flex gap-4 items-center my-16 px-12">
      {productList.map((p: any) => {
        return <ProductCard itemData={p} key={p.id} />;
      })}
    </div>
  );
};

export default page;
