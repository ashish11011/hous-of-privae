import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/lib/auth/authProvider";

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
    "Haus of Privae is a luxury clothing brand that blends sophistication with contemporary style. Discover premium collections crafted for elegance and individuality.",
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
  return (
    <html lang="en">
      <head>
        {/* google site verification on housofprivae.com */}
        <meta
          name="google-site-verification"
          content="NQhsdCb-hJZhM8qtdWqudLIiuHozu5OTRkn-5WjLmhs"
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
