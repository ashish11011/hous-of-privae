import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BlogContent } from "@/components/blog/BlogContent";
import { getBlogBySlug } from "@/lib/blogHelper";
import { getImagePreviewUrl } from "@/lib/blogImage";

export const revalidate = 86400;
export const dynamic = "force-static";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.isVisible) {
    return { title: "Blog | Haus of Privae" };
  }

  return {
    title: `${blog.title} | Haus of Privae`,
    description:
      blog.metaDescription || "Read this Haus of Privae journal article.",
    alternates: { canonical: `https://www.hausofprivae.com/blog/${blog.slug}` },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const blog = await getBlogBySlug(slug);

  if (!blog || !blog.isVisible) notFound();

  return (
    <main className="min-h-screen bg-background">
      <article>
        <header className="px-4 pb-10 pt-24 md:px-8 md:pt-32">
          <div className="mx-auto max-w-4xl">
            <Link
              href="/blog"
              className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft size={16} />
              Back to blog
            </Link>
            <p className="eyebrow mb-4">{blog.blogCategory || "Blog"}</p>
            <h1 className="font-heading text-4xl md:text-6xl">{blog.title}</h1>
            {blog.metaDescription && (
              <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
                {blog.metaDescription}
              </p>
            )}
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
              {blog.date && <span>{blog.date}</span>}
              {blog.userName && <span>{blog.userName}</span>}
            </div>
          </div>
        </header>

        {blog.image && (
          <div className="px-4 md:px-8">
            <div className="mx-auto max-w-6xl">
              <img
                src={getImagePreviewUrl(blog.image)}
                alt={blog.title ?? ""}
                className="max-h-[680px] w-full object-cover"
              />
            </div>
          </div>
        )}

        <section className="px-4 py-12 md:px-8 md:py-16">
          <div className="mx-auto max-w-3xl">
            <BlogContent markdown={blog.data} />
          </div>
        </section>
      </article>
    </main>
  );
}
