"use client";
import {
  FACEBOOK_URL,
  INSTAGRAM_URL,
  LINKEDIN_URL,
  TWITTER_URL,
  WHATSAPP_URL,
} from "@/const";
import {
  TFacebook,
  TInstagram,
  TLinkedIn,
  TTwitter,
  TWhatsApp,
} from "@/lib/icons";
import Link from "next/link";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  InputGroup,
  InputGroupButton,
  InputGroupInput,
} from "./ui/input-group";
import { useState } from "react";
import { set } from "react-hook-form";
import { toast } from "sonner";
import { Toaster } from "./ui/sonner";

const Footer = () => {
  const [subscribeInput, setSubscribeInput] = useState("");
  const sbmitSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeInput.trim() != "") {
      console.log(subscribeInput);
      toast.success("Subscribed successfully");
    } else {
      toast.error("Please enter your email");
    }

    setSubscribeInput("");
  };
  return (
    <footer className="bg-[#faf9f9]  py-12 px-6 pt-16 md:pt-32">
      <Toaster position="top-right" />

      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  gap-6 max-w-6xl mx-auto text-sm">
        {footerLinks.map((section, index) => (
          <div key={index} className="flex  flex-col ">
            <h4 className="font-semibold font2 text-xl mb-3">
              {section.title}
            </h4>
            <ul className="space-y-1">
              {section.items.map((item, idx) => (
                <Link href={item.slug} key={idx}>
                  <li className=" text-lg text-yellow-950 ">{item.name}</li>
                </Link>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex gap-2 font2 flex-col md:text-center md:items-center">
          <Label className=" w-full text-xl text-left">
            Get insider access
          </Label>
          <form
            onSubmit={sbmitSubscribe}
            className=" flex flex-col gap-2 md:flex-row w-full"
          >
            <InputGroup>
              <InputGroupInput
                type="email"
                placeholder="Enter your email"
                className=""
                value={subscribeInput}
                onChange={(e) => setSubscribeInput(e.target.value)}
              />
              <InputGroupButton type="submit">Subscribe</InputGroupButton>
            </InputGroup>
          </form>
          <Link
            href={"https://wa.me/917023117408"}
            className="bg-yellow-950 w-full roboto text-white px-8 py-2 rounded-xs mt-auto  text-xl font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto"
          >
            Stay Updated
            <TWhatsApp strokeWidth={1.5} />
          </Link>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-xl">
        {socialLinks.map(({ icon, url }, index) => (
          <Link href={url} target="_blank" key={index}>
            {icon}
          </Link>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Copyright ©2025 Haus Of Privae. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;

const footerLinks = [
  {
    title: "Haus Of Privae",
    items: [
      { name: "About Us", slug: "/about-us" },
      { name: "Privacy Policy", slug: "/privacy-policy" },
      { name: "Terms & Conditions", slug: "/terms-and-conditions" },
      { name: "Trend Talks", slug: "/blog" },
    ],
  },
  {
    title: "Help & Support",
    items: [
      { name: "Order & Shipping", slug: "/order-and-shipping" },
      { name: "Returns & Refunds", slug: "/returns-and-refunds" },
      { name: "Contact Us", slug: "/contact-us" },
    ],
  },
];

const socialLinks = [
  {
    icon: (
      <TFacebook className="size-8 hover:scale-110 duration-200 cursor-pointer" />
    ),
    url: FACEBOOK_URL,
  },
  {
    icon: (
      <TInstagram className="size-8 hover:scale-110 duration-200 cursor-pointer" />
    ),
    url: INSTAGRAM_URL,
  },
  {
    icon: (
      <TTwitter className="size-8 hover:scale-110 duration-200 cursor-pointer" />
    ),
    url: TWITTER_URL,
  },
  {
    icon: (
      <TLinkedIn className="size-8 hover:scale-110 duration-200 cursor-pointer" />
    ),
    url: LINKEDIN_URL,
  },
  {
    icon: (
      <TWhatsApp className="size-8 hover:scale-110 duration-200 cursor-pointer" />
    ),
    url: WHATSAPP_URL,
  },
];
