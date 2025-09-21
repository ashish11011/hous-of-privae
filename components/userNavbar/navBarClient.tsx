"use client";
import React, { useState } from "react";
import MobileAnimateNavBar from "./mobileAnimateNavBar";
import { MenuIcon } from "lucide-react";
import { CartSheet } from "../cart/cartSheet";
import { useSession } from "next-auth/react";
import { NavBarDropdown } from "./dripdownMenu";
import Link from "next/link";

const NavBarClient = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <>
      <MobileAnimateNavBar
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
      />
      <div className=" flex gap-3 items-center">
        {!isMobileNavOpen && (
          <MenuIcon
            onClick={() => setIsMobileNavOpen(true)}
            className=" block xl:hidden"
          />
        )}

        <NavbarUserMenu />
        <CartSheet />
      </div>
    </>
  );
};

export default NavBarClient;

function NavbarUserMenu() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <div className=" z-50">
        <NavBarDropdown userName={session?.user?.name} />
      </div>
    );
  }
  return (
    <Link href="/auth/login">
      <p className=" hidden lg:block">Login</p>
    </Link>
  );
}
