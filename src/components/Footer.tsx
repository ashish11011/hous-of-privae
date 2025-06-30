import { TFacebook, TInstagram, TLinkedIn, TTwitter, TWhatsApp } from "@/lib";

const Footer = () => {
  return (
    <footer className="bg-[#FFFBF8] text-gray-800 py-12 px-6 pt-16 md:pt-32">
      <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3  gap-6 max-w-6xl mx-auto text-sm">
        {footerLinks.map((section, index) => (
          <div
            key={index}
            className="flex  flex-col md:text-center md:items-center"
          >
            <h4 className="font-semibold amr text-xl mb-3">{section.title}</h4>
            <ul className="space-y-1">
              {section.items.map((item, i) => (
                <li className=" text-lg  text-gray-600" key={i}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div className="flex gap-2 amr flex-col md:text-center md:items-center">
          <h4 className="font-semibold  text-xl mb-3">
            Offers, New Arrivals, <br /> Restocks and More.
          </h4>
          <button className="bg-green-600 w-full roboto hover:bg-green-800 text-white px-8 py-2 rounded-xs mt-auto  text-xl font-medium cursor-pointer flex items-center justify-center gap-2 mx-auto">
            Stay Updated
            <TWhatsApp strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-4 text-xl text-gray-800">
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
        Copyright ©2025 Hous of Privae. All rights reserved
      </p>
    </footer>
  );
};

export default Footer;

const footerLinks = [
  {
    title: "Hous Of Privae",
    items: ["About Us", "Privacy Policy", "Terms & Conditions"],
  },
  {
    title: "Help & Support",
    items: ["Order & Shipping", "Returns & Refunds", "Contact Us"],
  },
];
