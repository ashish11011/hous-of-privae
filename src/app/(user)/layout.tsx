import Footer from "@/components/Footer";
import NavBar from "@/components/userNavbar/NavBar";
import { getLandingSettings } from "@/lib/siteSettings";
import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const { navbarMessages } = await getLandingSettings();
  return (
    <div>
      <NavBar navbarMessages={navbarMessages} />
      {children}
      <Footer />

      <Link
        href={`https://wa.me/+917023117408?text=Welcome%20to%20Haus%20of%20Privae%20%E2%9C%A8%0AWe%E2%80%99re%20delighted%20to%20have%20you%20here.%0A%0AStep%20into%20a%20world%20of%20refined%20craftsmanship%2C%20where%20every%20creation%20embodies%20elegance%20and%20individuality.%0A%0AOur%20team%20would%20be%20delighted%20to%20assist%20you%20with%20product%20or%20order-related%20queries%2C%20private%20appointments%2C%20or%20customization%20requests%20crafted%20exclusively%20for%20you.%0A%0AMay%20we%20know%20what%20you%E2%80%99d%20like%20help%20with%20today%3F
`}
        target="_blank"
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50"
      >
        <div className="flex items-center gap-3 px-5 py-3 md:px-6 md:py-3.5 bg-primary text-white hover:bg-primary/95 transition-all duration-150 cursor-pointer rounded-none shadow-xl hover:scale-105">
          <MessageCircle size={18} strokeWidth={1.5} />
          <p className="font-body text-[9px] text-white tracking-[0.2em] uppercase">
            Privae Concierge
          </p>
        </div>
      </Link>
    </div>
  );
};

export default layout;
