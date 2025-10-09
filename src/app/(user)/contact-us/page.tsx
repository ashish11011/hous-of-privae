import { Mail, PhoneCall } from "lucide-react";
import Link from "next/link";
import Submitform from "./submitform";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "Contact Us | Haus of Privae",
  },
  description:
    "Get in touch with Haus of Privae — whether it’s for inquiries, custom orders, collaborations, or media requests. Our team is here to assist you with elegance and care.",
  alternates: {
    canonical: "https://www.hausofprivae.com/contact-us",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Contact Us | Haus of Privae",
    description:
      "Reach out to Haus of Privae for general inquiries, custom orders, collaborations, or media requests. Experience luxury service with every interaction.",
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
  twitter: {
    card: "summary_large_image",
    title: "Contact Us | Haus of Privae",
    description:
      "Connect with Haus of Privae for inquiries, custom orders, or collaborations. Luxury service and personalized attention await you.",
    images: ["https://ik.imagekit.io/hop/white-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function ContactPage() {
  const contactDetails = [
    {
      icon: <PhoneCall size={36} />,
      label: "Call us",
      value: "+91 7023117408",
      link: "tel:+917023117408",
    },
    {
      icon: <Mail size={36} />,
      label: "Mail",
      value: "example@example.com",
      link: "mailto:example@example.com",
    },
  ];

  return (
    <main className="bg-white px-6 py-16 md:px-12 lg:px-32">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-medium text-center mb-12">
          Contact Us
        </h1>

        <Submitform />

        <div className=" w-full flex flex-col sm:flex-row justify-center items-center mt-5 sm:mt-10 gap-4">
          {contactDetails.map((item, index) => (
            <div
              className=" w-full flex items-center justify-center gap-2 flex-col py-5"
              key={index}
            >
              {item.icon}
              <p className=" font-semibold text-xl">{item.label}</p>
              <Link href={item.link} className=" underline">
                {item.value}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
