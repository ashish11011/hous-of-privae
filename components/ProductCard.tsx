"use client"
// import { ShowProductPrice } from "@/lib/productHealper";
// import { cn } from "@/lib/utils";
// import { convertS3ToImageKit, formatNumberWithCommas } from "@/src/hepler";
// import Image from "next/image";
// import Link from "next/link";

// export function ProductCard({ itemData, className }: any) {
//   return (
//     <Link
//       href={`/product/${itemData.slug}`}
//       className={cn(" shrink-0 flex w-72 lg:w-80 flex-col  ", className)}
//     >
//       <Image
//         src={convertS3ToImageKit(itemData.bannerImage)}
//         alt={itemData.name}
//         width={800}
//         height={800}
//         className=" h-auto w-full object-cover"
//       />

//       <div className=" p-1 flex flex-col">
//         <p className=" line-clamp-1">{itemData.name}</p>
//         <p className=" text-red-400 text-sm roboto font-semibold">
//           <ShowProductPrice price={itemData.basePrice} />
//         </p>
//       </div>
//     </Link>
//   );
// }

import { Heart } from "lucide-react";
import ImageWithSkeleton from "./ImageWithSkeleton";
import { useCurrency } from "@/contextCurrencyContext";
import Link from "next/link";


const ProductCard = ({
  product,
  imageOverride,
  secondaryImageOverride,
  nameOverride,
  priceOverride,
  badge,
  to,
  wishlistKey,
}: any) => {
  const { format } = useCurrency();
  const wishlistId = wishlistKey ?? product.id;

  const showNew = false;
  const showBestseller = false;

  // Primary + optional secondary (hover-reveal). Falls back gracefully.
  const primaryImage = imageOverride ?? product.image;
  const secondaryImage = product.images[1]
  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--x", `${e.clientX - rect.left}px`);
    target.style.setProperty("--y", `${e.clientY - rect.top}px`);
  };

  return (
    <div className="group flex flex-col h-full">
      <Link
        href={`/product/${product.slug}`}
        onMouseMove={handleMove}
        className="product-cursor-area block relative overflow-hidden"
      >
        <div className={`relative `}>
          <ImageWithSkeleton
            wrapperClassName="aspect-[3/4] bg-[#e9e2d8]"
            src={primaryImage}
            alt={nameOverride ?? product.name}
            fit="contain"
            className={`transition-transform duration-700 group-hover:scale-105 ${secondaryImage ? "md:group-hover:opacity-0" : ""}`}
          />
          {secondaryImage && (
            <ImageWithSkeleton
              wrapperClassName="absolute inset-0 hidden md:block opacity-0 transition-opacity duration-700 group-hover:opacity-100 pointer-events-none"
              src={secondaryImage}
              alt=""
              fit="contain"
              className="transition-transform duration-700 group-hover:scale-105"
            />
          )}
        </div>
        <span className="product-cursor hidden">View</span>
        <button
          aria-label={"Add to wishlist"}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer z-10 shadow-sm  `}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          <Heart size={16} fill={"none"} />
        </button>


        {showNew && (
          <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] tracking-[0.15em] uppercase px-3 py-1 font-body border border-gold/40 z-10">
            New
          </span>
        )}
        {showBestseller && (
          <span className="absolute top-3 left-3 bg-gold text-foreground text-[10px] tracking-[0.15em] uppercase px-3 py-1 font-body z-10">
            Bestseller
          </span>
        )}
      </Link>
      <div className="mt-3 text-center">
        <h3 className="font-heading text-sm md:text-base text-foreground leading-snug">{nameOverride ?? product.name}</h3>
        <p className="text-xs md:text-sm text-muted-foreground font-body mt-1 tracking-wide">
          {format(priceOverride ?? product.basePrice)}
        </p>
      </div>
    </div>
  );
};

export default ProductCard;
