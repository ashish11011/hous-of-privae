import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/lib/auth/authProvider";

const inter = Inter({
  weight: ["400"],
  subsets: ["latin"],
});

/* eslint-disable @typescript-eslint/no-unused-vars */

// const roboto = Roboto({
//   weight: ["400", "700", "900"],
//   subsets: ["latin"],
// });

// const amiri = Amiri({
//   weight: ["400", "700"],
//   subsets: ["latin"],
// });

// const www = Blinker({
//   weight: ["100", "200", "300", "400", "600", "700", "800", "900"],
//   subsets: ["latin"],
// });

/* eslint-enable @typescript-eslint/no-unused-vars */

export const metadata: Metadata = {
  // title: "Hous Of Privae",
  // description: "Hous Of Privae",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* google site indexing on bishnoi11011@gmail.com */}
        <meta
          name="google-site-verification"
          content="BuaN502DjcGk6w1rWnu02FyN7YUZyL9m8J6g3NgFSto"
        />
      </head>
      <body
        cz-shortcut-listen="true"
        className={`   ${inter.className}  text-shadow-neutral-800 antialiased`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
