import Image from "next/image";
import { Metadata } from "next";
import { Sparkles, Heart, Leaf, Award, Phone, Mail, MapPin } from "lucide-react";

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
    images: [
      {
        url: "https://ik.imagekit.io/hop/white-logo.png",
        width: 1200,
        height: 630,
        alt: "Haus of Privae Logo",
      },
    ],
    type: "website",
  },
};

export default function AboutPage() {
  return (
    <main className="bg-background text-foreground">
      {/* Top Banner Image */}
      <div className="relative w-full h-[45vh] md:h-[65vh]">
        {/* Desktop Banner Image */}
        <Image
          src="https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/about-web.jpg"
          alt="Haus of Privae conscious craft"
          fill
          priority
          sizes="100vw"
          className="hidden md:block object-cover"
        />
        {/* Mobile Banner Image */}
        <Image
          src="https://codeframe-ashish-harshit.s3.ap-south-1.amazonaws.com/haus-of-privae/v1/website-images/about-mob.jpg"
          alt="Haus of Privae conscious craft"
          fill
          priority
          sizes="100vw"
          className="block md:hidden object-cover"
        />
      </div>

      {/* Centered Content Below the Image */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="eyebrow mb-3">Our Story</p>
          <h1 className="font-heading text-4xl md:text-6xl leading-tight">
            Where Luxury Meets Power
          </h1>
          <div className="section-rule my-8" />
          <div className="prose-editorial mx-auto max-w-2xl text-center">
            <p>
              Haus of Privae began as a dream to create a space where luxury
              meets purpose. Clothing, for us, is confidence stitched into
              fabric and individuality tailored with intention.
            </p>
            <p>
              Every piece is designed to honour diverse body shapes, crafted
              with conscious materials, and made to help you step into your
              truest, boldest self.
            </p>
          </div>
        </div>
      </section>

      {/* Section 1: Our Quiet Codes */}
      <section className="bg-card px-4 py-20 md:py-28 border-t border-border/40">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="eyebrow mb-3">Our Quiet Codes</p>
            <h2 className="font-heading text-3xl md:text-5xl tracking-wide text-foreground">
              Lineage · Restraint · Intention · Bespoke
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Sparkles,
                title: "Lineage",
                description:
                  "Quiet artistry, passed through generations of master karigars in Jaipur.",
              },
              {
                icon: Heart,
                title: "Restraint",
                description:
                  "For the woman who chooses presence over noise.",
              },
              {
                icon: Leaf,
                title: "Intention",
                description:
                  "Small batches. Home-grown fabric. Slow by design.",
              },
              {
                icon: Award,
                title: "Bespoke",
                description:
                  "Hand-finished to your measure, because fit is the first luxury.",
              },
            ].map(({ icon: Icon, title, description }) => (
              <article
                key={title}
                className="bg-white border border-border/10 shadow-sm p-8 text-center flex flex-col items-center justify-center min-h-[220px]"
              >
                <div className="mb-5 text-primary">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-heading text-2xl text-foreground mb-3">
                  {title}
                </h3>
                <p className="font-body text-xs md:text-sm leading-relaxed text-muted-foreground max-w-[200px]">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: The Atelier */}
      <section className="bg-white px-4 py-20 md:py-28 border-t border-border/40">
        <div className="container mx-auto max-w-4xl text-center">
          <p className="eyebrow mb-3">The Atelier</p>
          <h2 className="font-heading text-3xl md:text-5xl tracking-wide text-foreground mb-6">
            Handcrafted in Jaipur
          </h2>
          <div className="section-rule mb-8" />
          <p className="font-body text-sm md:text-base leading-relaxed text-muted-foreground max-w-2xl mx-auto mb-16">
            Our studio sits in the Pink City, where mornings begin with cutting and evenings end with the quiet rhythm of hand embroidery. Every Privae piece passes through these same rooms — sketched, stitched, and signed off, in person.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: "Visit the Studio",
                description: "Private Privae Fit session in Jaipur",
              },
              {
                title: "Privae Circle",
                description: "Our membership for connoisseurs",
              },
              {
                title: "Privae Concierge",
                description: "Phone, email or WhatsApp",
              },
            ].map(({ title, description }) => (
              <article
                key={title}
                className="bg-card border border-border/10 p-6 text-center flex flex-col items-center justify-center min-h-[120px]"
              >
                <h3 className="font-heading text-xl text-foreground mb-2">
                  {title}
                </h3>
                <p className="font-body text-xs text-muted-foreground">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Info Bar */}
      <section className="bg-background py-8 border-t border-border/40">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16 text-xs font-body text-muted-foreground">
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-primary" />
              <span>+91 70231 17408</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-primary" />
              <span>queries.hausofprivae@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-primary" />
              <span>Jaipur, India</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
