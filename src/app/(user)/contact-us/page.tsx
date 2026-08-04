import { Mail, PhoneCall } from "lucide-react";
import Link from "next/link";
import Submitform from "./submitform";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: { absolute: "Contact Us | Haus of Privae" },
  description:
    "Get in touch with Haus of Privae for inquiries, custom orders, collaborations, or media requests.",
  alternates: { canonical: "https://www.hausofprivae.com/contact-us" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Contact Us | Haus of Privae",
    description:
      "Reach out to Haus of Privae for general inquiries, custom orders, collaborations, or media requests.",
    url: "https://www.hausofprivae.com/contact-us",
    siteName: "Haus of Privae",
    images: [{ url: "https://ik.imagekit.io/hop/white-logo.png", width: 1200, height: 630, alt: "Haus of Privae Logo" }],
    type: "website",
  },
};

export default function ContactPage() {
  const contactDetails = [
    { icon: <PhoneCall size={30} />, label: "Call", value: "+91 7023117408", link: "tel:+917023117408" },
    { icon: <Mail size={30} />, label: "Mail", value: "queries.hausofprivae@gmail.com", link: "mailto:queries.hausofprivae@gmail.com" },
  ];

  return (
    <main className="bg-background px-4 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl">
        <div className="text-center mb-12">
          <p className="eyebrow mb-3">Concierge</p>
          <h1 className="font-heading text-4xl md:text-6xl heading-rule">Contact The Haus</h1>
          <p className="mx-auto mt-7 max-w-2xl text-sm text-muted-foreground leading-relaxed">
            For product guidance, private appointments, custom orders, collaborations, or press enquiries.
          </p>
        </div>

        <div className="border border-border bg-card p-5 md:p-8">
          <Submitform />
        </div>

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {contactDetails.map((item) => (
            <Link
              href={item.link}
              className="flex flex-col items-center justify-center gap-3 border border-border bg-card py-7 text-center hover:border-primary transition-colors"
              key={item.label}
            >
              <span className="text-gold">{item.icon}</span>
              <p className="font-heading text-2xl">{item.label}</p>
              <span className="text-sm text-muted-foreground">{item.value}</span>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
