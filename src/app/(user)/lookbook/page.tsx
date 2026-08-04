import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

const images = [
  "/refined/hero-1.jpg",
  "/refined/hero-2.jpg",
  "/refined/shyama-purple-sharara.jpg",
  "/refined/shyama-purple-sharara-detail.jpg",
  "/refined/mehfil-embroidered-blouse.jpg",
  "/refined/accessory-potli-bangles.jpg",
];

export const metadata: Metadata = {
  title: "The Edit | Haus of Privae",
  description: "A refined visual lookbook from the Haus of Privae atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/lookbook" },
};

export default function LookbookPage() {
  return (
    <main className="bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto">
        <div className="mx-auto max-w-3xl text-center mb-14">
          <p className="eyebrow mb-3">The Edit</p>
          <h1 className="font-heading text-4xl md:text-6xl heading-rule">Notes In Silk And Light</h1>
          <p className="mx-auto mt-7 text-sm text-muted-foreground leading-relaxed">
            A quiet lookbook of silhouettes, details, accessories, and Jaipur-made occasionwear.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          {images.map((src, index) => (
            <div key={src} className={index === 0 ? "md:col-span-2 md:row-span-2" : ""}>
              <Image src={src} alt="Haus of Privae lookbook" width={900} height={1200} className="aspect-[3/4] h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/product" className="inline-flex border border-primary px-8 py-3 text-xs uppercase tracking-[0.2em] text-primary hover:bg-primary hover:text-primary-foreground">
            Shop The Edit
          </Link>
        </div>
      </div>
    </main>
  );
}
