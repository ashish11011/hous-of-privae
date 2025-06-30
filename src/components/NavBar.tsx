"use client";
import { TShoppingCart } from "@/lib";
import { MenuIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";

const BRAND_NAME = "Hous Of Privae";

const NavBar = () => {
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  return (
    <div className=" sticky border-b-2 border-neutral-200 top-0 z-50 bg-white roboto h-12 lg:h-12 flex items-center gap-6 justify-between px-3 md:px-6  ">
      <div className="  flex gap-4 items-center">
        <span className=" font-semibold text-neutral-900 text-3xl leading-none  uppercase tracking-tighter mr-6 ">
          {BRAND_NAME}
        </span>
        <div className=" hidden lg:flex h-12  gap-6 items-center">
          {headingCategory.map((item: string, idx: number) => {
            return (
              <div
                onClick={() => setSelectedCategory(idx)}
                className={`cursor-pointer font-medium text-sm uppercase h-full flex items-center justify-center  ${
                  selectedCategory === idx
                    ? "font-semibold border-black border-b-2"
                    : " text-neutral-500"
                } `}
                key={idx}
              >
                {item}
              </div>
            );
          })}
        </div>
      </div>
      {!isMobileNavOpen && (
        <MenuIcon
          onClick={() => setIsMobileNavOpen(true)}
          className=" block lg:hidden"
        />
      )}

      <AnimatePresence>
        {isMobileNavOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col px-4 py-4"
          >
            <div className="ml-auto">
              <X
                onClick={() => setIsMobileNavOpen(false)}
                className="block lg:hidden"
              />
            </div>

            <motion.div
              className="px-4 mt-8 flex flex-col space-y-6"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.08,
                    delayChildren: 0.1,
                  },
                },
              }}
            >
              {headingCategory.map((item: string, idx: number) => (
                <motion.div
                  key={idx}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="uppercase font-bold text-2xl cursor-pointer text-neutral-700"
                  onClick={() => {
                    setSelectedCategory(idx);
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item}
                </motion.div>
              ))}

              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="uppercase flex items-center gap-2 font-bold text-2xl cursor-pointer text-neutral-800 mt-10"
              >
                <TShoppingCart size={28} />
                Basket
              </motion.p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className=" hidden lg:block">Basket</p>
    </div>
  );
};

export default NavBar;

const headingCategory = [
  "All",
  "Top Collections",
  "Trendy",
  "Best Sellers",
  "New Arrivals",
  "On Sale",
  "Festival Session",
];
