import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/lib/auth/authProvider";
import Script from "next/script";
import { TWhatsApp } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const inter = Inter({
  weight: ["400"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Haus of Privae | Luxury Clothing Brand",
    template: "%s | Haus of Privae",
  },
  description:
    "Haus of Privae is a premium luxury clothing brand redefining modern elegance. Explore curated fashion collections designed for individuality, sophistication, and timeless style.",
  alternates: {
    canonical: "https://www.hausofprivae.com",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Haus of Privae | Luxury Clothing Brand",
    description:
      "Explore Haus of Privae — where timeless elegance meets modern luxury. Shop exclusive fashion crafted for those who dare to stand apart.",
    url: "https://www.hausofprivae.com",
    siteName: "Haus of Privae",
    images: [
      {
        url: "https://ik.imagekit.io/hop/white-logo.png",
        width: 512,
        height: 512,
        alt: "Haus of Privae Logo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Haus of Privae | Luxury Clothing Brand",
    description:
      "Discover the art of luxury fashion with Haus of Privae — a premium brand redefining modern elegance.",
    images: ["https://ik.imagekit.io/hop/white-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Haus of Privae",
    url: "https://www.hausofprivae.com",
    logo: "https://ik.imagekit.io/hop/white-logo.png",
    sameAs: [
      "https://www.instagram.com/hausofprivae",
      "https://twitter.com/hausofprivae",
      "https://www.pinterest.com/hausofprivae",
    ],
  };

  return (
    <html lang="en">
      <head>
        {/* google site verification on housofprivae.com */}
        <meta
          name="google-site-verification"
          content="NQhsdCb-hJZhM8qtdWqudLIiuHozu5OTRkn-5WjLmhs"
        />
        <meta name="msvalidate.01" content="2F488A99AE94CB7DCADBDBE323CCB8A0" />
        <meta
          name="keywords"
          content="sustainable fashion, luxury clothing, ethical wear, Haus of Privae, handmade fashion"
        />
        <Script
          id="schema-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </head>
      <body
        cz-shortcut-listen="true"
        className={`   ${inter.className} bg-[#fff]  text-shadow-neutral-800 text-[#3d1700] antialiased`}
      >
        <SessionWrapper>{children}</SessionWrapper>
        {/* <div className=" bg-yellow-950 text-white p-1.5">
        </div> */}
        <Link
          href={`https://wa.me/+917023117408?text=Welcome%20to%20Haus%20of%20Privae%20%E2%9C%A8%0AWe%E2%80%99re%20delighted%20to%20have%20you%20here.%0A%0AStep%20into%20a%20world%20of%20refined%20craftsmanship%2C%20where%20every%20creation%20embodies%20elegance%20and%20individuality.%0A%0AOur%20team%20would%20be%20delighted%20to%20assist%20you%20with%20product%20or%20order-related%20queries%2C%20private%20appointments%2C%20or%20customization%20requests%20crafted%20exclusively%20for%20you.%0A%0AMay%20we%20know%20what%20you%E2%80%99d%20like%20help%20with%20today%3F
`}
          target="_blank"
        >
          <Button className="h-auto w-auto size-12 hover:scale-110 duration-150 cursor-pointer fixed bottom-8 right-8 z-50 rounded-full ">
            <TWhatsApp className=" size-8" />
          </Button>
        </Link>
      </body>
    </html>
  );
}
