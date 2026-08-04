import { Metadata } from "next";
import { EditorialPage } from "@/components/refined/EditorialPage";

const terms = [
  ["Organza", "A sheer, crisp silk used for dupattas and lehengas that hold shape with lightness."],
  ["Tussar Silk", "Wild silk known for natural slub, warmth, and a soft golden undertone."],
  ["Chanderi", "A featherlight silk-cotton textile loved for sheen, breathability, and ceremony-ready ease."],
  ["Zardozi", "Metallic hand embroidery rooted in courtly craft traditions."],
  ["Gota Patti", "Rajasthani applique work using gold ribbon cut into floral and geometric motifs."],
  ["Aari", "A fine hooked-needle chain stitch suited to intricate floral detailing."],
];

export const metadata: Metadata = {
  title: "Atelier Glossary | Haus of Privae",
  description: "A glossary of fabrics and crafts used by the Haus of Privae atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/atelier/glossary" },
};

export default function GlossaryPage() {
  return (
    <EditorialPage
      eyebrow="The Atelier"
      title="A Glossary Of Craft"
      description="A small lexicon of fabrics and techniques you will meet on our pieces."
    >
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {terms.map(([word, meaning]) => (
          <article key={word} className="border-b border-border pb-5">
            <h2 className="font-heading text-3xl mb-2">{word}</h2>
            <p className="font-body text-sm leading-relaxed text-muted-foreground">{meaning}</p>
          </article>
        ))}
      </div>
    </EditorialPage>
  );
}
