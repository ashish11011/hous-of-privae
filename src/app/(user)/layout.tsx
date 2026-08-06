import Footer from "@/components/Footer";
import NavBar from "@/components/userNavbar/NavBar";
import { getLandingSettings } from "@/lib/siteSettings";
import React from "react";
const layout = async ({ children }: { children: React.ReactNode }) => {
  const { navbarMessages } = await getLandingSettings();
  return (
    <div>
      <NavBar navbarMessages={navbarMessages} />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
