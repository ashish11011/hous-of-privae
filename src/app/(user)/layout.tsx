import Footer from "@/components/Footer";
import NavBar from "@/components/userNavbar/NavBar";
import { Metadata } from "next";
import React from "react";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
      <NavBar />
      {children}
      <Footer />
    </div>
  );
};

export default layout;
