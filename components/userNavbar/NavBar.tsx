"use client"
// import Link from "next/link";
// import Image from "next/image";
// import {
//   BRAND_NAME,
//   EMAIL_URL,
//   LINKEDIN_URL,
//   MOBILE_NUMBER_URL,
//   moreSidebarCategories,
//   navBarItems,
// } from "@/const";
// import NavBarClient from "./navBarClient";
// import {
//   Sheet,
//   SheetContent,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from "@/components/ui/sheet";
// import {
//   BookText,
//   LinkedinIcon,
//   Mail,
//   MenuIcon,
//   PhoneCall,
// } from "lucide-react";
// import { Separator } from "../ui/separator";

// import UpperNavBar from "./upperNavBar";

// const contactIconsDetails = [
//   {
//     icon: <LinkedinIcon size={32} />,
//     url: LINKEDIN_URL,
//   },
//   {
//     icon: <Mail size={32} />,
//     url: EMAIL_URL,
//   },
//   {
//     icon: <PhoneCall size={32} />,
//     url: MOBILE_NUMBER_URL,
//   },
// ];

// const NavBar = () => {
//   return (
//     <div className="sticky bg-[#38080d] text-white top-0 z-50">
//       <UpperNavBar />
//       <Separator className=" bg-[#61265d] h-2 w-full" />
//       <div className="   grid grid-cols-3 w-full items-center gap-6 justify-between px-3 md:px-5">
//         {/* <div className=" hidden 2xl:flex gap-4 items-center"> */}
//         <div className=" flex gap-1 sm:gap-2 md:gap-3 items-center">
//           <SidebarNavSheet />
//           <Link href={"/blog"}>
//             <div className=" p-0 text-white flex items-center gap-2">
//               <BookText className="block lg:hidden" size={22} />
//               <p className=" hidden lg:block"> Privae Atelier</p>
//             </div>
//           </Link>
//           <Link href={"/"}>
//             <div className=" p-0 text-white flex items-center gap-2">
//               <p className=" block lg:hidden font-semibold text-xl">अ</p>
//               <p className=" hidden lg:block">Aarambh</p>
//             </div>
//           </Link>
//         </div>

//         {/* <NavbarMobileMenu /> */}

//         <Link
//           href={"/"}
//           className=" flex gap-3 w-full justify-center items-center"
//         >
//           <Image
//             src="/white-logo.png"
//             alt="logo"
//             width={50}
//             height={50}
//             className=" w-auto text-center block md:hidden object-contain h-8"
//           />
//           <div className=" hidden md:block text-center font-semibold  text-3xl leading-none tracking-tighter!  uppercase font2 mr-5 ">
//             {BRAND_NAME}
//           </div>
//         </Link>

//         <NavBarClient />
//       </div>
//     </div>
//   );
// };

// export default NavBar;

// function SidebarNavSheet() {
//   return (
//     <Sheet>
//       <SheetTrigger asChild>
//         <MenuIcon size={22} className=" shrink-0 cursor-pointer" />
//       </SheetTrigger>
//       <SheetContent
//         side="left"
//         className=" max-w-none w-full sm:max-w-sm border-none sm:border-r bg-[#2e0e2c] text-white"
//       >
//         <SheetHeader>
//           <SheetTitle className=" text-gray-300">Menu</SheetTitle>
//         </SheetHeader>
//         <div className=" p-4 overflow-y-auto flex h-full flex-col gap-4">
//           <div className=" flex flex-col gap-4">
//             <Link href={`/new-arrivals/ `}>
//               <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
//                 New Arrivals
//               </div>
//             </Link>
//             <Link href={`/bestsellers/ `}>
//               <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
//                 Bestsellers
//               </div>
//             </Link>
//             <p className=" font-semibold text-sm underline text-gray-300 -mb-3 mt-2">
//               Categories
//             </p>

//             {[...navBarItems, ...moreSidebarCategories].map(
//               (item, idx: number) => (
//                 <Link key={idx} href={`/category/${item.slug}`}>
//                   <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
//                     {item.name}
//                   </div>
//                 </Link>
//               )
//             )}
//             <p className=" font-semibold text-sm underline text-gray-300 -mb-3 mt-2">
//               Collections
//             </p>
//             <Link href={`/aarambh/ `}>
//               <div className="capitalize font-bold text-2xl cursor-pointer hover:scale-105 duration-200 ">
//                 Aarambh
//               </div>
//             </Link>
//           </div>

//           <Separator className=" mt-auto w-full" />

//           <Link href={`/about-us`}>
//             <div className="capitalize font-bold text-2xl cursor-pointer ">
//               About Us
//             </div>
//           </Link>

//           <div className=" flex flex-wrap">
//             {contactIconsDetails.map((item, idx) => {
//               return (
//                 <Link
//                   href={item.url ? item.url : "/"}
//                   key={idx}
//                   className=" flex items-center justify-center size-20 border"
//                 >
//                   {item.icon}
//                 </Link>
//               );
//             })}
//           </div>
//         </div>

//         {/* <SheetFooter>
//           <Button type="submit">Save changes</Button>
//           <SheetClose asChild>
//             <Button variant="outline">Close</Button>
//           </SheetClose>
//         </SheetFooter> */}
//       </SheetContent>
//     </Sheet>
//   );
// }

export const collections = [
  {
    slug: "aarambh",
    name: "Aarambh",
    tagline: "The Beginning — Our Debut Collection",
    filter: () => true, // currently all products belong to Aarambh
  },
  // Example for a future launch (uncomment & customise when ready):
  // {
  //   slug: "saanjh",
  //   name: "Saanjh",
  //   tagline: "Twilight Edit",
  //   filter: (p) => p.collection === "saanjh",
  // },
];


import { useState } from "react";
import { ShoppingBag, Heart, User, Menu, X, Store, Search, Home, Scissors } from "lucide-react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import NotificationBar from "../navbar/notificationBar";
import Link from "next/link";
import SearchDialog from "./SearchDialog";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  // const { items: wishlistItems } = useWishlist();
  // const { count: cartCount } = useCart();
  // const { user } = useAuth();
  // const location = useLocation();
  // const navigate = useNavigate();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    closeMenu();
    if (location.pathname === "/") {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
    } else {
      // navigate("/", { state: { scrollTo: sectionId } });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm">
      <NotificationBar />

      <div className="border-b border-border">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center py-2 md:py-3">
          <Link href="/">
            <span className="text-xl md:text-3xl font-medium tracking-[0.35em] text-foreground" style={{ fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif" }}>
              HAUS OF PRIVAE
            </span>
          </Link>
          <span className="text-[9px] md:text-[11px] tracking-[0.25em] uppercase text-muted-foreground font-body mt-0.5">
            Elevated Luxury Wear
          </span>
        </div>
      </div>

      <nav className="border-b border-border">
        <div className="container mx-auto px-4 flex items-center justify-between h-12 md:h-14">
          <div className="flex items-center gap-4 md:gap-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            <TooltipProvider delayDuration={150}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => scrollToSection("privae-studio")}
                    aria-label="Privae Studio — Visit our atelier"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Store size={16} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8} className="bg-primary text-primary-foreground border-primary">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body">Privae Studio</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/bespoke"
                    aria-label="Privae Bespoke — Commission a piece"
                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Scissors size={16} />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={8} className="bg-primary text-primary-foreground border-primary">
                  <p className="text-[10px] tracking-[0.15em] uppercase font-body">Privae Bespoke</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <button onClick={() => setSearchOpen(true)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Search">
              <Search size={16} />
            </button>
            <button onClick={() => setWishlistOpen(true)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors relative" aria-label="Wishlist">
              <Heart size={16} />
              {/* {wishlistItems.length > 0 && ( */}
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {0}
              </span>
              {/* )} */}
            </button>
            <button onClick={() => setCartOpen(true)} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors relative" aria-label="Cart">
              <ShoppingBag size={16} />
              {/* {cartCount > 0 && ( */}
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[9px] rounded-full w-3.5 h-3.5 flex items-center justify-center">
                {0}
              </span>
              {/* )} */}
            </button>
            <Link href={"/login"} className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors" aria-label="Account">
              <User size={16} />
            </Link>
          </div>
        </div>

        {isMenuOpen && (
          <div className="border-t border-primary/20 bg-primary animate-fade-in-up">
            <div className="container mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
              {/* Home */}
              <div className="md:col-span-2">
                <Link href="/" onClick={closeMenu} className="nav-link inline-flex items-center gap-2 text-sm tracking-[0.15em] uppercase font-body text-primary-foreground hover:text-primary-foreground/80 transition-colors">
                  <Home size={14} strokeWidth={1.5} /> Home
                </Link>
              </div>

              {/* Collections */}
              <div>
                <h4 className="text-[10px] tracking-[0.25em] uppercase font-body text-primary-foreground/50 mb-4">
                  Collections
                </h4>
                <div className="space-y-3">
                  {collections.map((c) => (
                    <Link
                      key={c.slug}
                      href={`/collections/c/${c.slug}`}
                      onClick={closeMenu}
                      className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors"
                    >
                      {c.name}
                    </Link>
                  ))}
                  <Link
                    href="/collections"
                    onClick={closeMenu}
                    className="nav-link block text-[10px] tracking-[0.2em] uppercase font-body text-primary-foreground/60 hover:text-primary-foreground transition-colors pt-1"
                  >
                    The full collection →
                  </Link>
                </div>
              </div>

              {/* Shop by Category */}
              <div>
                <h4 className="text-[10px] tracking-[0.25em] uppercase font-body text-primary-foreground/50 mb-4">
                  Shop by Category
                </h4>
                <div className="space-y-3">
                  <Link href="/collections/sarees" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Sarees
                  </Link>
                  <Link href="/collections/occasion-wear" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Occasion Wear
                  </Link>
                  <Link href="/collections/loungewear" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Loungewear
                  </Link>
                  <Link href="/collections/co-ord-sets" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Co-ord Sets
                  </Link>
                </div>
              </div>

              {/* Discover */}
              <div>
                <h4 className="text-[10px] tracking-[0.25em] uppercase font-body text-primary-foreground/50 mb-4">
                  Discover
                </h4>
                <div className="space-y-3">
                  <Link href="/new-arrivals" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    New Arrivals
                  </Link>
                  <Link href="/privae-circle" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Privae Circle
                  </Link>
                  <Link href="/gifting" onClick={closeMenu} className="nav-link block text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/90 hover:text-primary-foreground transition-colors">
                    Privae Experience — Gift Card
                  </Link>
                </div>
              </div>

              {/* Footer band */}
              <div className="md:col-span-2 border-t border-primary-foreground/20 pt-5 mt-2 flex items-center justify-between flex-wrap gap-4">
                <Link href={"/login"} onClick={closeMenu} className="text-sm tracking-[0.15em] uppercase font-body text-primary-foreground/70 hover:text-primary-foreground transition-colors">
                  {"Sign In / Create Account"}
                </Link>
                {/* <CountrySelector /> — hidden until international shipping launches */}
              </div>
            </div>
          </div>
        )}
      </nav>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
      <WishlistDrawer open={wishlistOpen} onOpenChange={setWishlistOpen} /> */}
    </header>
  );
};

export default Navbar;
