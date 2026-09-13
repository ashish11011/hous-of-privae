import FaqSection from "@/components/Faq";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "FAQs | Haus of Privae" },
  description:
    "Find answers to common questions about Haus of Privae orders, customization, shipping, returns, garment care, and sustainability.",
  alternates: { canonical: "https://www.hausofprivae.com/faqs" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "FAQs | Haus of Privae",
    description:
      "Answers to common Haus of Privae questions about orders, customization, shipping, returns, garment care, and sustainability.",
    url: "https://www.hausofprivae.com/faqs",
    siteName: "Haus of Privae",
    images: [
      {
        url: "https://ik.imagekit.io/hop/white-logo.png",
        width: 1200,
        height: 630,
        alt: "Haus of Privae Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FAQs | Haus of Privae",
    description:
      "Find answers to common Haus of Privae questions before you shop.",
    images: ["https://ik.imagekit.io/hop/white-logo.png"],
  },
};

export default function FaqsPage() {
  return (
    <main className="bg-background px-4 py-16 md:py-24 text-foreground">
      {/* <FaqSection /> */}
    </main>
  );
}
