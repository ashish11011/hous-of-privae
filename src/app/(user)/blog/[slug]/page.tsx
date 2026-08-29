import Image from "next/image";
import { notFound } from "next/navigation";
import { Quote } from "lucide-react";
import { getBlogBySlug } from "@/lib/blogHelper";
import { getImagePathForNextImage, getImagePreviewUrl } from "@/lib/blogImage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.isVisible) {
    return {
      title: "Blog | Haus of Privae",
    };
  }

  return {
    title: {
      absolute: blog.title ?? "Haus of Privae Blog",
    },
    description: blog.metaDescription ?? undefined,
    alternates: {
      canonical: `https://www.hausofprivae.com/blog/${blog.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: blog.title ?? "Haus of Privae Blog",
      description: blog.metaDescription ?? undefined,
      url: `https://www.hausofprivae.com/blog/${blog.slug}`,
      siteName: "Haus of Privae",
      type: "article",
      images: blog.image ? [{ url: getImagePreviewUrl(blog.image) }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.isVisible) notFound();

  const imageSrc = getImagePathForNextImage(blog.image);
  const authorImageSrc = getImagePathForNextImage(blog.userImage);

  return (
    <div className="bg-white text-gray-800">
      <section className="relative flex min-h-[28rem] items-end overflow-hidden px-6 py-16 text-white md:px-12">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={blog.title ?? "Blog image"}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-[#B89146]" />
        )}
        <div className="absolute inset-0 bg-black/45" />
        <div className="relative z-10 mx-auto w-full max-w-5xl space-y-4">
          {blog.blogCategory && (
            <p className="text-sm font-medium uppercase tracking-[0.18em]">
              {blog.blogCategory}
            </p>
          )}
          <h1 className="max-w-4xl text-4xl font-serif md:text-6xl">
            {blog.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/85">
            {blog.date && <span>{blog.date}</span>}
            {blog.userName && <span>{blog.userName}</span>}
          </div>
        </div>
      </section>

      <article className="mx-auto max-w-4xl px-6 py-16">
        {(blog.userName || authorImageSrc) && (
          <div className="mb-10 flex items-center gap-3 border-b pb-6">
            {authorImageSrc && (
              <Image
                src={authorImageSrc}
                alt={blog.userName ?? "Author"}
                width={48}
                height={48}
                className="h-12 w-12 rounded-full object-cover"
              />
            )}
            {blog.userName && (
              <div>
                <p className="text-sm text-muted-foreground">Written by</p>
                <p className="font-medium">{blog.userName}</p>
              </div>
            )}
          </div>
        )}

        <BlogContent content={blog.data ?? ""} />

        {blog.tags && blog.tags.length > 0 && (
          <div className="mt-12 flex flex-wrap gap-2 border-t pt-6">
            {blog.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-3 py-1 text-xs text-gray-600"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>
    </div>
  );
}

function BlogContent({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length === 0) {
    return (
      <div className="flex justify-center my-10">
        <blockquote className="relative border-l-4 border-gray-300 pl-6 italic text-lg max-w-2xl">
          <Quote className="absolute -left-6 top-0 text-gray-400" size={28} />
          More from the Haus of Privae journal.
        </blockquote>
      </div>
    );
  }

  return (
    <div className="space-y-8 leading-relaxed">
      {blocks.map((block, index) => {
        if (block.startsWith("### ")) {
          return (
            <h3 key={index} className="text-2xl font-semibold">
              {block.replace(/^### /, "")}
            </h3>
          );
        }

        if (block.startsWith("## ")) {
          return (
            <h2 key={index} className="text-3xl font-semibold">
              {block.replace(/^## /, "")}
            </h2>
          );
        }

        if (block.startsWith("# ")) {
          return (
            <h2 key={index} className="text-3xl font-semibold">
              {block.replace(/^# /, "")}
            </h2>
          );
        }

        if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
          return (
            <ul key={index} className="list-disc space-y-2 pl-5">
              {block.split("\n").map((line) => (
                <li key={line}>{line.trim().replace(/^- /, "")}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={index} className="whitespace-pre-line text-gray-700">
            {block}
          </p>
        );
      })}
    </div>
  );
}
