import Footer from "@/components/Footer";
import NavBar from "@/components/userNavbar/NavBar";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hous Of Privae",
  description: "Hous Of Privae",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

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
