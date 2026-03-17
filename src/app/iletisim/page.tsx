import type { Metadata } from "next";
import Link from "next/link";

import { GeneralContactForm } from "@/components/general-contact-form";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { listProperties } from "@/lib/data-store";

export const metadata: Metadata = {
  title: "İletişim | PortföySatış",
  description: "PortföySatış danışman ekibiyle iletişim kurun, talebinizi iletin.",
};

export default async function IletisimPage() {
  const [currentUser] = await Promise.all([getCurrentUser()]);
  const properties = listProperties();

  const propertyOptions = properties.slice(0, 16).map((property) => ({
    slug: property.slug,
    title: `${property.title} • ${property.city}/${property.district}`,
  }));

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">Contact</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">İletişim ve Talep Formu</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            İlgi duyduğunuz portföyü seçip talebinizi bırakın; danışman ekibimiz en kısa sürede dönüş sağlasın.
          </p>
        </section>

        <section className="frame mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <GeneralContactForm properties={propertyOptions} />

          <aside className="luxury-card p-6 sm:p-7">
            <span className="section-kicker">İletişim Bilgileri</span>
            <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#1f1a14]">Signature Desk</h2>
            <p className="mt-3 text-sm leading-7 text-[#665c4f]">
              Hafta içi 09:00 - 19:00 arasında tüm talepleri operasyon ekibi karşılar.
            </p>

            <div className="mt-4 space-y-2 text-sm text-[#5f5548]">
              <p><span className="font-semibold">Telefon:</span> +90 212 900 00 01</p>
              <p><span className="font-semibold">E-posta:</span> info@portfoysatis.com</p>
              <p><span className="font-semibold">Adres:</span> Levent, İstanbul</p>
            </div>

            <div className="mt-5 flex flex-wrap gap-2 text-sm">
              <a
                href="tel:+902129000001"
                className="rounded-full border border-[#d6c5a8] bg-white px-4 py-2 font-semibold text-[#4f4435] transition hover:bg-[#f6edde]"
              >
                Hemen Ara
              </a>
              <Link
                href="/danismanlar"
                className="rounded-full border border-[#ccb795] bg-[#faf6ee] px-4 py-2 font-semibold text-[#6d593b] transition hover:bg-[#f1e8db]"
              >
                Danışman Ekibi
              </Link>
            </div>
          </aside>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
