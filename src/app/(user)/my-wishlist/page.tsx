"use client";
import ProductCard from "@/components/ProductCard";
import { getProductFromIds } from "@/src/hepler/order/getPorductFromids";
import { userWishlistStore } from "@/src/hepler/store/zustand";
import Link from "next/link";
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
    <main className="bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Your Edit</p>
          <h1 className="font-heading text-4xl md:text-5xl heading-rule">Wishlist</h1>
        </div>
        {productWishlist.length === 0 ? (
          <div className="mx-auto max-w-md text-center">
            <p className="font-body text-sm text-muted-foreground mb-6">
              Save pieces you love and return when the occasion calls.
            </p>
            <Link href="/product" className="inline-flex border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground">
              Explore Collection
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productList.map((p: any) => (
              <ProductCard product={p} key={p.id} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default page;
