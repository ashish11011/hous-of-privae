import { EMAIL_URL, LINKEDIN_URL, navBarItems } from "@/const";
import { TShoppingCart } from "@/lib/icons";
import { Instagram, LinkedinIcon, Mail, PhoneCall, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";
import { Separator } from "../ui/separator";

const MobileAnimateNavBar = ({ isMobileNavOpen, setIsMobileNavOpen }: any) => {
  const contactIconsDetails = [
    {
      icon: <LinkedinIcon size={32} />,
      url: LINKEDIN_URL,
    },
    {
      icon: <Mail size={32} />,
      url: EMAIL_URL,
    },
    {
      icon: <PhoneCall size={32} />,
    },
  ];
  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full h-full bg-[#38080d] z-50 flex flex-col px-4 py-4"
        >
          <div className="">
            <X
              onClick={() => setIsMobileNavOpen(false)}
              className="block xl:hidden"
            />
          </div>

          <motion.div
            className="px-4 mt-8 flex flex-col space-y-6"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                  delayChildren: 0.1,
                },
              },
            }}
          >
            {navBarItems.map((item, idx: number) => (
              <Link key={idx} href={`/category/${item.slug}`}>
                <motion.div
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="capitalize font-bold text-2xl cursor-pointer "
                  onClick={() => {
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}

            <Separator className="my-4 w-full" />

            <Link href={`/about-us`}>
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 },
                }}
                className="capitalize font-bold text-2xl cursor-pointer "
                onClick={() => {
                  setIsMobileNavOpen(false);
                }}
              >
                About Us
              </motion.div>
            </Link>

            <div className=" flex flex-wrap">
              {contactIconsDetails.map((item, idx) => {
                return (
                  <Link
                    href={item.url ? item.url : "/"}
                    key={idx}
                    className=" flex items-center justify-center size-20 border"
                  >
                    {item.icon}
                  </Link>
                );
              })}
            </div>

            {/* <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="uppercase flex items-center gap-2 font-bold text-2xl cursor-pointer text-neutral-800 mt-10"
            >
              <TShoppingCart size={28} />
              Cart
            </motion.p> */}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileAnimateNavBar;
