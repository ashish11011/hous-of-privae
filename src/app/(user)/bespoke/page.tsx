import { Metadata } from "next";
import BespokeRequestForm from "@/components/refined/BespokeRequestForm";

export const metadata: Metadata = {
  title: "Bespoke Commissions | Haus of Privae",
  description:
    "Commission a one-of-a-kind piece, made to your vision. Begin a private bespoke conversation with our Jaipur atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/bespoke" },
};

export default function BespokePage() {
  return (
    <div className="min-h-screen bg-background">
      <BespokeRequestForm />
    </div>
  );
}
