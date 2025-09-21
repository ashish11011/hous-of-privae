import Link from "next/link";
import Image from "next/image";
import { BRAND_NAME, navBarItems } from "@/const";
import { Button } from "../ui/button";
import NavBarClient from "./navBarClient";

const NavBar = () => {
  return (
    <div className=" sticky border-b-2 border-neutral-200 top-0 z-50 bg-white  flex items-center gap-6 justify-between px-3 md:px-5">
      <div className="flex gap-4 items-center">
        <Link href={"/"} className=" flex gap-3 items-center">
          <Image
            src="/logo-nobg.png"
            alt="logo"
            width={50}
            height={50}
            className=" w-auto block md:hidden object-contain h-8"
          />
          <div className=" hidden md:block font-semibold text-neutral-900 text-3xl leading-none tracking-tighter!  uppercase font2 mr-5 ">
            {BRAND_NAME}
          </div>
        </Link>
        <div className=" ">
          <div className=" hidden xl:flex  w-full items-center">
            {navBarItems.map((item, idx: number) => {
              return (
                <Link key={idx} href={`/category/${item.slug}`}>
                  <Button variant={"link"}>{item.name}</Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <NavBarClient />

      {/* <p className=" hidden lg:block">Basket</p> */}
    </div>
  );
};

export default NavBar;
