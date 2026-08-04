import { Metadata } from "next";
import Link from "next/link";
import { EditorialGrid, EditorialPage } from "@/components/refined/EditorialPage";

export const metadata: Metadata = {
  title: "Privae Experience | Haus of Privae",
  description: "Gift a private Haus of Privae styling or atelier experience.",
  alternates: { canonical: "https://www.hausofprivae.com/gifting" },
};

export default function PrivaeExperiencePage() {
  return (
    <EditorialPage
      eyebrow="The Privae Experience"
      title="A Gift That Becomes A Wardrobe Memory"
      description="For birthdays, wedding trousseaus, festivities, and personal milestones, gift a guided styling conversation with the atelier."
      cta={{ label: "Speak To Concierge", href: "https://wa.me/917023117408" }}
    >
      <EditorialGrid
        items={[
          { title: "Styling Session", body: "A private discovery call to understand occasion, taste, silhouettes, and preferred level of ornamentation." },
          { title: "Atelier Credit", body: "A thoughtful gift value that can be redeemed against ready-to-wear, made-to-measure, or bespoke pieces." },
          { title: "Finishing Touches", body: "Packaging, notes, timelines, and delivery coordination handled with care by the Haus team." },
        ]}
      />
      <div className="mt-12 text-center">
        <Link href="/contact-us" className="text-primary underline underline-offset-4">
          Plan a Privae gift
        </Link>
      </div>
    </EditorialPage>
  );
}
