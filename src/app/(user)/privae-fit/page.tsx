import { Metadata } from "next";
import PrivaeFitForm from "@/components/refined/PrivaeFitForm";

export const metadata: Metadata = {
  title: "Privae Fit | Haus of Privae",
  description:
    "Privae Fit - bespoke measurements and personalised tailoring at our Jaipur atelier.",
  alternates: { canonical: "https://www.hausofprivae.com/privae-fit" },
};

export default function PrivaeFitPage() {
  return (
    <div className="min-h-screen bg-background">
      <PrivaeFitForm />
    </div>
  );
}
