"use client";
import React, { useState } from "react";
import MobileAnimateNavBar from "./mobileAnimateNavBar";
import { MenuIcon } from "lucide-react";

const NavBarClient = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className=" flex xl:hidden">
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
      </div>
    </div>
  );
};

export default NavBarClient;
