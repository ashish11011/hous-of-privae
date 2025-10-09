"use client";

import { motion } from "framer-motion";
const MotionHeading = () => {
  return (
    <>
      {" "}
      <motion.h1
        className="text-4xl md:text-6xl font-bold tracking-wide mb-12"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        ✨ A Dream Called <span className="text-gray-800">Haus of Privae</span>{" "}
        ✨
      </motion.h1>
    </>
  );
};

export default MotionHeading;
