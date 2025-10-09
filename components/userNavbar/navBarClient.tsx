import React from "react";
import { CartSheet } from "../cart/cartSheet";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { NavBarDropdown } from "./dripdownMenu";
import { authOptions } from "@/lib/auth/auth";

const NavBarClient = () => {
  return (
    <>
      <div className=" flex gap-3 items-center justify-end">
        <CartSheet />
        <NavbarUserMenu />
      </div>
    </>
  );
};

export default NavBarClient;

async function NavbarUserMenu() {
  const session = await getServerSession(authOptions);
  console.log("session: ", session);
  if (session) {
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
