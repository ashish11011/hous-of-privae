"use client";

import type { ImageLoaderProps } from "next/image";
import { convertS3ToImageKit } from "../src/hepler/convertS3toImagekit";

export default function imageKitLoader({ src, width, quality }: ImageLoaderProps) {
  const imageSrc = convertS3ToImageKit(src);
  const url = new URL(
    imageSrc.startsWith("http") ? imageSrc : `https://ik.imagekit.io/hop${imageSrc}`
  );

  if (url.origin !== "https://ik.imagekit.io") return url.href;

  // ImageKit uses `tr`, not the Imgix-style `w` / `q` query parameters.
  const existing = url.searchParams.get("tr");
  url.searchParams.set("tr", [existing, `w-${width},q-${quality ?? 75}`].filter(Boolean).join(":"));
  return url.href;
}
