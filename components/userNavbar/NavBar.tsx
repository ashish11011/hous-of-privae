"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Heart,
  Home,
  Menu,
  Search,
  Scissors,
  ShoppingBag,
  Store,
  User,
  X,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import NotificationBar from "../navbar/notificationBar";
import SearchDialog from "./SearchDialog";
import { useStore, userWishlistStore } from "@/src/hepler/store/zustand";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

const collectionLinks = [
  { label: "Aarambh", href: "/product" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Bestsellers", href: "/bestsellers" },
];

const categoryLinks = [
  { label: "Loungewear", href: "/category/loungewear" },
  { label: "Occasion Wear", href: "/category/occasion-wear" },
  { label: "Sarees", href: "/category/sarees" },
  { label: "Ready To Wear", href: "/category/ready-to-wear/" },
];

const discoverLinks = [
  { label: "Privae Bespoke", href: "/bespoke" },
  { label: "Privae Fit", href: "/privae-fit" },
  { label: "The Experience", href: "/gifting" },
];

export default function NavBar({
  navbarMessages,
}: {
  navbarMessages?: string[];
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const cartCount = useStore((state) =>
    state.productStore.reduce((total, item) => total + item.quantity, 0),
  );
  const wishlistCount = userWishlistStore(
    (state) => state.productWishlist.length,
  );

  const closeMenu = () => setIsMenuOpen(false);

  const goToStudio = () => {
    closeMenu();
    if (pathname === "/") {
      document
        .getElementById("privae-studio")
        ?.scrollIntoView({ behavior: "smooth" });
      return;
    }
    router.push("/#privae-studio");
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-neutral-950">
      <NotificationBar messages={navbarMessages} />

      <div className="border-b border-neutral-300 bg-white">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center py-2 md:py-3">
          <Link href="/" aria-label="Haus of Privae home">
            <span className="text-xl md:text-3xl font-medium tracking-[0.2em] text-neutral-950">
              HAUS OF PRIVAE
            </span>
          </Link>
          <span className="text-[9px] md:text-[11px] tracking-[0.25em] uppercase text-neutral-500 font-body mt-0.5">
            Elevated Luxury Wear
          </span>
        </div>
      </div>

      <nav className="border-b border-neutral-300 bg-white">
        <div className="container mx-auto px-4 flex items-center justify-between h-12 md:h-14 bg-white">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsMenuOpen((open) => !open)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={goToStudio}
                  aria-label="Visit Privae Studio"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
                >
                  <Store size={16} />
                </button>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                hideArrow
                className="bg-primary text-white font-body text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded-none border-0 shadow-md"
              >
                Privae Studio
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/bespoke"
                  aria-label="Commission a bespoke piece"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
                >
                  <Scissors size={16} />
                </Link>
              </TooltipTrigger>
              <TooltipContent
                side="bottom"
                sideOffset={8}
                hideArrow
                className="bg-primary text-white font-body text-[10px] tracking-[0.2em] uppercase px-4 py-2.5 rounded-none border-0 shadow-md"
              >
                Privae Bespoke
              </TooltipContent>
            </Tooltip>
            <Link
              href="https://d2t6059p6jfvt4.cloudfront.net/haus-of-privae/v1/website-images/HOP+Magazine.pdf"
              target="_blank"
              aria-label="Commission a bespoke piece"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
            >
              <BookOpen size={16} />
            </Link>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
              aria-label="Search"
            >
              <Search size={16} />
            </button>
            <Link
              href="/my-wishlist"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart size={16} />
              {wishlistCount > 0 && <CountBadge count={wishlistCount} />}
            </Link>
            <Link
              href="/checkout"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag size={16} />
              {cartCount > 0 && <CountBadge count={cartCount} />}
            </Link>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full text-neutral-950 bg-primary/10 hover:bg-primary hover:text-white transition-colors"
              aria-label="Account"
            >
              <User size={16} />
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="absolute left-0 right-0 top-full z-50 border-b border-t border-neutral-900 bg-white shadow-sm animate-fade-in-up">
            <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 bg-white">
              <div className="md:col-span-2">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="nav-link inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-body text-neutral-700 hover:text-neutral-950"
                >
                  <Home size={14} strokeWidth={1.5} /> Home
                </Link>
              </div>
              <MenuGroup
                title="Collections"
                links={collectionLinks}
                onClick={closeMenu}
              />
              <MenuGroup
                title="Shop By Category"
                links={categoryLinks}
                onClick={closeMenu}
              />
              <MenuGroup
                title="Discover"
                links={discoverLinks}
                onClick={closeMenu}
              />
              {/* <MenuGroup
                title="Client Care"
                links={[
                  { label: "Track Order", href: "/track" },
                  { label: "Shipping", href: "/order-and-shipping" },
                  { label: "Returns", href: "/returns-and-refunds" },
                  { label: "Contact", href: "/contact-us" },
                ]}
                onClick={closeMenu}
              /> */}
              <div className="md:col-span-2 border-t border-neutral-900 pt-5 mt-2">
                <Link
                  href="/auth/login"
                  onClick={closeMenu}
                  className="text-sm tracking-[0.15em] uppercase font-body text-neutral-700 hover:text-neutral-950 transition-colors"
                >
                  Sign In / Create Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}

function MenuGroup({
  title,
  links,
  onClick,
}: {
  title: string;
  links: { label: string; href: string }[];
  onClick: () => void;
}) {
  return (
    <div>
      <h4 className="text-[10px] tracking-[0.25em] uppercase font-body text-neutral-700 mb-4">
        {title}
      </h4>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClick}
            className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-neutral-700 hover:text-neutral-950 transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  return (
    <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] rounded-full min-w-3.5 h-3.5 px-1 flex items-center justify-center">
      {count}
    </span>
  );
}
