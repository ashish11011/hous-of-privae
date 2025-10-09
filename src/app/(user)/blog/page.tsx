import React from "react";
import BlogCard from "./blogCard";

export const metadata = {
  title: {
    absolute: "Haus of Privae Blog | Fashion, Power & Purpose",
  },
  description:
    "Explore the Haus of Privae Blog — stories of luxury, inclusivity, sustainability, and empowerment through conscious fashion.",
  alternates: {
    canonical: "https://www.hausofprivae.com/blog",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Haus of Privae Blog | Fashion, Power & Purpose",
    description:
      "Discover powerful fashion narratives from Haus of Privae — where luxury meets sustainability and inclusivity.",
    url: "https://www.hausofprivae.com/blog",
    siteName: "Haus of Privae",
    type: "website",
  },
};

const blogs = [
  {
    id: 1,
    title: "Haus of Privae - Where Fashion Meets Power",
    description:
      "Luxury | Inclusivity | Sustainability | Empowerment — Discover how Haus of Privae redefines modern luxury with conscious craftsmanship and power dressing.",
    slug: "haus-of-privae-where-fashion-meets-power",
    color: "#B89146", // Deep Royal Gold
  },
];

export default function BlogListPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-20 px-6">
      {/* Page Title */}
      <div className="max-w-6xl mx-auto text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif mb-4 text-[#B89146]">
          The Haus of Stories
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Explore inspiring stories of fashion, power, and purpose - curated
          from the world of Haus of Privae.
        </p>
      </div>

      {/* Blog Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
        {blogs.map((blog) => (
          <BlogCard blog={blog} key={blog.id} />
        ))}
      </div>
    </div>
  );
}
