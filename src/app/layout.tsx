import type { Metadata } from "next";
import { Montserrat } from "next/font/google";

import { FloatingContactDock } from "@/components/floating-contact-dock";
import { SitePreferencesProvider } from "@/components/site-preferences-provider";
import { baseMetadata } from "@/lib/seo";
import { getServerHtmlLang, getServerSitePreferences } from "@/lib/site-preferences-server";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
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
      <body className={`${montserrat.variable} antialiased`}>
        <SitePreferencesProvider initialPreferences={initialPreferences}>
          {children}
          <FloatingContactDock />
        </SitePreferencesProvider>
      </body>
    </html>
  );
}
