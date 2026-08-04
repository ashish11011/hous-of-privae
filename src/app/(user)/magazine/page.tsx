import { Metadata } from "next";
import Link from "next/link";
import { EditorialPage } from "@/components/refined/EditorialPage";

export const metadata: Metadata = {
  title: "Magazine | Haus of Privae",
  description: "Stories from the Haus of Privae atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/magazine" },
};

export default function MagazinePage() {
  return (
    <EditorialPage
      eyebrow="Magazine"
      title="Notes From The Maison"
      description="Editorial stories on craft, clothing, confidence, and the slow luxury world of Haus of Privae."
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-3">
        {[
          "Where Fashion Meets Power",
          "The Language Of Handwork",
          "Dressing For Ceremony",
        ].map((title, index) => (
          <article key={title} className="border border-border bg-card p-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.24em] text-gold">Issue 0{index + 1}</p>
            <h2 className="font-heading text-2xl mb-3">{title}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-5">
              A quiet read from the atelier on what makes clothing feel personal, powerful, and lasting.
            </p>
            {index === 0 && <Link href="/blog/haus-of-privae-where-fashion-meets-power" className="text-primary text-sm underline underline-offset-4">Read article</Link>}
          </article>
        ))}
      </div>
    </EditorialPage>
  );
}
