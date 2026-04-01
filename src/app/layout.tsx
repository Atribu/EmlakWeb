import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import { FloatingContactDock } from "@/components/floating-contact-dock";
import { SitePreferencesProvider } from "@/components/site-preferences-provider";
import { baseMetadata } from "@/lib/seo";
import { getServerHtmlLang, getServerSitePreferences } from "@/lib/site-preferences-server";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = baseMetadata();

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [htmlLang, initialPreferences] = await Promise.all([
    getServerHtmlLang(),
    getServerSitePreferences(),
  ]);

  return (
    <html lang={htmlLang}>
      <body className={`${manrope.variable} ${cormorant.variable} antialiased`}>
        <SitePreferencesProvider initialPreferences={initialPreferences}>
          {children}
          <FloatingContactDock />
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
