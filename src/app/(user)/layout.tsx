import Footer from "@/components/Footer";
import NavBar from "@/components/userNavbar/NavBar";
import { getLandingSettings } from "@/lib/siteSettings";
import React from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { getAllCategories } from "@/lib/categoryHelper";
import { getNavbarCollections } from "@/lib/collections";
import AccountSync from "@/components/account/AccountSync";

// The storefront navigation reads live catalog and site settings.
export const dynamic = "force-dynamic";

const layout = async ({ children }: { children: React.ReactNode }) => {
  const [{ navbarMessages }, collections, categories] = await Promise.all([
    getLandingSettings(),
    getNavbarCollections(),
    getAllCategories(),
  ]);
  const categoryPriorities = Object.fromEntries(
    categories.map((item) => [item.slug, item.priority]),
  );
  return (
    <div>
      <AccountSync />
      <NavBar
        navbarMessages={navbarMessages}
        collections={collections}
        categoryPriorities={categoryPriorities}
      />
      {children}
      <Footer />

      <Link
        href={`https://wa.me/+917023117408`}
        target="_blank"
        data-storefront-concierge
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
