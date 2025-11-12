"use client";
import { ChevronDown, MenuIcon } from "lucide-react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import { useState } from "react";

export function SidebarNavSheet() {
  const [openCategory, setOpenCategory] = useState(false);
  const [openCollection, setOpenCollection] = useState(false);

  const categories = [
    "Sarees",
    "Lehengas",
    "Luxe Pret",
    "Loungewear",
    "Occasion Wear",
    "Ready to Wear",
    "Western Wear",
    "Accessories",
  ];

  const collections = ["Aarambh"];
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon size={22} className="cursor-pointer text-white" />
      </SheetTrigger>

      <SheetContent
        side="left"
        className="max-w-none w-full sm:max-w-sm border-none sm:border-r bg-[#2e0e2c] text-white"
      >
        <SheetHeader>
          <SheetTitle className="text-gray-300 text-lg">Menu</SheetTitle>
        </SheetHeader>

        <div className="p-4 flex h-full divide-y divide-yellow-800 flex-col gap-4">
          {/* Top links */}
          <Link href="/new-arrivals" className="text-xl font-semibold ">
            New Arrivals
          </Link>

          <Link href="/bestsellers" className="text-xl font-semibold ">
            Bestsellers
          </Link>

          {/* Categories dropdown */}
          <div>
            <div
              onClick={() => setOpenCategory(!openCategory)}
              className="flex justify-between items-center text-xl font-semibold cursor-pointer "
            >
              <span>Categories</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  openCategory ? "rotate-180" : ""
                }`}
              />
            </div>
            {openCategory && (
              <div className="mt-2 ml-4 flex flex-col gap-2 text-lg text-gray-300">
                {categories.map((cat, i) => (
                  <Link
                    href={`/category/${cat.toLowerCase().replace(/\s+/g, "-")}`}
                    key={i}
                    className=""
                  >
                    {cat}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Collections dropdown */}
          <div>
            <div
              onClick={() => setOpenCollection(!openCollection)}
              className="flex justify-between items-center text-xl font-semibold cursor-pointer "
            >
              <span>Collections</span>
              <ChevronDown
                size={18}
                className={`transition-transform ${
                  openCollection ? "rotate-180" : ""
                }`}
              />
            </div>
            {openCollection && (
              <div className="mt-2 ml-4 flex flex-col gap-2 text-lg text-gray-300">
                {collections.map((col, i) => (
                  <Link
                    href={`/collection/${col
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    key={i}
                    className=""
                  >
                    • {col}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Separator className="mt-auto w-full bg-gray-700" />

          <Link
            href="/about-us"
            className="capitalize font-bold text-2xl cursor-pointer "
          >
            About Us
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  );
}
