"use client";
import Link from "next/link";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";
import { getImagePathForNextImage } from "@/lib/blogImage";

const BlogCard = ({ blog }: any) => {
  const imageSrc = getImagePathForNextImage(blog.image);

  return (
    <>
      <motion.div
        key={blog.id}
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 250, damping: 15 }}
        className="group bg-white rounded-2xl border border-gray-200 hover:border-[#B89146] hover:shadow-lg transition-all duration-300"
      >
        <Link href={`/blog/${blog.slug}`}>
          {imageSrc && (
            <div className="relative h-56 overflow-hidden rounded-t-2xl">
              <Image
                src={imageSrc}
                alt={blog.title ?? "Blog image"}
                fill
                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          <div className="p-8 flex flex-col h-full justify-between">
            <div>
              <h2
                className="text-2xl font-semibold mb-4 font-serif transition-colors"
                style={{ color: blog.color }}
              >
                {blog.title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {blog.metaDescription || blog.description}
              </p>
            </div>
            <div className="mt-6">
              <span
                className="inline-block text-sm font-medium group-hover:underline"
                style={{ color: blog.color }}
              >
                Read More →
              </span>
            </div>
          </div>
        </Link>
      </motion.div>
    </>
  );
};

export default BlogCard;
