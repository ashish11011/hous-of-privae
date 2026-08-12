import { Metadata } from "next";
import { EditorialPage } from "@/components/refined/EditorialPage";

const categories = [
  {
    name: "Fabrics",
    items: [
      [
        "Organza",
        "A sheer, crisp silk woven so finely it holds shape — favoured for dupattas and lehengas that move with intention.",
      ],
      [
        "Tussar Silk",
        "Wild silk reeled by hand from cocoons in Eastern India. Distinguished by its natural slub and warm gold undertone.",
      ],
      [
        "Chanderi",
        "A featherlight blend of silk and cotton woven in Madhya Pradesh — known for its sheen and breathability.",
      ],
      [
        "Kota Doria",
        "A handwoven Rajasthani fabric of square-checked weaves — light as gossamer, traditional to summer occasionwear.",
      ],
      [
        "Pure Silk",
        "Mulberry silk in its undiluted form — the most coveted ground for heirloom couture.",
      ],
      [
        "Velvet",
        "A pile-woven fabric with a deep, light-catching nap — a winter favourite for bridal and reception wear.",
      ],
    ],
  },
  {
    name: "Crafts & Embellishments",
    items: [
      [
        "Zardozi",
        "Persian-rooted metallic embroidery using gold and silver wire — the embroidery of Mughal courts and modern bridal couture.",
      ],
      [
        "Gota Patti",
        "A Rajasthani technique of appliquéd gold ribbon, cut and sewn into florals and geometric motifs. Native to Jaipur.",
      ],
      [
        "Mukaish",
        "An ancient Lucknowi craft of twisting fine metallic wire into the fabric to create tiny stars (badla) of light.",
      ],
      [
        "Aari",
        "A continuous chain stitch worked with a hooked needle — fine, fluid, and capable of intricate floral detail.",
      ],
      [
        "Chikankari",
        "Lucknow's signature white-on-white hand embroidery — quiet, scholarly, deeply traditional.",
      ],
      [
        "Resham",
        "Silk thread embroidery — the foundation of most surface ornamentation in Indian couture.",
      ],
      [
        "Kundan",
        "Uncut, foil-backed gemstones set into embellishments — borrowed from Jaipur's royal jewellery tradition.",
      ],
      [
        "Sequin & Pearl Work",
        "Hand-applied beadwork that catches light without overwhelming — for evening and reception wear.",
      ],
    ],
  },
];

export const metadata: Metadata = {
  title: "Atelier Glossary | Haus of Privae",
  description:
    "A glossary of fabrics and crafts used by the Haus of Privae atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/atelier/glossary" },
};

export default function GlossaryPage() {
  return (
    <EditorialPage
      eyebrow="The Atelier"
      title="A Glossary Of Craft"
      description="A small lexicon of the fabrics and techniques you will meet on our pieces — kept for the curious, and for those who like to know what their wardrobe is made of."
    >
      <div className="mx-auto mt-16 max-w-5xl space-y-20">
        {categories.map((category) => (
          <section key={category.name}>
            <div className=" pb-4 mb-6">
              <h2 className="font-heading text-lg uppercase text-gold tracking-wide">
                {category.name}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2">
              {category.items.map(([word, meaning]) => (
                <article key={word} className="border-b border-border pb-6">
                  <h3 className="font-heading text-xl md:text-2xl mb-2">
                    {word}
                  </h3>
                  <p className="font-body text-sm leading-relaxed text-muted-foreground">
                    {meaning}
                  </p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </EditorialPage>
  );
}
