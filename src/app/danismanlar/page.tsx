import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { listAdvisors, listProperties } from "@/lib/data-store";
import { formatPhoneForHref } from "@/lib/format";

export const metadata: Metadata = {
  title: "Danışmanlar | PortföySatış",
  description: "PortföySatış uzman danışman ekibi ve odak bölgeleri.",
};

export default async function DanismanlarPage() {
  const [currentUser] = await Promise.all([getCurrentUser()]);

  const advisors = listAdvisors();
  const properties = listProperties();

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">Advisory Desk</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">Satış Danışmanlarımız</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            Her portföy danışman eşleşmesiyle yüklenir. Böylece doğru uzmanla hızlı iletişim sağlanır.
          </p>
        </section>

        <section className="frame mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {advisors.map((advisor) => {
            const propertyCount = properties.filter((property) => property.advisorId === advisor.id).length;
            const phoneHref = `tel:${formatPhoneForHref(advisor.phone)}`;
            const whatsappHref = `https://wa.me/${formatPhoneForHref(advisor.whatsapp)}`;

            return (
              <article key={advisor.id} className="luxury-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">Portföy Danışmanı</p>
                <h2 className="mt-2 text-[2rem] leading-none font-semibold text-[#1f1a14]">{advisor.name}</h2>
                <p className="mt-1 text-sm text-[#5f5548]">{advisor.title}</p>
                <p className="mt-2 text-sm text-[#6f6456]">Uzmanlık: {advisor.focusArea}</p>
                <p className="mt-2 text-sm text-[#6f6456]">Aktif portföy: {propertyCount}</p>

                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <a
                    href={phoneHref}
                    className="rounded-full border border-[#d6c5a8] bg-white px-4 py-2 font-semibold text-[#4f4435] transition hover:bg-[#f6edde]"
                  >
                    Ara
                  </a>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-[#b7dcc5] bg-[#ebf8ef] px-4 py-2 font-semibold text-[#2f7d4b] transition hover:bg-[#def2e5]"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${advisor.email}`}
                    className="rounded-full border border-[#d8ceb8] bg-[#faf7f2] px-4 py-2 font-semibold text-[#5f5446] transition hover:bg-[#f1e8db]"
                  >
                    E-posta
                  </a>
                </div>
              </article>
            );
          })}
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
