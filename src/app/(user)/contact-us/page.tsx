import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";
import Submitform from "./submitform";
import { Metadata } from "next";
import FaqSection from "@/components/Faq";

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
};

const contactDetails = [
  { icon: Phone, label: "Call us", value: "+91 70231 17408", href: "tel:+917023117408" },
  { icon: Mail, label: "Mail", value: "queries.hausofprivae@gmail.com", href: "mailto:queries.hausofprivae@gmail.com" },
  { icon: MessageCircle, label: "WhatsApp", value: "Privae Concierge", href: "https://wa.me/917023117408" },
  { icon: MapPin, label: "Atelier", value: "Jaipur, India" },
];

export default function ContactPage() {
  return (
    <main className="bg-[#f7f4ef] text-foreground">
      <header className="bg-[#5e0c21] px-5 py-16 text-center text-white md:py-[4.5rem]">
        <p className="mb-3 text-[11px] uppercase tracking-[0.32em] text-[#e3ba70]">Get in touch</p>
        <h1 className="heading-rule font-heading text-4xl md:text-5xl">Contact Us</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80">
          We’d love to hear from you. Drop us a message and we’ll respond within 24 hours.
        </p>
      </header>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 md:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)] md:px-8 md:py-20 lg:gap-10">
        <section aria-labelledby="contact-form-heading">
          <h2 id="contact-form-heading" className="mb-5 font-heading text-2xl">Send us a message</h2>
          <Submitform />
        </section>

        <aside className="space-y-5" aria-labelledby="contact-details-heading">
          <section className="bg-[#f1ede6] p-6">
            <h2 id="contact-details-heading" className="mb-4 font-heading text-xl">Reach us directly</h2>
            <ul className="space-y-4">
              {contactDetails.map(({ icon: Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon size={16} className="mt-0.5 shrink-0 text-[#5e0c21]" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
                    {href ? (
                      <Link href={href} className="break-words text-sm underline-offset-4 hover:text-primary hover:underline">{value}</Link>
                    ) : <p className="text-sm">{value}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
          <div className="bg-[#eee8e1] p-6 text-center">
            <p className="mb-2 text-[10px] uppercase tracking-[0.22em] text-primary">Hours</p>
            <p className="text-sm text-muted-foreground">Mon – Sat · 10 AM – 7 PM IST</p>
          </div>
        </aside>
      </div>
      <FaqSection />
    </main>
  );
}
