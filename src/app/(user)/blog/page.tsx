import { Metadata } from "next";
import Link from "next/link";
import { getVisibleBlogs } from "@/lib/blogHelper";
import { getImagePreviewUrl } from "@/lib/blogImage";
import Image from "next/image";

export const revalidate = 86400;
export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog | Haus of Privae",
  description: "Read editorial stories from Haus of Privae.",
  alternates: { canonical: "https://www.hausofprivae.com/blog" },
};

export default async function BlogPage() {
  const blogs = await getVisibleBlogs();

  return (
    <main className="min-h-screen bg-background">
      <section className="px-4 pb-12 pt-24 md:px-8 md:pb-16 md:pt-32">
        <div className="mx-auto max-w-5xl text-center">
          <p className="eyebrow mb-4">Journal</p>
          <h1 className="font-heading text-4xl md:text-6xl">
            Stories From The Haus
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
            Notes on craft, occasionwear, styling, and the quiet details behind
            Haus of Privae.
          </p>
        </div>
      </section>

      <section className="px-4 pb-20 md:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.length === 0 ? (
            <div className="col-span-full border border-border bg-card p-10 text-center">
              <p className="text-sm text-muted-foreground">
                No blog articles are published yet.
              </p>
            </div>
          ) : (
            blogs.map((blog) => (
              <article key={blog.id} className="border border-border bg-card">
                <Link href={`/blog/${blog.slug}`} className="block">
                  {blog.image ? (
                    <Image
                      height={600}
                      width={600}
                      src={getImagePreviewUrl(blog.image)}
                      alt={blog.title ?? ""}
                      className="h-auto w-full object-cover"
                    />
                  ) : (
                    <div className="aspect-[4/3] w-full bg-secondary" />
                  )}
                  <div className="p-5">
                    <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gold">
                      {blog.blogCategory || "Blog"}
                      {blog.date ? ` / ${blog.date}` : ""}
                    </p>
                    <h2 className="font-heading text-2xl">{blog.title}</h2>
                    {blog.metaDescription && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {blog.metaDescription}
                      </p>
                    )}
                  </div>
                </Link>
              </article>
            ))
          )}

          <article className="border border-border bg-card">
            <Link
              target="_blank"
              href={`https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Magazine_1.pdf`}
              className="block"
            >
              <Image
                height={600}
                width={600}
                src={
                  "https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/Privae+edit+(magazine)+(1).png"
                }
                alt={"Magzine"}
                className="h-auto w-full object-cover"
              />

              <div className="p-5">
                <p className="mb-3 text-[10px] uppercase tracking-[0.28em] text-gold">
                  {"Magazine"}
                  {` / 2026-09-13`}
                </p>
                <h2 className="font-heading text-2xl">Magazine</h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  Read our first ever editorial and brand lookbook
                </p>
              </div>
            </Link>
          </article>
        </div>
      </section>
    </main>
  );
}
