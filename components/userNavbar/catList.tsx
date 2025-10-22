"use client";
import { AnimatePresence, motion } from "motion/react";

import { navBarItems } from "@/const";
import Link from "next/link";
import React from "react";

const CatList = () => {
  return (
    <div className=" flex flex-col gap-4">
      {navBarItems.map((item, idx: number) => (
        <Link key={idx} href={`/category/${item.slug}`}>
          <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
            {item.name}
          </div>
        </Link>
      ))}
    </div>
  );
};

export default CatList;
