import React from "react";
import { Quote } from "lucide-react";
import Clientside from "./clientside";

export const metadata = {
  title: {
    absolute: "Haus of Privae - Where Fashion Meets Power",
  },
  description:
    "Dive into Haus of Privae’s story - where luxury meets inclusivity, sustainability, and empowerment. Discover the art of conscious power dressing.",
  alternates: {
    canonical:
      "https://www.hausofprivae.com/blog/haus-of-privae-where-fashion-meets-power",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Haus of Privae - Where Fashion Meets Power",
    description:
      "A story of empowerment through design. Discover Haus of Privae’s vision of conscious luxury, inclusivity, and timeless craftsmanship.",
    url: "https://www.hausofprivae.com/blog/haus-of-privae-where-fashion-meets-power",
    siteName: "Haus of Privae",
    type: "article",
  },
};

export default function HausOfPrivaeBlog() {
  return (
    <div className="bg-white text-gray-800">
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center min-h-[28rem] py-24 items-center text-center text-white">
        <div className="absolute inset-0 bg-[#B89146]" />
        <Clientside />
      </section>

      {/* Content Section */}
      <article className="max-w-4xl mx-auto px-6 py-16 leading-relaxed space-y-16">
        {/* Section 1 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            The Birth of a Vision
          </h2>
          <p>
            Every brand begins with a belief. For <b>Haus of Privae</b>, that
            belief is simple yet profound — dressing is not about clothing
            alone; it’s about <b>power</b>. The power to express. The power to
            redefine. The power to own every room you walk into.
          </p>
          <p className="mt-4">
            In a world that moves fast and follows trends blindly, Haus of
            Privae stands still—anchored in authenticity. Here, fashion isn’t
            just fabric; it’s <b>confidence stitched into every seam</b>,{" "}
            <b>elegance woven into every thread</b>, and{" "}
            <b>individuality tailored to perfection</b>.
          </p>
          <PullQuote text="Fashion is more than appearance — it’s identity made visible." />
          <p>
            Each design carries intention and emotion, created for those who use
            clothing as their language of self-belief.
          </p>
        </section>

        {/* Section 2 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Luxury with a Purpose
          </h2>
          <p>
            Luxury at Haus of Privae goes beyond opulence. It’s a commitment to{" "}
            <b>thoughtful craftsmanship</b>, <b>timeless design</b>, and{" "}
            <b>sustainable innovation</b>.
          </p>
          <p className="mt-4">
            Every piece is created consciously — from responsibly sourced
            materials to artisan-made finishes that ensure longevity and value.
          </p>
          <PullQuote text="True luxury is conscious luxury — where elegance meets ethics." />
          <p>
            By embracing <b>slow fashion</b>, the brand redefines exclusivity.
            Each garment is intentionally limited, crafted not for mass appeal
            but for lasting connection. The result? Luxury that feels personal,
            purposeful, and profoundly modern.
          </p>
        </section>

        {/* Section 3 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Inclusivity Is Our Signature
          </h2>
          <p>
            Haus of Privae believes in fashion for <b>every body</b>. Each
            creation celebrates the diversity of shape, size, and spirit that
            defines real beauty.
          </p>
          <p className="mt-4">
            Through a <b>made-to-measure</b> approach, the label ensures that
            every client experiences the confidence of a perfect fit.
          </p>
          <PullQuote text="We don’t design to change your shape; we design to celebrate it." />
          <p>
            Inclusivity here isn’t performative—it’s foundational. From design
            sketches to fittings, the brand embraces{" "}
            <b>body positivity, representation,</b> and the philosophy that{" "}
            <b>style has no size limit</b>.
          </p>
        </section>

        {/* Section 4 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            The Art of Power Dressing
          </h2>
          <p>
            Power dressing, in the Haus of Privae universe, is not about
            armor—it’s about <b>aura</b>. It’s the confidence that flows from
            authenticity, the grace that follows intention, and the quiet
            strength that defines presence.
          </p>
          <PullQuote text="Power is not in the label you wear — it’s in how you wear it." />
          <p>
            Every silhouette is a story: structured blazers that command
            authority, fluid couture gowns that whisper elegance, and bespoke
            ensembles that exude inner power.
          </p>
        </section>

        {/* Section 5 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            Craftsmanship Meets Conscious Design
          </h2>
          <p>
            Behind every Haus of Privae creation lies meticulous artistry. In
            its ateliers, traditional craftsmanship meets contemporary
            sensibility.
          </p>
          <p className="mt-4">
            Each stitch is deliberate, each detail precise, each finish a
            reflection of <b>ethical fashion principles</b>.
          </p>
          <PullQuote text="Luxury must carry both elegance and empathy—for the planet, the people, and the process." />
          <p>
            Using <b>eco-friendly textiles</b>, <b>limited-waste techniques</b>,
            and <b>artisan expertise</b>, Haus of Privae champions a future
            where luxury and sustainability coexist gracefully.
          </p>
        </section>

        {/* Section 6 */}
        <section>
          <h2 className="text-2xl md:text-3xl font-semibold mb-4">
            A Statement, A Story, A Dream
          </h2>
          <p>
            Haus of Privae is more than a label—it’s a <b>movement</b>. A
            movement that celebrates{" "}
            <b>confidence, inclusivity, sustainability,</b> and{" "}
            <b>power dressing</b> as forms of empowerment.
          </p>
          <PullQuote text="When you dress with power, you don’t just wear clothes — you wear courage." />
          <p>
            Each design tells a story of courage and creativity, inviting the
            wearer to step into their most authentic self. Fashion fades;
            empowerment endures.
          </p>
        </section>
      </article>

      {/* Footer Taglines */}
      <footer className="bg-gray-100 py-10">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <p className="text-lg font-medium">Taglines</p>
          <ul className="space-y-2 italic text-gray-600">
            <li>• Luxury, tailored for every body.</li>
            <li>• Power dressing, reimagined.</li>
            <li>• Confidence is the true couture.</li>
            <li>• Haus of Privae — where style meets soul.</li>
          </ul>
        </div>
      </footer>
    </div>
  );
}

const PullQuote = ({ text }: { text: string }) => (
  <div className="flex justify-center my-10">
    <blockquote className="relative border-l-4 border-gray-300 pl-6 italic text-lg max-w-2xl">
      <Quote className="absolute -left-6 top-0 text-gray-400" size={28} />
      {text}
    </blockquote>
  </div>
);
