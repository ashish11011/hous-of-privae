"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className="bg-white text-lg text-gray-900">
      {/* Hero Section */}
      <section className="relative  py-32  flex items-center justify-center text-center bg-gray-50">
        {/* <Image
          src="/images/about/dream.jpg"
          alt="Dream Called Haus of Privae"
          fill
          className="object-cover opacity-30"
        /> */}
        <div className="relative z-10 max-w-3xl mx-auto px-4 ">
          <motion.h1
            className="text-4xl md:text-6xl font-bold tracking-wide mb-12"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            ✨ A Dream Called{" "}
            <span className="text-gray-800">Haus of Privae</span> ✨
          </motion.h1>
          <p className="text-base md:text-lg text-gray-700">
            Dressing is not just about clothing, but about power - the power to
            express, redefine, and own every room you walk into.
          </p>
        </div>
      </section>

      {/* Dream Section */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-20">
        <div className="space-y-6 text-lg leading-relaxed">
          <p>
            For us, fashion is more than fabric; it is confidence stitched into
            every seam, elegance woven into every detail, and individuality
            tailored with perfection.
          </p>
          <p>
            We believe in the power of dressing - the way a well-curated attire
            can transform not only how the world sees you, but how you see
            yourself.
          </p>
          <p>
            Haus of Privae is a dream of bringing luxury, inclusivity, and
            empowerment together. Every piece is designed to honor diverse body
            shapes, crafted with sustainability in mind, and made to inspire you
            to step into your truest, boldest self.
          </p>
          <p className="font-medium italic">
            Because when you dress with power, you don't just wear clothes - you
            wear a statement, a story, a dream.
          </p>
        </div>
      </section>

      {/* Journey Section */}
      <section className=" py-10 sm:py-20">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row gap-12 px-6 items-center">
          <div>
            <Image
              src="https://ik.imagekit.io/hop/ab-4_0o2SYzT-l"
              alt="The Journey of Haus of Privae"
              width={600}
              height={400}
              className="rounded shadow-md w-[42rem] object-cover"
            />
          </div>
          <div>
            <h2 className="text-3xl font-semibold mb-6">
              🌿 The Journey of Haus of Privae
            </h2>
            <p className="text-lg leading-relaxed mb-4">
              Haus of Privae began as a dream - a vision to create a space where
              luxury meets purpose.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              What started as a small idea grew from a deep belief: that
              clothing is not just about style, but about power, identity, and
              confidence.
            </p>
            <p className="text-lg leading-relaxed mb-4">
              Stitch by stitch, sketch by sketch, it became a studio where
              fashion is not only tailored to perfection but also conscious and
              sustainable.
            </p>
            <p className="text-lg leading-relaxed">
              From its humble start to now, Haus of Privae continues to be a
              journey of passion, perseverance, and purpose - redefining luxury
              as something inclusive, empowering, and everlasting.
            </p>
          </div>
        </div>
      </section>

      {/* Goal Section */}
      <section className="max-w-6xl mx-auto px-6 py-10 sm:py-20 grid md:grid-cols-2 gap-12 items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-3xl font-semibold mb-6">🎯 Our Goal</h2>
          <p className="text-lg leading-relaxed">
            “Our goal is to redefine luxury fashion by creating timeless,
            eco-conscious attire that empowers every body shape and celebrates
            the power of dressing with confidence.”
          </p>
        </div>
        <div className="order-1 md:order-2">
          <Image
            src="https://ik.imagekit.io/hop/ab-3.jpg"
            alt="Haus of Privae Goal"
            width={600}
            height={400}
            className="rounded shadow-md max-h-80 object-cover"
          />
        </div>
      </section>

      {/* Closing Section */}
      <section className="bg-[#38080d] px-6 text-white py-16 text-center">
        <h3 className="text-2xl md:text-3xl font-semibold mb-4">
          Haus of Privae - Where Luxury Meets Power
        </h3>
        <p className="max-w-3xl mx-auto text-gray-300">
          Every design is more than an outfit - it’s an embodiment of strength,
          elegance, and individuality. Step into your story. Step into Haus of
          Privae.
        </p>
      </section>
    </div>
  );
}
