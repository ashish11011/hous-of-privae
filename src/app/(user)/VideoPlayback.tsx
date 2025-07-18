"use client";

import { useIsMobile } from "@/lib/Hooks";

export default function VideoPlay() {
  const isMobile = useIsMobile();
  if (isMobile === null) {
    return null;
  }
  return (
    <div className=" w-full">
      <video
        loop
        autoPlay
        muted
        playsInline
        className="desktop_video"
        style={{ width: "100%" }}
      >
        <source
          src={
            isMobile
              ? "https://cdn.shopify.com/videos/c/o/v/158c4fe5f7824698bc8223ee7e9f1423.mp4"
              : "https://cdn.shopify.com/videos/c/o/v/21a817ba98a342eb8fbd1106654fe8ba.mp4"
          }
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
