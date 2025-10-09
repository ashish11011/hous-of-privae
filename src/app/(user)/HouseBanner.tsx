"use client";
import { useIsMobile } from "@/src/hooks/use-mobile";
import Image from "next/image";

export function HomeBanner() {
  const isMobile = useIsMobile();

  if (isMobile === null) {
    return null;
  }
  return (
    <div className=" w-full">
      <div>
        <div className=" hidden sm:block">
          <Image
            src={"/bannerimageweb.png"}
            alt="banner"
            width={1800}
            height={900}
            className=" w-full h-full object-cover"
          />
        </div>
        <div className=" sm:hidden block">
          <Image
            src={"/bannerimagemobile.png"}
            alt="banner"
            width={1800}
            height={900}
            className=" w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
