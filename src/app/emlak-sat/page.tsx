import type { Metadata } from "next";
import Link from "next/link";

import { SellPropertyForm } from "@/components/sell-property-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listProperties } from "@/lib/data-store";
import { publicPageMetadata } from "@/lib/seo";
import { sellPageCopy } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = publicPageMetadata({
  title: "Emlak Sat | RODINA Invest Co.",
  description: "Mülkünüzü satışa çıkarmak için detayları paylaşın; değerleme ve premium satış operasyonu için ekibimiz sizinle iletişime geçsin.",
  canonical: "/emlak-sat",
});

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
        <section className="frame-wide fade-up relative overflow-hidden rounded-lg border border-[rgba(102,165,87,0.26)] bg-[var(--brand-night-blue)] p-7 text-white shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(102,165,87,0.18)_0%,rgba(29,38,68,0)_58%)]" />
          <div className="relative z-10 max-w-4xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#cfe8c9]">{copy.heroKicker}</p>
            <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-black sm:text-[3.8rem]">
              {copy.heroTitle}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[#edf6ea] sm:text-base">
              {copy.heroBody}
            </p>
          </div>
        </section>

        <section className="frame mt-8 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <SellPropertyForm cityDistrictMap={cityDistrictMap} defaultIntent={intent} />

          <aside className="space-y-4">
            <article className="luxury-card p-6 sm:p-7">
              <span className="section-kicker">{copy.planKicker}</span>
              <h2 className="mt-3 text-[2rem] leading-none font-extrabold text-[var(--brand-ink)]">{copy.planTitle}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--ink-600)]">
                {copy.planBody}
              </p>

              <div className="mt-5 space-y-3">
                {copy.planItems.map((item) => (
                  <div key={item} className="rounded-lg border border-[var(--line-strong)] bg-white px-4 py-3 text-sm text-[var(--ink-700)]">
                    {item}
                  </div>
                ))}
              </div>
            </article>

            <article className="luxury-card p-6 sm:p-7">
              <span className="section-kicker">{copy.accessKicker}</span>
              <h2 className="mt-3 text-[1.85rem] leading-none font-extrabold text-[var(--brand-ink)]">{copy.accessTitle}</h2>

              <div className="mt-4 space-y-3 text-sm text-[var(--ink-600)]">
                <p><span className="font-semibold">{copy.phone}:</span> +90 212 900 00 01</p>
                <p><span className="font-semibold">{copy.whatsapp}:</span> +90 532 111 22 33</p>
                <p><span className="font-semibold">{copy.email}:</span> sales@rodinainvest.com</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <a
                href="tel:+902129000001"
                className="rounded-lg border border-[var(--line-strong)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-primary)] transition hover:border-[var(--brand-accent)] hover:bg-[rgba(102,165,87,0.08)]"
              >
                  {copy.call}
                </a>
                <Link
                  href="/danismanlar"
                  className="rounded-lg border border-[var(--brand-green)] bg-[var(--brand-green)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#58974b]"
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
