import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { dashboardSummary } from "@/lib/data-store";
import { aboutPageCopy } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = {
  title: "Hakkımızda | PortföySatış",
  description: "PortföySatış vizyonu, yaklaşımı ve satış odaklı ekip yapısı.",
};

export default async function HakkimizdaPage() {
  const language = await getServerSiteLanguage();
  const copy = aboutPageCopy(language);
  const summary = dashboardSummary();

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

        <section className="frame mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: copy.metrics.activeListings, value: String(summary.propertyCount) },
            { label: copy.metrics.advisors, value: String(summary.advisorCount) },
            { label: copy.metrics.cities, value: String(summary.cityCount) },
            { label: copy.metrics.leads, value: String(summary.leadCount) },
          ].map((item) => (
            <article key={item.label} className="luxury-card p-5 text-center">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">{item.label}</p>
              <p className="mt-2 text-[2rem] font-semibold text-[#201a13]">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="frame mt-8 grid gap-4 xl:grid-cols-2">
          <article className="luxury-card p-6 sm:p-7">
            <span className="section-kicker">{copy.visionKicker}</span>
            <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#201a13]">{copy.visionTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[#645b50]">
              {copy.visionBody}
            </p>
          </article>

          <article className="luxury-card p-6 sm:p-7">
            <span className="section-kicker">{copy.approachKicker}</span>
            <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#201a13]">{copy.approachTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-[#645b50]">
              {copy.approachBody}
            </p>
          </article>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
