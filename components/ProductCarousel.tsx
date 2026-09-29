import React from "react";
import { getCategoryBySlug } from "@/lib/categoryHelper";
import { getProductByCategory } from "@/lib/productHelper";
import Link from "next/link";
import ProductCard from "./ProductCard";

const ProductCarousel = async () => {
  const category = await getCategoryBySlug("new-aravials");
  if (!category) return null;

  const products = (await getProductByCategory(category.id)).slice(0, 4);
  if (products.length === 0) return null;

  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">The latest from our atelier</p>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground heading-rule">
            New Arrivals
          </h2>
        </div>

        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch transition-opacity duration-300 ${"opacity-100"}`}
        >
          {products.map((item: any) => (
            <ProductCard
              key={item.variantId ?? item.id}
              product={item}
              imageOverride={item.bannerImage}
              nameOverride={item.name}
              priceOverride={item.price}
              badge={item.badge}
              wishlistKey={item.variantId}
            />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href={"/product"}
            className="group inline-flex items-center gap-2 border border-primary text-primary px-10 py-3 text-xs tracking-[0.2em] uppercase font-body hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            THE FULL COLLECTION
            <span
              aria-hidden="true"
              className="transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductCarousel;
