import Link from "next/link";
import Image from "next/image";
import {
  BRAND_NAME,
  EMAIL_URL,
  LINKEDIN_URL,
  MOBILE_NUMBER_URL,
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
import { LinkedinIcon, Mail, MenuIcon, PhoneCall } from "lucide-react";
import CatList from "./catList";
import { Separator } from "../ui/separator";

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
    <div className=" sticky  top-0 z-50 bg-[#38080d] text-white grid grid-cols-3 w-full items-center gap-6 justify-between px-3 md:px-5">
      {/* <div className=" hidden 2xl:flex gap-4 items-center"> */}
      <div className=" flex gap-4 items-center">
        <SheetDemo />
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

      {/* <p className=" hidden lg:block">Basket</p> */}
    </div>
  );
};

export default NavBar;

function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <MenuIcon className=" cursor-pointer" />
      </SheetTrigger>
      <SheetContent
        side="left"
        className=" max-w-none w-full sm:max-w-sm border-none sm:border-r bg-[#38080d] text-white"
      >
        <SheetHeader>
          <SheetTitle className=" text-gray-300">Categories</SheetTitle>
          {/* <SheetDescription>
            Make changes to your profile here. Click save when you&apos;re done.
          </SheetDescription> */}
        </SheetHeader>
        <div className=" p-4 flex h-full flex-col gap-4">
          <CatList />

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
