import Link from "next/link";
import Image from "next/image";
import {
  BRAND_NAME,
  EMAIL_URL,
  LINKEDIN_URL,
  MOBILE_NUMBER_URL,
  moreSidebarCategories,
  navBarItems,
} from "@/const";
import NavBarClient from "./navBarClient";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  BookText,
  LinkedinIcon,
  Mail,
  MenuIcon,
  PhoneCall,
} from "lucide-react";
import { Separator } from "../ui/separator";

import UpperNavBar from "./upperNavBar";

const contactIconsDetails = [
  {
    icon: <LinkedinIcon size={32} />,
    url: LINKEDIN_URL,
  },
  {
    icon: <Mail size={32} />,
    url: EMAIL_URL,
  },
  {
    icon: <PhoneCall size={32} />,
    url: MOBILE_NUMBER_URL,
  },
];

const NavBar = () => {
  return (
    <div className="sticky bg-[#38080d] text-white top-0 z-50">
      <UpperNavBar />
      <Separator className=" bg-[#61265d] h-2 w-full" />
      <div className="   grid grid-cols-3 w-full items-center gap-6 justify-between px-3 md:px-5">
        {/* <div className=" hidden 2xl:flex gap-4 items-center"> */}
        <div className=" flex gap-1 sm:gap-2 md:gap-3 items-center">
          <SidebarNavSheet />
          <Link href={"/blog"}>
            <div className=" p-0 text-white flex items-center gap-2">
              <BookText className="block lg:hidden" size={22} />
              <p className=" hidden lg:block"> Privae Atelier</p>
            </div>
          </Link>
          <Link href={"/"}>
            <div className=" p-0 text-white flex items-center gap-2">
              <p className=" block lg:hidden font-semibold text-xl">अ</p>
              <p className=" hidden lg:block">Aarambh</p>
            </div>
          </Link>
        </div>

        {/* <NavbarMobileMenu /> */}

        <Link
          href={"/"}
          className=" flex gap-3 w-full justify-center items-center"
        >
          <Image
            src="/white-logo.png"
            alt="logo"
            width={50}
            height={50}
            className=" w-auto text-center block md:hidden object-contain h-8"
          />
          <div className=" hidden md:block text-center font-semibold  text-3xl leading-none tracking-tighter!  uppercase font2 mr-5 ">
            {BRAND_NAME}
          </div>
        </Link>

        <NavBarClient />
      </div>
    </div>
  );
};

export default NavBar;

function SidebarNavSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon size={22} className=" shrink-0 cursor-pointer" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className=" max-w-none w-full sm:max-w-sm border-none sm:border-r bg-[#2e0e2c] text-white"
      >
        <SheetHeader>
          <SheetTitle className=" text-gray-300">Menu</SheetTitle>
        </SheetHeader>
        <div className=" p-4 overflow-y-auto flex h-full flex-col gap-4">
          <div className=" flex flex-col gap-4">
            <Link href={`/new-arrivals/ `}>
              <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
                New Arrivals
              </div>
            </Link>
            <Link href={`/bestsellers/ `}>
              <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
                Bestsellers
              </div>
            </Link>
            <p className=" font-semibold text-sm underline text-gray-300 -mb-3 mt-2">
              Categories
            </p>

            {[...navBarItems, ...moreSidebarCategories].map(
              (item, idx: number) => (
                <Link key={idx} href={`/category/${item.slug}`}>
                  <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
                    {item.name}
                  </div>
                </Link>
              )
            )}
            <p className=" font-semibold text-sm underline text-gray-300 -mb-3 mt-2">
              Collections
            </p>
            <Link href={`/aarambh/ `}>
              <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
                Aarambh
              </div>
            </Link>
          </div>

          <Separator className=" mt-auto w-full" />

          <Link href={`/about-us`}>
            <div className="capitalize font-bold text-2xl cursor-pointer ">
              About Us
            </div>
          </Link>

          <div className=" flex flex-wrap">
            {contactIconsDetails.map((item, idx) => {
              return (
                <Link
                  href={item.url ? item.url : "/"}
                  key={idx}
                  className=" flex items-center justify-center size-20 border"
                >
                  {item.icon}
                </Link>
              );
            })}
          </div>
        </div>

        {/* <SheetFooter>
          <Button type="submit">Save changes</Button>
          <SheetClose asChild>
            <Button variant="outline">Close</Button>
          </SheetClose>
        </SheetFooter> */}
      </SheetContent>
    </Sheet>
  );
}
