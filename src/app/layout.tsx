import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PortföySatış | Demo Emlak Portalı",
  description:
    "Satış odaklı emlak portalı demo sürümü. Portföy listeleme, filtreleme, iletişim formu ve rol tabanlı admin paneli içerir.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className={`${manrope.variable} ${spaceGrotesk.variable} antialiased`}>{children}</body>
    </html>
  );
}
