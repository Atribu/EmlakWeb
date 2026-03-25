import type { Metadata } from "next";
import Link from "next/link";

import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAdvisors, listProperties } from "@/lib/data-store";
import { formatPrice } from "@/lib/format";
import { homeListingSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "PortföySatış | Signature Estates",
  description:
    "Premium emlak portföylerini çok sayfalı kurumsal yapıda keşfedin: portföyler, harita, danışmanlar, hizmetler ve iletişim.",
};

export default async function HomePage() {
  const properties = listProperties();
  const advisors = listAdvisors();
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  const featured = properties.slice(0, 4);
  const heroProperty = featured[0];
  const heroImage = heroProperty?.coverImage ?? "/next.svg";
  const listingSchema = homeListingSchema(properties);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative min-h-[88vh] overflow-hidden rounded-[1.6rem] border border-[#3f3022] bg-[#0d151f] shadow-[0_58px_102px_-68px_rgba(0,0,0,0.95)]">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={heroImage}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/hero-loop.mp4" type="video/mp4" />
          </video>

          <div className="hero-overlay absolute inset-0" />

          <div className="relative z-10 flex min-h-[88vh] items-end">
            <div className="w-full p-6 text-[#f5ebdb] sm:p-10 lg:p-14">
              <div className="max-w-4xl">
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#d8bc8d]">
                  Signature Real Estate Platform
                </p>
                <h1 className="mt-5 text-[2.45rem] leading-[0.95] font-semibold sm:text-[4.45rem] xl:text-[5.35rem]">
                  Premium emlak deneyimi artık çok sayfalı kurumsal yapıda
                </h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-[#dfd0b6] sm:text-base">
                  Portföyler, harita, danışman ekibi, hizmetler ve iletişim bölümleri ile
                  satışa odaklı tam web sitesi altyapısı.
                </p>

                <div className="mt-7 flex flex-wrap gap-2 text-sm">
                  <Link href="/portfoyler" className="btn-gold rounded-full px-5 py-2.5 font-semibold transition">
                    Portföyleri Gör
                  </Link>
                  <Link href="/harita" className="btn-ghost-light rounded-full px-5 py-2.5 font-semibold transition">
                    Haritada Keşfet
                  </Link>
                  <Link href="/iletisim" className="btn-ghost-light rounded-full px-5 py-2.5 font-semibold transition">
                    Danışmana Ulaş
                  </Link>
                </div>
              </div>

              <div className="mt-9 grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Aktif Portföy", value: String(properties.length) },
                  { label: "Premium Danışman", value: String(advisors.length) },
                  { label: "Ortalama Kapanış", value: "21 Gün" },
                ].map((item) => (
                  <article key={item.label} className="metric-chip rounded-xl px-3 py-2 backdrop-blur">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#bda681]">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-[#f2e3ca]">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="frame mt-14 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <article className="luxury-card p-6 sm:p-8">
            <span className="section-kicker">Website Sections</span>
            <h2 className="mt-3 text-[2.2rem] leading-[0.95] font-semibold text-[#1d1812]">
              Artık tek sayfa değil, tam bir emlak web sitesi
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#62584c]">
              Her bölüm ayrı sayfada: portföy listeleme, harita arama, danışman ekibi,
              hizmet detayları ve iletişim akışı.
            </p>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {[
                { href: "/portfoyler", title: "Portföyler", text: "Filtreli ilan listeleme ve detay akışı" },
                { href: "/blog", title: "Blog", text: "SEO odaklı emlak içerikleri" },
                { href: "/harita", title: "Harita", text: "Konum arama ve portföy marker görünümü" },
                { href: "/danismanlar", title: "Danışmanlar", text: "Uzman ekip ve odak bölgeleri" },
                { href: "/hizmetler", title: "Hizmetler", text: "Satış ve yatırım danışmanlığı" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-[#e2d4bf] bg-white px-4 py-3 transition hover:bg-[#f8f1e4]"
                >
                  <p className="text-sm font-semibold text-[#241f18]">{item.title}</p>
                  <p className="mt-1 text-xs text-[#6c6154]">{item.text}</p>
                </Link>
              ))}
            </div>
          </article>

          {heroProperty ? (
            <article className="relative overflow-hidden rounded-[1.2rem] border border-[#403123] bg-[#0e151f] shadow-[0_34px_60px_-44px_rgba(0,0,0,0.92)]">
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${heroProperty.coverImage})` }}
              />
              <div className="hero-overlay absolute inset-0" />

              <div className="relative z-10 flex min-h-[24rem] items-end p-6 text-[#f2e8d8] sm:p-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">
                    Signature Listing
                  </p>
                  <h3 className="mt-3 text-[2.1rem] leading-[1.02] font-semibold">{heroProperty.title}</h3>
                  <p className="mt-2 text-sm text-[#dfd1ba]">
                    {heroProperty.city} / {heroProperty.district} • {formatPrice(heroProperty.price)}
                  </p>
                  <Link href={`/ilan/${heroProperty.slug}`} className="mt-4 inline-block text-sm font-semibold underline">
                    İlan Detayına Git
                  </Link>
                </div>
              </div>
            </article>
          ) : null}
        </section>

        <section className="frame mt-14">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="section-kicker">Featured Listings</span>
              <h2 className="mt-2 text-[2.2rem] leading-none font-semibold text-[#1d1812]">Öne Çıkan Portföyler</h2>
            </div>
            <Link href="/portfoyler" className="text-sm font-semibold text-[#6a4f22] underline">
              Tümünü Gör
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
            ))}
          </div>
        </section>

        <SiteFooter />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
      </main>
    </div>
  );
}
