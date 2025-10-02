import {
  TFacebook,
  TInstagram,
  TLinkedIn,
  TTwitter,
  TWhatsApp,
} from "@/lib/icons";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[#faf9f9]  py-12 px-6 pt-16 md:pt-32">
      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  gap-6 max-w-6xl mx-auto text-sm">
        {footerLinks.map((section, index) => (
          <div
            key={index}
            className="flex  flex-col md:text-center md:items-center"
          >
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
          <h4 className="font-semibold  text-xl mb-3">
            Offers, New Arrivals, <br /> Restocks and More.
          </h4>
          <button className="bg-yellow-950 w-full roboto text-white px-8 py-2 rounded-xs mt-auto  text-xl font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto">
            Stay Updated
            <TWhatsApp strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-xl ">
        <TFacebook className="size-8 hover:scale-110 duration-200 cursor-pointer" />
        <TInstagram className="size-8 hover:scale-110 duration-200 cursor-pointer" />
        <TTwitter className="size-8 hover:scale-110 duration-200 cursor-pointer" />
        {/* <Globe  /> */}
        {/* <Printer  /> */}
        <TLinkedIn className="size-8 hover:scale-110 duration-200 cursor-pointer" />
        <TWhatsApp className="size-8 hover:scale-110 duration-200 cursor-pointer" />
        {/* <FaWhatsapp /> */}
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
