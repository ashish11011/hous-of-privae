import { cn } from "@/lib/utils";
import { convertS3ToImageKit } from "@/src/hepler";
import Image from "next/image";
import Link from "next/link";

export function ProductCard({ itemData, className }: any) {
  return (
    <Link
      href={`/product/${itemData.slug}`}
      className={cn(" shrink-0 flex w-72 lg:w-80 flex-col  ", className)}
    >
      <Image
        src={convertS3ToImageKit(itemData.bannerImage)}
        alt={itemData.name}
        width={800}
        height={800}
        className=" h-auto w-full object-cover"
      />

      <div className=" p-1 flex flex-col">
        <p className=" line-clamp-1">{itemData.name}</p>
        <p className=" text-red-400 text-sm roboto font-semibold">
          INR {itemData.basePrice}
        </p>
      </div>
    </Link>
  );
}
