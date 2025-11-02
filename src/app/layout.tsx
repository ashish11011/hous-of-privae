import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/lib/auth/authProvider";
import Script from "next/script";

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
      </body>
    </html>
  );
}
