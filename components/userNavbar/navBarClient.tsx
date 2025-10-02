"use client";
import React from "react";
import { CartSheet } from "../cart/cartSheet";
import { useSession } from "next-auth/react";
import { NavBarDropdown } from "./dripdownMenu";
import Link from "next/link";

const NavBarClient = () => {
  return (
    <>
      <div className=" flex gap-3 items-center justify-end">
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
