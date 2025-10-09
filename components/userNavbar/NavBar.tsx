import Link from "next/link";
import Image from "next/image";
import { BRAND_NAME, navBarItems } from "@/const";
import { Button } from "../ui/button";
import NavBarClient from "./navBarClient";
import NavbarMobileMenu from "./navbarMobileMenu";

const NavBar = () => {
  return (
    <div className=" sticky  top-0 z-50 bg-[#38080d] text-white grid grid-cols-3 w-full items-center gap-6 justify-between px-3 md:px-5">
      <div className=" hidden 2xl:flex gap-4 items-center">
        <div className=" ">
          <div className="  w-full items-center">
            {navBarItems.map((item, idx: number) => {
              return (
                <Link key={idx} href={`/category/${item.slug}`}>
                  <Button className=" px-2 text-white" variant={"link"}>
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <NavbarMobileMenu />

      <Link
        href={"/"}
        className=" flex gap-3 w-full justify-center items-center"
      >
        <Image
          src="/logo-nobg.png"
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
