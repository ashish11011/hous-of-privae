"use client";

import { forwardRef } from "react";
import { Play, Youtube } from "lucide-react";

const videos = [
  {
    title: "Zareen",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Zareen.mp4",
    href: "https://youtube.com/shorts/yM-g53B7G6M?si=NIa0UMDU0PoREyv9",
  },
  {
    title: "Chandni",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Chandni.mp4",
    href: "https://youtube.com/shorts/baQbYTrb8Wk?si=Ju816B8-bUGZfW9K",
  },
  {
    title: "Gulnaar",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Gulnaar.mp4",
    href: "https://youtube.com/shorts/tZWRJqDnMCY?si=32VVc7IaBTxY7uXR",
  },
  {
    title: "Gulnaar",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/video5.mp4",
    href: "https://youtube.com/shorts/tZWRJqDnMCY?si=32VVc7IaBTxY7uXR",
  },
  {
    title: "Gulnaar",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/video3.mp4",
    href: "https://youtube.com/shorts/tZWRJqDnMCY?si=32VVc7IaBTxY7uXR",
  },
  {
    title: "Gulnaar",
    src: "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/video4.mp4",
    href: "https://youtube.com/shorts/tZWRJqDnMCY?si=32VVc7IaBTxY7uXR",
  },
];

const WatchTheMaisonSection = forwardRef<HTMLElement>((_, ref) => {
  return (
    <section ref={ref} className="pb-16 md:pb-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">The Privae Lens</p>
          <h2 className="font-heading text-3xl md:text-5xl text-foreground heading-rule">
            Watch The Maison Move
          </h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-body mt-4">
            A closer look at drape, detail, and presence through our latest
            campaign films.
          </p>
        </div>

        <div className="group/marquee overflow-hidden w-full">
          <div
            className="flex gap-4 md:gap-5 w-max animate-[marquee_30s_linear_infinite] group-hover/marquee:[animation-play-state:paused]"
          >
            {[...videos, ...videos].map((video, i) => (
              <a
                key={`${video.title}-${i}`}
                href={video.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Watch ${video.title} on YouTube Shorts`}
                className="group relative block overflow-hidden rounded-md bg-muted shadow-md hover:shadow-xl transition-shadow aspect-[9/16] w-[220px] md:w-[280px] shrink-0"
              >
                <video
                  src={video.src}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/15 to-transparent" />

                <div className="absolute top-3 left-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-background/90 text-foreground">
                  <Youtube size={14} />
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-4 md:p-5">
                  <p className="text-primary-foreground font-heading leading-tight text-xl md:text-2xl">
                    {video.title}
                  </p>
                  <p className="text-primary-foreground/70 text-[10px] tracking-[0.25em] uppercase font-body mt-1">
                    Watch on YouTube
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <a
            href="https://www.youtube.com/@hausofprivae"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs tracking-[0.25em] uppercase text-primary hover:opacity-70 transition-opacity"
          >
            <Youtube size={14} /> YouTube
          </a>
        </div>
      </div>
    </section>
  );
});

WatchTheMaisonSection.displayName = "WatchTheMaisonSection";

export default WatchTheMaisonSection;
