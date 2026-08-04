import { Metadata } from "next";
import PrivaeFitForm from "@/components/refined/PrivaeFitForm";
import { EditorialPage } from "@/components/refined/EditorialPage";

export const metadata: Metadata = {
  title: "Privae Fit | Haus of Privae",
  description: "Submit custom measurements or book a private Jaipur studio fitting.",
  alternates: { canonical: "https://www.hausofprivae.com/privae-fit" },
};

export default function PrivaeFitPage() {
  return (
    <EditorialPage
      eyebrow="Privae Fit"
      title="A Fit Made Only For You"
      description="Every Haus of Privae piece can be tuned to your measurements. Choose remote measurement sharing or a private fitting appointment."
    >
      <PrivaeFitForm />
    </EditorialPage>
  );
}
