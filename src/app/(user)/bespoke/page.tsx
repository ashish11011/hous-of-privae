import { Metadata } from "next";
import BespokeRequestForm from "@/components/refined/BespokeRequestForm";
import { EditorialGrid, EditorialPage } from "@/components/refined/EditorialPage";

export const metadata: Metadata = {
  title: "Privae Bespoke | Haus of Privae",
  description: "Commission a custom Haus of Privae piece with the Jaipur atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/bespoke" },
};

export default function BespokePage() {
  return (
    <EditorialPage
      eyebrow="Privae Bespoke"
      title="A Piece Made Around You"
      description="Begin with a silhouette, a memory, a colour, or a ceremony. Our atelier translates it into a made-to-measure piece with hand-finished detail."
    >
      <div className="space-y-14">
        <EditorialGrid
          items={[
            { meta: "01", title: "Vision", body: "Share the occasion, mood, garment type, references, and the feeling you want the piece to carry." },
            { meta: "02", title: "Atelier", body: "Our stylists refine silhouette, textile, embellishment, budget, and timeline before the first sketch is confirmed." },
            { meta: "03", title: "Fitting", body: "Measurements, finishing notes, and final adjustments are handled with the same quiet precision as the garment itself." },
          ]}
        />
        <BespokeRequestForm />
      </div>
    </EditorialPage>
  );
}
