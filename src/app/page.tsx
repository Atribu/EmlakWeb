import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomeQuickSearch } from "@/components/home-quick-search";
import { PriceText } from "@/components/price-text";
import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAdvisors, listCities, listProperties, listTypes } from "@/lib/data-store";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { homePageCopy, summarizeLocationStockLabel } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";
import { homeListingSchema } from "@/lib/seo";
import type { Property } from "@/lib/types";

export const metadata: Metadata = {
  title: "PortföySatış | Signature Estates",
  description:
    "Premium emlak portföylerini çok sayfalı kurumsal yapıda keşfedin: portföyler, harita, danışmanlar, hizmetler ve iletişim.",
};

type PopularLocationCard = {
  key: string;
  title: string;
  subtitle: string;
  href: string;
  image: string;
  badge: string;
  blurb: string;
  stat: string;
  priceValue: number | null;
  className: string;
};

function isPlaceholderProperty(property: Property) {
  return [property.slug, property.title, property.city, property.district, property.neighborhood]
    .map((value) => value.trim().toLocaleLowerCase("tr"))
    .includes("test");
}

function summarizeLocationStock(properties: Property[], language: Awaited<ReturnType<typeof getServerSiteLanguage>>) {
  return summarizeLocationStockLabel(language, properties.length);
}

function summarizeLocationPrice(properties: Property[]) {
  if (properties.length === 0) {
    return null;
  }

  return Math.min(...properties.map((property) => property.price));
}

export default async function HomePage() {
  const language = await getServerSiteLanguage();
  const copy = homePageCopy(language);
  const properties = listProperties();
  const cities = listCities();
  const types = listTypes();
  const advisors = listAdvisors();
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  const featured = properties.slice(0, 4);
  const heroProperty = featured[0];
  const heroImage = heroProperty?.coverImage ?? "/next.svg";
  const listingSchema = homeListingSchema(properties);
  const showcaseProperties = properties.filter((property) => !isPlaceholderProperty(property));
  const istanbulCollection = showcaseProperties.filter((property) => property.city === "İstanbul");
  const sariyerCollection = showcaseProperties.filter((property) => property.district === "Sarıyer");
  const sisliCollection = showcaseProperties.filter((property) => property.district === "Şişli");
  const urlaCollection = showcaseProperties.filter((property) => property.district === "Urla");
  const signatureCollection = showcaseProperties.length > 0 ? showcaseProperties : properties;

  const sariyerProperty = sariyerCollection[0];
  const sisliProperty = sisliCollection[0];
  const istanbulProperty = istanbulCollection[1] ?? istanbulCollection[0];
  const urlaProperty = urlaCollection[0];
  const signatureProperty = signatureCollection[signatureCollection.length - 1] ?? heroProperty;

  const popularLocations: PopularLocationCard[] = [
    {
      key: "zekeriyakoy",
      title: copy.locationCards.zekeriyakoy.title,
      subtitle: copy.locationCards.zekeriyakoy.subtitle,
      href: "/portfoyler?q=Sarıyer",
      image:
        sariyerProperty?.coverImage ??
        "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=1600&q=80",
      badge: copy.locationCards.zekeriyakoy.badge,
      blurb: copy.locationCards.zekeriyakoy.blurb,
      stat: summarizeLocationStock(sariyerCollection, language),
      priceValue: summarizeLocationPrice(sariyerCollection),
      className: "lg:col-span-7 lg:min-h-[25rem]",
    },
    {
      key: "nisantasi",
      title: "Nişantaşı",
      subtitle: "İstanbul / Şişli",
      href: "/portfoyler?q=Şişli",
      image:
        sisliProperty?.coverImage ??
        "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
      badge: copy.locationCards.nisantasi.badge,
      blurb: copy.locationCards.nisantasi.blurb,
      stat: summarizeLocationStock(sisliCollection, language),
      priceValue: summarizeLocationPrice(sisliCollection),
      className: "sm:col-span-1 lg:col-span-5 lg:min-h-[12rem]",
    },
    {
      key: "istanbul-prime",
      title: "İstanbul Prime",
      subtitle: "Merkez ilçelerde premium seçki",
      href: "/portfoyler?city=İstanbul",
      image:
        istanbulProperty?.coverImage ??
        "https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?auto=format&fit=crop&w=1600&q=80",
      badge: copy.locationCards["istanbul-prime"].badge,
      blurb: copy.locationCards["istanbul-prime"].blurb,
      stat: summarizeLocationStock(istanbulCollection, language),
      priceValue: summarizeLocationPrice(istanbulCollection),
      className: "sm:col-span-1 lg:col-span-5 lg:min-h-[12rem]",
    },
    {
      key: "urla",
      title: "Urla",
      subtitle: "İzmir / Ege kıyı hattı",
      href: "/portfoyler?q=Urla",
      image:
        urlaProperty?.coverImage ??
        "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
      badge: copy.locationCards.urla.badge,
      blurb: copy.locationCards.urla.blurb,
      stat: summarizeLocationStock(urlaCollection, language),
      priceValue: summarizeLocationPrice(urlaCollection),
      className: "sm:col-span-1 lg:col-span-6 lg:min-h-[15rem]",
    },
    {
      key: "signature-selection",
      title: "İstanbul & Ege",
      subtitle: "Signature seçki koleksiyonu",
      href: "/portfoyler",
      image:
        signatureProperty?.coverImage ??
        "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
      badge: copy.locationCards["signature-selection"].badge,
      blurb: copy.locationCards["signature-selection"].blurb,
      stat: summarizeLocationStock(signatureCollection, language),
      priceValue: summarizeLocationPrice(signatureCollection),
      className: "sm:col-span-1 lg:col-span-6 lg:min-h-[15rem]",
    },
  ];

  popularLocations[0] = {
    ...popularLocations[0],
    title: copy.locationCards.zekeriyakoy.title,
    subtitle: copy.locationCards.zekeriyakoy.subtitle,
    badge: copy.locationCards.zekeriyakoy.badge,
  };
  popularLocations[1] = {
    ...popularLocations[1],
    title: copy.locationCards.nisantasi.title,
    subtitle: copy.locationCards.nisantasi.subtitle,
  };
  popularLocations[2] = {
    ...popularLocations[2],
    title: copy.locationCards["istanbul-prime"].title,
    subtitle: copy.locationCards["istanbul-prime"].subtitle,
  };
  popularLocations[3] = {
    ...popularLocations[3],
    title: copy.locationCards.urla.title,
    subtitle: copy.locationCards.urla.subtitle,
  };
  popularLocations[4] = {
    ...popularLocations[4],
    title: copy.locationCards["signature-selection"].title,
    subtitle: copy.locationCards["signature-selection"].subtitle,
  };

  const quickSearchLinks = popularLocations.slice(0, 4).map((location) => ({
    label: location.title,
    href: location.href,
  }));

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[2rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,252,247,0.98)_0%,rgba(247,242,235,0.92)_100%)] px-4 py-4 shadow-[0_40px_100px_-68px_rgba(14,22,35,0.38)] sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(194,121,82,0.14),transparent_32%),radial-gradient(circle_at_right_center,rgba(29,56,92,0.12),transparent_34%)]" />

          <div className="relative grid gap-4 xl:grid-cols-[minmax(0,1.02fr)_minmax(360px,0.98fr)]">
            <div className="overflow-hidden rounded-[1.8rem] border border-white/80 bg-[linear-gradient(180deg,#fffdf9_0%,#f8f3eb_100%)] p-6 shadow-[0_24px_70px_-56px_rgba(15,21,32,0.45)] sm:p-8 lg:p-10">
              <div className="max-w-3xl">
                <p className="inline-flex rounded-full bg-[rgba(29,56,92,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                  {copy.heroKicker}
                </p>
                <h1 className="mt-5 max-w-3xl text-[2.65rem] leading-[0.94] font-semibold text-[var(--ink-950)] sm:text-[4.25rem] xl:text-[5rem]">
                  {copy.heroTitle}
                </h1>
                <p className="mt-5 max-w-2xl text-[1rem] leading-8 text-[var(--ink-600)] sm:text-[1.08rem]">
                  {copy.heroBody}
                </p>

                <div className="mt-7 flex flex-wrap gap-3 text-sm">
                  <Link
                    href="/portfoyler"
                    className="btn-gold inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition hover:-translate-y-0.5"
                  >
                    {copy.ctaListings}
                  </Link>
                  <Link
                    href="/harita"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white px-6 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)]"
                  >
                    {copy.ctaMap}
                  </Link>
                  <Link
                    href="/iletisim"
                    className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line-strong)] bg-[rgba(29,56,92,0.06)] px-6 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:bg-[rgba(29,56,92,0.1)]"
                  >
                    {copy.ctaContact}
                  </Link>
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                {[
                  { label: copy.stats.activeListings, value: String(properties.length) },
                  { label: copy.stats.premiumAdvisors, value: String(advisors.length) },
                  { label: copy.stats.averageClose, value: copy.averageCloseValue },
                ].map((item) => (
                  <article
                    key={item.label}
                    className="rounded-[1.35rem] border border-[var(--line-strong)] bg-white/90 px-4 py-4 shadow-[0_22px_34px_-30px_rgba(25,34,49,0.28)]"
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--ink-500)]">{item.label}</p>
                    <p className="mt-2 text-[1.4rem] font-semibold text-[var(--brand-primary)]">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>

            <div className="relative min-h-[320px] overflow-hidden rounded-[1.8rem] border border-[rgba(29,56,92,0.14)] bg-[var(--brand-primary)] shadow-[0_38px_70px_-42px_rgba(13,21,33,0.6)] sm:min-h-[420px]">
              <Image
                src={heroImage}
                alt={heroProperty?.title ?? "Öne çıkan premium portföy"}
                fill
                priority
                sizes="(max-width: 1279px) 100vw, 46vw"
                unoptimized={isUnoptimizedImageSrc(heroImage)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,22,0.14)_0%,rgba(8,14,22,0.46)_58%,rgba(8,14,22,0.72)_100%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_34%)]" />

              <div className="absolute left-4 top-4 inline-flex rounded-full border border-white/30 bg-[rgba(8,14,22,0.34)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur sm:left-6 sm:top-6">
                {heroProperty?.city} {heroProperty?.district ? `• ${heroProperty.district}` : ""}
              </div>

              <div className="absolute inset-x-4 bottom-4 rounded-[1.5rem] border border-white/18 bg-[rgba(8,14,22,0.52)] p-4 text-white backdrop-blur-md sm:inset-x-6 sm:bottom-6 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#f0d3a9]">
                      {heroProperty?.listingRef ?? copy.featuredKicker}
                    </p>
                    <h2 className="mt-2 max-w-xl text-[1.7rem] leading-[1.02] font-semibold text-white sm:text-[2.1rem]">
                      {heroProperty?.title ?? copy.featuredTitle}
                    </h2>
                  </div>

                  {heroProperty ? (
                    <div className="rounded-[1.15rem] bg-white/14 px-4 py-3 text-left shadow-[0_24px_40px_-32px_rgba(0,0,0,0.6)]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#f3dcb9]">
                        {copy.startingBand}
                      </p>
                      <p className="mt-2 text-[1.45rem] font-semibold text-white">
                        <PriceText amount={heroProperty.price} />
                      </p>
                    </div>
                  ) : null}
                </div>

                {heroProperty?.description ? (
                  <p className="mt-4 max-w-2xl text-sm leading-6 text-[rgba(255,247,235,0.86)]">
                    {heroProperty.description}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="relative mt-4 xl:-mt-10">
            <HomeQuickSearch cities={cities} types={types} quickLinks={quickSearchLinks} />
          </div>
        </section>

        <section className="frame mt-16">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="section-kicker">{copy.featuredKicker}</span>
              <h2 className="mt-3 text-[2.4rem] leading-none font-semibold text-[#1d1812] sm:text-[2.85rem]">
                {copy.featuredTitle}
              </h2>
            </div>
            <Link href="/portfoyler" className="text-sm font-semibold text-[#6a4f22] underline">
              {copy.viewAll}
            </Link>
          </div>

          <div className="grid gap-5 xl:grid-cols-2">
            {featured.map((property) => (
              <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
            ))}
          </div>
        </section>

        <section className="frame mt-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="section-kicker">{copy.locationsKicker}</span>
              <h2 className="mt-3 text-[2.2rem] leading-[0.95] font-semibold text-[#1d1812] sm:text-[3rem]">
                {copy.locationsTitle}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#62584c] sm:text-base">
                {copy.locationsBody}
              </p>
            </div>

            <Link href="/portfoyler" className="text-sm font-semibold text-[#6a4f22] underline">
              {copy.allLocations}
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
            {popularLocations.map((location) => (
              <Link
                key={location.key}
                href={location.href}
                className={`group relative isolate overflow-hidden rounded-[1.4rem] border border-[#d7cab7] shadow-[0_28px_58px_-40px_rgba(20,16,10,0.52)] transition duration-300 hover:-translate-y-1 ${location.className}`}
              >
                <Image
                  src={location.image}
                  alt={`${location.title} lokasyon kartı`}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  unoptimized={isUnoptimizedImageSrc(location.image)}
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,11,18,0.08)_0%,rgba(5,11,18,0.28)_38%,rgba(5,11,18,0.92)_100%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(220,188,138,0.34),transparent_42%)]" />

                <div className="relative z-10 flex h-full min-h-[15rem] flex-col justify-between p-5 text-[#f6eddc] sm:p-6">
                  <div className="flex items-start justify-between gap-3">
                    <span className="rounded-full border border-white/18 bg-white/12 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f5e8cf] backdrop-blur">
                      {location.badge}
                    </span>
                    <span className="rounded-full border border-[#d9c194]/30 bg-[#0f1822]/45 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d8bc8d] backdrop-blur">
                      {location.stat}
                    </span>
                  </div>

                  <div className="max-w-[28rem]">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#dfc79d]">
                      {location.subtitle}
                    </p>
                    <h3 className="mt-3 text-[1.8rem] leading-[0.95] font-semibold sm:text-[2.4rem]">
                      {location.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-[#ebe0cc]">{location.blurb}</p>

                    <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-white/14 pt-4">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#c8b48d]">
                          {copy.startingBand}
                        </p>
                        <p className="mt-1 text-lg font-semibold text-[#fff4de]">
                          {location.priceValue ? <PriceText amount={location.priceValue} /> : copy.newSelection}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-[#f8edd8]">
                        {copy.exploreRegion}
                        <span aria-hidden className="transition group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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
