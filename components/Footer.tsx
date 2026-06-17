"use client";
// import {
//   FACEBOOK_URL,
//   INSTAGRAM_URL,
//   LINKEDIN_URL,
//   TWITTER_URL,
//   WHATSAPP_URL,
// } from "@/const";
// import {
//   TFacebook,
//   TInstagram,
//   TLinkedIn,
//   TTwitter,
//   TWhatsApp,
// } from "@/lib/icons";
// import Link from "next/link";
// import { Label } from "./ui/label";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";
// import {
//   InputGroup,
//   InputGroupButton,
//   InputGroupInput,
// } from "./ui/input-group";
// import { useState } from "react";
// import { set } from "react-hook-form";
// import { toast } from "sonner";
// import { Toaster } from "./ui/sonner";

// const Footer = () => {
//   const [subscribeInput, setSubscribeInput] = useState("");
//   const sbmitSubscribe = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (subscribeInput.trim() != "") {
//       toast.success("Subscribed successfully");
//     } else {
//       toast.error("Please enter your email");
//     }

//     setSubscribeInput("");
//   };
//   return (
//     <footer className="bg-[#faf9f9]  py-12 px-6 pt-16 md:pt-32">
//       <Toaster position="top-right" />

//       <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  gap-6 max-w-6xl mx-auto text-sm">
//         {footerLinks.map((section, index) => (
//           <div key={index} className="flex  flex-col ">
//             <h4 className="font-semibold font2 text-xl mb-3">
//               {section.title}
//             </h4>
//             <ul className="space-y-1">
//               {section.items.map((item, idx) => (
//                 <Link href={item.slug} key={idx}>
//                   <li className=" text-lg text-yellow-950 ">{item.name}</li>
//                 </Link>
//               ))}
//             </ul>
//           </div>
//         ))}
//         <div className="flex gap-2 font2 flex-col md:text-center md:items-center">
//           <Label className=" w-full text-xl text-left">
//             Get insider access
//           </Label>
//           <form
//             onSubmit={sbmitSubscribe}
//             className=" flex flex-col gap-2 md:flex-row w-full"
//           >
//             <InputGroup>
//               <InputGroupInput
//                 type="email"
//                 placeholder="Enter your email"
//                 className=""
//                 value={subscribeInput}
//                 onChange={(e) => setSubscribeInput(e.target.value)}
//               />
//               <InputGroupButton type="submit">Subscribe</InputGroupButton>
//             </InputGroup>
//           </form>
//           <Link
//             href={"https://wa.me/917023117408"}
//             className="bg-[#2e0e2c] w-full roboto text-white px-8 py-2 rounded-xs mt-auto  text-xl font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto"
//           >
//             Stay Updated
//             <TWhatsApp strokeWidth={1.5} />
//           </Link>
//         </div>
//       </div>

//       <div className="mt-8 flex justify-center gap-4 text-xl">
//         {socialLinks.map(({ icon, url }, index) => (
//           <Link href={url} target="_blank" key={index}>
//             {icon}
//           </Link>
//         ))}
//       </div>
//       <p className="text-center text-sm text-gray-500 mt-6">
//         Copyright ©2025 Haus Of Privae. All rights reserved
//       </p>
//     </footer>
//   );
// };

// export default Footer;

// const footerLinks = [
//   {
//     title: "Haus Of Privae",
//     items: [
//       { name: "About Us", slug: "/about-us" },
//       { name: "Privacy Policy", slug: "/privacy-policy" },
//       { name: "Terms & Conditions", slug: "/terms-and-conditions" },
//       { name: "Trend Talks", slug: "/blog" },
//     ],
//   },
//   {
//     title: "Help & Support",
//     items: [
//       { name: "Order & Shipping", slug: "/order-and-shipping" },
//       { name: "Returns & Refunds", slug: "/returns-and-refunds" },
//       { name: "Contact Us", slug: "/contact-us" },
//     ],
//   },
// ];

// const socialLinks = [
//   {
//     icon: (
//       <TFacebook className="size-8 hover:scale-110 duration-200 cursor-pointer" />
//     ),
//     url: FACEBOOK_URL,
//   },
//   {
//     icon: (
//       <TInstagram className="size-8 hover:scale-110 duration-200 cursor-pointer" />
//     ),
//     url: INSTAGRAM_URL,
//   },
//   {
//     icon: (
//       <TTwitter className="size-8 hover:scale-110 duration-200 cursor-pointer" />
//     ),
//     url: TWITTER_URL,
//   },
//   {
//     icon: (
//       <TLinkedIn className="size-8 hover:scale-110 duration-200 cursor-pointer" />
//     ),
//     url: LINKEDIN_URL,
//   },
//   {
//     icon: (
//       <TWhatsApp className="size-8 hover:scale-110 duration-200 cursor-pointer" />
//     ),
//     url: WHATSAPP_URL,
//   },
// ];



import { Instagram, Mail, Facebook, Youtube, Linkedin, Twitter } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  // const { get } = useSiteSettings();

  const brandName = "Haus Of Privae";
  const brandDescription = "Where heritage meets modern elegance. Luxury occasionwear crafted with intention and worn with pride.";
  const infoLinks: any = [
    {
      label: "About Us",
      href: "/about-us",
    },
    {
      label: "Privacy Policy",
      href: "/privacy-policy",
    },
    {
      label: "Terms & Conditions",
      href: "/terms-and-conditions",
    },
    {
      label: "Trend Talks",
      href: "/blog",
    },
  ];
  const copyrightSuffix = "";
  const email = "";

  const socials = [
    { Icon: Instagram, href: "https://www.instagram.com/hausofprivae", label: "Instagram" },
    { Icon: Facebook, href: "https://www.facebook.com/hausofprivae", label: "Facebook" },
    { Icon: Youtube, href: "https://www.youtube.com/@hausofprivae", label: "YouTube" },
    { Icon: Twitter, href: "https://x.com/hausofprivae", label: "X (Twitter)" },
    // { Icon: Linkedin, href: "", label: "LinkedIn" },
    { Icon: Mail, href: "queries.hausofprivae@gmail.com", label: "Email" },
  ].filter((s) => !!s.href);

  return (
    <footer className="bg-[#282121] text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="font-heading text-2xl mb-4">{brandName}</h3>
            <p className="text-primary-foreground/60 text-sm font-body leading-relaxed">
              {brandDescription}
            </p>
          </div>

          {/* Info */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-body mb-4 text-primary-foreground/80">
              Information
            </h4>
            <ul className="space-y-2 text-sm font-body text-primary-foreground/60">
              {infoLinks.map((l: any) => (
                <li key={`${l.label}-${l.href}`}>
                  <Link href={l.href} className="hover:text-primary-foreground transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-xs tracking-[0.2em] uppercase font-body mb-4 text-primary-foreground/80">
              Connect
            </h4>
            <div className="flex flex-wrap gap-4">
              {socials.map(({ Icon, href, label }) => {
                const isExternal = href.startsWith("http");
                return (
                  <a
                    key={label}
                    href={href}
                    aria-label={label}
                    {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-primary-foreground/60 hover:text-primary-foreground transition-colors"
                  >
                    <Icon size={20} strokeWidth={1.5} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inline editorial newsletter signup */}
        <div className="mt-14 pt-10 border-t border-primary-foreground/10">
          <FooterNewsletter />
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-primary-foreground/10 text-center">
          <p className="text-[10px] tracking-[0.35em] uppercase font-body text-primary-foreground/60">
            © {new Date().getFullYear()} {brandName} · {copyrightSuffix}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { toast } from "sonner";

const FooterNewsletter = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/.+@.+\..+/.test(email)) {
      toast("Please enter a valid email.");
      return;
    }
    setSubmitting(true);
    const code = `WELCOME10-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    setSubmitting(false);

    setDone(true);
    setEmail("");
  };

  return (
    <div>
      <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-3 font-body">
        The Privae Edit
      </p>
      <p className="font-heading text-xl md:text-2xl text-primary-foreground leading-snug mb-2">
        Once a month. Never noisy.
      </p>
      <p className="text-xs font-body text-primary-foreground/60 leading-relaxed mb-5 max-w-md">
        Atelier stories, early access to new edits, and a 10% welcome offer for
        first-time subscribers.
      </p>

      {done ? (
        <p className="inline-flex items-center gap-2 text-xs font-body text-primary-foreground/80 border-b border-gold pb-1">
          <Check size={14} className="text-gold" /> You're on the list. Check your
          inbox.
        </p>
      ) : (
        <form
          onSubmit={subscribe}
          className="flex items-center gap-0 max-w-md border-b border-primary-foreground/30 focus-within:border-gold transition-colors"
        >
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm font-body text-primary-foreground placeholder:text-primary-foreground/40 outline-none"
            aria-label="Email address"
          />
          <button
            type="submit"
            disabled={submitting}
            className="text-[10px] tracking-[0.25em] uppercase font-body text-primary-foreground hover:text-gold transition-colors py-2.5 pl-3 disabled:opacity-50 inline-flex items-center gap-1.5"
          >
            {submitting && <Loader2 size={12} className="animate-spin" />}
            Subscribe
          </button>
        </form>
      )}
    </div>
  );
};

