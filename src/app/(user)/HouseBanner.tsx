"use client";
import SampleImage from "@/components/sampleImage";
import { useIsMobile } from "@/lib/Hooks";
import Image from "next/image";

export function HomeBanner() {
  const isMobile = useIsMobile();

  if (isMobile === null) {
    return null;
  }
  return (
    // <Image
    //   src={isMobile ? "/home_banner_mob.webp" : "/home_banner.jpg"}
    //   alt="banner"
    //   width={800}
    //   height={800}
    //   className=" h-auto w-full object-cover"
    // />
    <div className=" h-96 w-full">
      <SampleImage />
    </div>
  );
}
