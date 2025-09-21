import { navBarItems } from "@/const";
import { TShoppingCart } from "@/lib/icons";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import React from "react";

const MobileAnimateNavBar = ({ isMobileNavOpen, setIsMobileNavOpen }: any) => {
  return (
    <AnimatePresence>
      {isMobileNavOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 w-full h-full bg-white z-50 flex flex-col px-4 py-4"
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
                  className="uppercase font-bold text-2xl cursor-pointer text-neutral-700"
                  onClick={() => {
                    setIsMobileNavOpen(false);
                  }}
                >
                  {item.name}
                </motion.div>
              </Link>
            ))}

            <motion.p
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0 },
              }}
              className="uppercase flex items-center gap-2 font-bold text-2xl cursor-pointer text-neutral-800 mt-10"
            >
              <TShoppingCart size={28} />
              Basket
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileAnimateNavBar;
