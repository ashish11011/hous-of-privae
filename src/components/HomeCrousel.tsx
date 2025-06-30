"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const slides = [
  {
    id: 0,
    image: "/C_1.webp",
    imageMob: "/m1.jpeg",
    title: "Slide 1",
  },
  {
    id: 1,
    image: "/C_2.webp",
    imageMob: "/m2.jpeg",
    title: "Slide 2",
  },
  {
    id: 2,
    image: "/C_3.webp",
    imageMob: "/m3.jpeg",
    title: "Slide 3",
  },
];

function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= breakpoint : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function StackedCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndexRef = useRef(activeIndex);
  const isMobile = useIsMobile();

  useEffect(() => {
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[calc(70vh)] md:h-[calc(100vh-42px)] overflow-hidden bg-black">
      {/* Previous Slide */}
      <div className={`absolute w-full h-full inset-0`}>
        <Image
          src={
            isMobile
              ? slides[prevIndexRef.current].imageMob
              : slides[prevIndexRef.current].image
          }
          alt={slides[prevIndexRef.current].title}
          fill
          className="object-cover"
        />
      </div>

      {/* Active Slide Animation */}
      <AnimatePresence>
        <motion.div
          key={slides[activeIndex].id}
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "-100%" }}
          transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1] }}
          className="w-full absolute h-full inset-0"
        >
          <Image
            src={
              isMobile
                ? slides[activeIndex].imageMob
                : slides[activeIndex].image
            }
            alt={slides[activeIndex].title}
            fill
            className="object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-4">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-1 rounded-md w-10 cursor-pointer ${
              activeIndex === index ? "bg-white" : "bg-gray-400"
            }`}
          ></button>
        ))}
      </div>
    </div>
  );
}
