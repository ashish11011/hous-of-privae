"use client";
import { TShoppingCart } from "@/lib";
import { MenuIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const BRAND_NAME = "Haus Of Privae";

const NavBar = () => {
  const [selectedCategory, setSelectedCategory] = useState(-1);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const params = useParams();

  useEffect(() => {
    headingCategories.forEach((item, idx) => {
      if (item.slug == params.slug) {
        setSelectedCategory(idx);
      }
    });
  });
  return (
    // <div className=" sticky border-b-2 border-neutral-200 top-0 z-50 bg-white roboto h-12 lg:h-12 flex items-center gap-6 justify-between px-3 md:px-6  ">
    <div className=" sticky border-b-2 border-neutral-200 top-0 z-50 bg-white  h-12 lg:h-12 flex items-center gap-6 justify-between px-3 md:px-6  ">
      <div className="  flex gap-4 items-center">
        <Link
          href={"/"}
          className=" font-semibold text-neutral-900 text-3xl leading-none  uppercase tracking-tighter mr-6 "
        >
          {BRAND_NAME}
        </Link>
        <div className=" hidden lg:flex h-12  gap-6 items-center">
          {headingCategories.map((item, idx: number) => {
            return (
              <Link key={idx} href={`/category/${item.slug}`}>
                <div
                  className={`cursor-pointer font-medium text-sm uppercase h-full flex items-center justify-center  ${
                    selectedCategory === idx
                      ? "font-semibold border-black border-b-2"
                      : " text-neutral-500"
                  } `}
                >
                  {item.name}
                </div>
              </Link>
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
              {headingCategories.map((item, idx: number) => (
                <Link key={idx} href={`/category/${item.slug}`}>
                  <motion.div
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    className="uppercase font-bold text-2xl cursor-pointer text-neutral-700"
                    onClick={() => {
                      setIsMobileNavOpen(false);
                    }}
                  >
                    {item.name}
                  </motion.div>
                </Link>
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

const headingCategories = [
  {
    id: "d3d4f298-d5e4-4c55-9508-d77eecb7e38f",
    name: "All",
    slug: "all",
  },
  {
    id: "ae6d898a-65b1-4cd4-a69e-0b4f2ac0594b",
    name: "Top Collections",
    slug: "top-collections",
  },
  {
    id: "ef7996b0-4e56-4cf5-bbb9-fc4315f6fd94",
    name: "Trendy",
    slug: "trendy",
  },
  {
    id: "00c1cfbe-b7e1-4456-bc98-0a0240d59d8b",
    name: "Best Sellers",
    slug: "best-sellers",
  },
  {
    id: "9947cc44-27c0-43f6-aeae-ea83b038d2a5",
    name: "New Arrivals",
    slug: "new-arrivals",
  },
  {
    id: "cc920a84-4ef6-4269-8e09-3e249b63a2aa",
    name: "On Sale",
    slug: "on-sale",
  },
  {
    id: "82cc3756-70d1-4fd7-b601-6cb4df6e88b7",
    name: "Festival Session",
    slug: "festival-session",
  },
];
