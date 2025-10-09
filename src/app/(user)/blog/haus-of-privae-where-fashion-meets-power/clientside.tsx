"use client";
import React from "react";
import { motion } from "framer-motion";

const Clientside = () => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 px-4"
      >
        <h1 className="text-4xl md:text-6xl font-serif mb-4">
          Haus of Privae — Where Fashion Meets Power
        </h1>
        <p className="uppercase tracking-wide text-sm md:text-base font-light">
          Luxury | Inclusivity | Sustainability | Empowerment
        </p>
        <p className="italic mt-6 text-lg max-w-2xl mx-auto">
          “Because when you dress with power, you don’t just wear clothes — you
          wear a statement, a story, a dream.”
        </p>
      </motion.div>
    </>
  );
};

export default Clientside;
