import type { Metadata } from "next";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Hizmetler | PortföySatış",
  description: "Satış, yatırım ve portföy yönetimi hizmet detayları.",
};

const services = [
  {
    title: "Satış Stratejisi",
    text: "Doğru fiyatlandırma, görsel vitrin ve hedef alıcı iletişimi ile hızlı kapanış odaklı süreç.",
  },
  {
    title: "Yatırım Danışmanlığı",
    text: "Kira çarpanı, lokasyon trendi ve çıkış senaryosuna göre yatırım odaklı portföy seçimi.",
  },
  {
    title: "VIP Portföy Turu",
    text: "Kısa liste oluşturma, randevu planlama ve aynı gün çoklu portföy gezisi organizasyonu.",
  },
  {
    title: "Pazarlama ve Vitrin",
    text: "Premium içerik dili, video/sunum akışı ve dijital vitrin optimizasyonu.",
  },
  {
    title: "Müzakere Yönetimi",
    text: "Teklif süreci, pazarlık yönetimi ve alıcı-satıcı dengesini koruyan profesyonel yaklaşım.",
  },
  {
    title: "Evrak ve Süreç Takibi",
    text: "Tekliften devir aşamasına kadar tüm operasyon adımlarının uçtan uca kontrolü.",
  },
];

export default async function HizmetlerPage() {
  const [currentUser] = await Promise.all([getCurrentUser()]);

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">Services</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">Hizmetlerimiz</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            PortföySatış ekibi, emlak satışını sadece ilan değil bir operasyon olarak yönetir.
          </p>
        </section>

        <section className="frame mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => (
            <article key={service.title} className="luxury-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">Hizmet</p>
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
