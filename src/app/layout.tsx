import type { Metadata } from "next";
import { Instrument_Serif, Libre_Caslon_Display } from "next/font/google";
import "./globals.css";

const cardo = Libre_Caslon_Display({
  weight: ["400"],
  subsets: ["latin"],
});

/* eslint-disable @typescript-eslint/no-unused-vars */

const InstrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
});

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
      <body
        className={`   ${cardo.className}  text-shadow-neutral-800 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
