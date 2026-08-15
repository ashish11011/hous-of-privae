import { Metadata } from "next";
import { legalPages, LegalPageSlug } from "./legal-content";

const siteUrl = "https://www.hausofprivae.com";
const logoUrl = "https://ik.imagekit.io/hop/white-logo.png";

export function getLegalMetadata(slug: LegalPageSlug, path: string): Metadata {
  const page = legalPages[slug];

  return {
    title: { absolute: `${page.title} | Haus of Privae` },
    description: page.description,
    alternates: { canonical: `${siteUrl}${path}` },
    robots: { index: true, follow: true },
    openGraph: {
      title: `${page.title} | Haus of Privae`,
      description: page.description,
      url: `${siteUrl}${path}`,
      siteName: "Haus of Privae",
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: "Haus of Privae Logo",
        },
      ],
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${page.title} | Haus of Privae`,
      description: page.description,
      images: [logoUrl],
    },
    icons: {
      icon: "/favicon.ico",
      shortcut: "/favicon.ico",
      apple: "/favicon.ico",
    },
  };
}

export default function LegalPageView({ slug }: { slug: LegalPageSlug }) {
  const page = legalPages[slug];

  return (
    <main className="min-h-screen bg-background px-4 py-12 md:py-20 text-foreground">
      <section className="container mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          {page.eyebrow && <p className="eyebrow mb-3">{page.eyebrow}</p>}
          <h1 className="font-heading text-4xl md:text-5xl text-foreground">
            {page.title}
          </h1>
          {page.subtitle && (
            <p className="mt-3 text-center text-xs tracking-[0.2em] uppercase text-muted-foreground">
              {page.subtitle}
            </p>
          )}
        </div>

        <article
          className="legal-prose font-body text-sm leading-relaxed text-muted-foreground space-y-6"
          dangerouslySetInnerHTML={{ __html: page.bodyHtml }}
        />
      </section>
    </main>
  );
}
