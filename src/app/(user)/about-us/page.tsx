import Image from "next/image";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "About Us | Haus of Privae" },
  description:
    "Discover the story behind Haus of Privae, a luxury fashion house built on empowerment, sustainability, and timeless design.",
  alternates: { canonical: "https://www.hausofprivae.com/about-us" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "About Haus of Privae | The Story Behind the Luxury Fashion Brand",
    description:
      "Haus of Privae combines sustainable craftsmanship, inclusivity, and timeless design.",
    url: "https://www.hausofprivae.com/about-us",
    siteName: "Haus of Privae",
    images: [{ url: "https://ik.imagekit.io/hop/white-logo.png", width: 1200, height: 630, alt: "Haus of Privae Logo" }],
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      <section className="container mx-auto grid min-h-[70vh] grid-cols-1 items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <p className="eyebrow mb-3">Our Story</p>
          <h1 className="font-heading text-4xl md:text-6xl leading-tight">
            Where Luxury Meets Power
          </h1>
          <div className="section-rule my-8 ml-0" />
          <div className="prose-editorial">
            <p>
              Haus of Privae began as a dream to create a space where luxury meets purpose.
              Clothing, for us, is confidence stitched into fabric and individuality tailored
              with intention.
            </p>
            <p>
              Every piece is designed to honour diverse body shapes, crafted with conscious
              materials, and made to help you step into your truest, boldest self.
            </p>
          </div>
        </div>
        <Image
          src="/refined/brand-consciously-crafted.jpg"
          alt="Haus of Privae conscious craft"
          width={900}
          height={1100}
          className="aspect-[4/5] w-full object-cover"
          priority
        />
      </section>

      <section className="bg-card px-4 py-16 md:py-24">
        <div className="container mx-auto grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            ["The Journey", "Stitch by stitch, sketch by sketch, the Haus grew into a Jaipur-rooted studio for conscious, powerful dressing."],
            ["The Goal", "To redefine luxury through timeless, eco-conscious attire that empowers every body shape."],
            ["The Promise", "A wardrobe language of strength, elegance, and individuality, finished with attentive craftsmanship."],
          ].map(([title, body]) => (
            <article key={title} className="border border-border bg-background p-6">
              <h2 className="font-heading text-3xl mb-3">{title}</h2>
              <p className="font-body text-sm leading-relaxed text-muted-foreground">{body}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
