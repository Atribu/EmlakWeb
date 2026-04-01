import type { Metadata } from "next";
import Link from "next/link";

import { SellPropertyForm } from "@/components/sell-property-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listProperties } from "@/lib/data-store";
import { sellPageCopy } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = {
  title: "Emlak Sat | PortföySatış",
  description: "Mülkünüzü satışa çıkarmak için detayları paylaşın; değerleme ve premium satış operasyonu için ekibimiz sizinle iletişime geçsin.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type EmlakSatPageProps = {
  searchParams: SearchParams;
};

function readString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function EmlakSatPage({ searchParams }: EmlakSatPageProps) {
  const language = await getServerSiteLanguage();
  const copy = sellPageCopy(language);
  const params = await searchParams;
  const intent = readString(params.intent).trim();
  const properties = listProperties();

  const cityDistrictMap = properties.reduce<Record<string, string[]>>((accumulator, property) => {
    const districts = accumulator[property.city] ?? [];
    if (!districts.includes(property.district)) {
      districts.push(property.district);
      districts.sort((a, b) => a.localeCompare(b, "tr"));
    }
    accumulator[property.city] = districts;
    return accumulator;
  }, {});

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(216,188,141,0.18),transparent_32%)]" />
          <div className="relative z-10 max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">{copy.heroKicker}</p>
            <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
              {copy.heroBody}
            </p>
          </div>
        </section>

        <section className="frame mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <SellPropertyForm cityDistrictMap={cityDistrictMap} defaultIntent={intent} />

          <aside className="space-y-4">
            <article className="luxury-card p-6 sm:p-7">
              <span className="section-kicker">{copy.planKicker}</span>
              <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#1f1a14]">{copy.planTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[#665c4f]">
                {copy.planBody}
              </p>

              <div className="mt-5 space-y-3">
                {copy.planItems.map((item) => (
                  <div key={item} className="rounded-[1rem] border border-[#e1d3be] bg-white px-4 py-3 text-sm text-[#4f463a]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="luxury-card p-6 sm:p-7">
              <span className="section-kicker">{copy.accessKicker}</span>
              <h2 className="mt-3 text-[1.85rem] leading-none font-semibold text-[#1f1a14]">{copy.accessTitle}</h2>

              <div className="mt-4 space-y-3 text-sm text-[#5f5548]">
                <p><span className="font-semibold">{copy.phone}:</span> +90 212 900 00 01</p>
                <p><span className="font-semibold">{copy.whatsapp}:</span> +90 532 111 22 33</p>
                <p><span className="font-semibold">{copy.email}:</span> sales@portfoysatis.com</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                href="tel:+902129000001"
                className="rounded-full border border-[#d6c5a8] bg-white px-4 py-2 text-sm font-semibold text-[#4f4435] transition hover:bg-[#f6edde]"
              >
                  {copy.call}
                </a>
                <Link
                  href="/danismanlar"
                  className="rounded-full border border-[#ccb795] bg-[#faf6ee] px-4 py-2 text-sm font-semibold text-[#6d593b] transition hover:bg-[#f1e8db]"
                >
                  {copy.advisors}
                </Link>
              </div>
            </article>
          </aside>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
