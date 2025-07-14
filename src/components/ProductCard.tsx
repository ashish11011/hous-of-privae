import { cn } from "@/lib";
import Image from "next/image";

export function ProductCard({
  itemData,
  className,
}: {
  itemData: ItemData;
  className?: string;
}) {
  return (
    <div className={cn(" shrink-0 flex w-72 lg:w-80 flex-col  ", className)}>
      <Image
        src={itemData.image}
        alt={itemData.name}
        width={800}
        height={800}
        className=" h-auto w-full object-cover"
      />

      <div className=" p-1 flex flex-col">
        <p className=" line-clamp-1">{itemData.name}</p>
        <p className=" text-red-400 text-sm roboto font-semibold">
          {itemData.price}INR
        </p>
      </div>
    </div>
  );
}

type ItemData = {
  name: string;
  image: string;
  price: string;
  type: string;
  details: string;
};
