import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { servicesPageCopy } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = {
  title: "Hizmetler | PortföySatış",
  description: "Satış, yatırım ve portföy yönetimi hizmet detayları.",
};

export default async function HizmetlerPage() {
  const language = await getServerSiteLanguage();
  const copy = servicesPageCopy(language);

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

        <section className="frame mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {copy.items.map((service) => (
            <article key={service.title} className="luxury-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">{copy.serviceLabel}</p>
              <h2 className="mt-2 text-[1.8rem] leading-none font-semibold text-[#201a13]">{service.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[#645b50]">{service.text}</p>
            </article>
          ))}
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
