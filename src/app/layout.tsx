import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionWrapper from "@/lib/auth/authProvider";

const inter = Inter({
  weight: ["400"],
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Hous Of Privae",
//   description: "Hous Of Privae",
//   icons: {
//     icon: "/favicon.ico",
//     shortcut: "/favicon.ico",
//     apple: "/favicon.ico",
//   },
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link rel="icon" href="/favicon.ico" sizes="any" /> */}
        {/* google site indexing on bishnoi11011@gmail.com */}
        {/* <meta
          name="google-site-verification"
          content="BuaN502DjcGk6w1rWnu02FyN7YUZyL9m8J6g3NgFSto"
        /> */}

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
