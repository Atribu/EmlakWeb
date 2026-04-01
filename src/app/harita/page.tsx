import type { Metadata } from "next";
import Link from "next/link";

import { PropertyMap } from "@/components/map/property-map";
import { PriceText } from "@/components/price-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAdvisors, listProperties } from "@/lib/data-store";
import { mapPageCopy } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = {
  title: "Harita | PortföySatış",
  description: "Portföy lokasyonlarını harita üzerinde görün, konum arayın ve ilana geçin.",
};

export default async function HaritaPage() {
  const language = await getServerSiteLanguage();
  const copy = mapPageCopy(language);
  const properties = listProperties();
  const advisors = listAdvisors();
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));

  const mapPortfolios = properties.map((property) => ({
    id: property.id,
    slug: property.slug,
    title: property.title,
    city: property.city,
    district: property.district,
    neighborhood: property.neighborhood,
    listingRef: property.listingRef,
    price: property.price,
    latitude: property.latitude,
    longitude: property.longitude,
    advisorName: advisorMap.get(property.advisorId)?.name,
  }));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">{copy.heroKicker}</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">{copy.heroTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            {copy.heroBody}
          </p>
        </section>

        <section className="frame-wide mt-7">
          <PropertyMap portfolios={mapPortfolios} />
        </section>

        <section className="frame mt-8">
          <div className="mb-4 flex items-end justify-between gap-2">
            <h2 className="text-[2rem] leading-none font-semibold text-[#201a14]">{copy.resultsTitle}</h2>
            <Link href="/portfoyler" className="text-sm font-semibold text-[#6a4f22] underline">
              {copy.switchToList}
            </Link>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {properties.slice(0, 6).map((property) => (
              <article key={property.id} className="luxury-card p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d7348]">{property.listingRef}</p>
                <h3 className="mt-1 text-2xl font-semibold leading-tight text-[#1f1a14]">{property.title}</h3>
                <p className="mt-1 text-sm text-[#675d50]">{property.city} / {property.district} / {property.neighborhood}</p>
                <p className="mt-2 text-sm font-semibold text-[#6c5127]"><PriceText amount={property.price} /></p>
                <Link href={`/ilan/${property.slug}`} className="mt-2 inline-block text-sm font-semibold underline">
                  {copy.detail}
                </Link>
              </article>
            ))}
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
