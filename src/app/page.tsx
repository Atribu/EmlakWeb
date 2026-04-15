import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomeFeaturedCard } from "@/components/home-featured-card";
import { HomeQuickSearch } from "@/components/home-quick-search";
import { PriceText } from "@/components/price-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAdvisors, listCities, listProperties, listRoomOptions, listTypes } from "@/lib/data-store";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { propertyTitleForLanguage } from "@/lib/property-content";
import { homePageCopy, summarizeLocationStockLabel, translatePropertyType } from "@/lib/site-copy";
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
  const roomOptions = listRoomOptions();
  const advisors = listAdvisors();
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
  const heroLocationLabel = heroProperty
    ? `${heroProperty.city}${heroProperty.district ? ` • ${heroProperty.district}` : ""}`
    : copy.featuredKicker;
  const heroPropertyTitle = heroProperty ? propertyTitleForLanguage(heroProperty, language) : copy.featuredTitle;
  const heroDetailLabel =
    language === "TR"
      ? "Portföy Detayı"
      : language === "EN"
        ? "View Listing"
        : language === "RU"
          ? "Смотреть объект"
          : "عرض العقار";

  const heroStats = [
    { label: copy.stats.activeListings, value: String(properties.length) },
    { label: copy.stats.premiumAdvisors, value: String(advisors.length) },
    { label: copy.stats.averageClose, value: copy.averageCloseValue },
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide mt-4 fade-up">
          <HomeQuickSearch cities={cities} types={types} roomOptions={roomOptions} quickLinks={quickSearchLinks} />
        </section>

        <section className="frame-wide mt-4 fade-up">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,0.96fr)_minmax(380px,1.04fr)]">
            <div className="rounded-[2rem] border border-[var(--line-strong)] bg-[rgba(255,253,248,0.98)] p-6 shadow-[0_30px_60px_-46px_rgba(18,24,36,0.2)] sm:p-8 lg:p-10">
              <p className="inline-flex rounded-full bg-[rgba(29,56,92,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-primary)]">
                {copy.heroKicker}
              </p>
              <h1 className="mt-5 max-w-3xl text-[2.1rem] leading-[0.96] font-semibold text-[var(--ink-950)] sm:text-[3rem] xl:text-[3.4rem]">
                {copy.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-[0.96rem] leading-7 text-[var(--ink-600)]">
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
                  href="/iletisim"
                  className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white px-6 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)]"
                >
                  {copy.ctaContact}
                </Link>
              </div>

              <div className="mt-8 overflow-hidden rounded-[1.5rem] border border-[var(--line-strong)] bg-white/92">
                {heroStats.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-center justify-between gap-4 px-4 py-4 sm:px-5 ${
                      index > 0 ? "border-t border-[rgba(220,208,189,0.72)]" : ""
                    }`}
                  >
                    <p className="text-sm font-medium text-[var(--ink-600)]">{item.label}</p>
                    <p className="text-[1.05rem] font-semibold text-[var(--brand-primary)]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-[340px] overflow-hidden rounded-[2rem] border border-[rgba(29,56,92,0.14)] bg-[var(--brand-primary)] shadow-[0_38px_68px_-44px_rgba(13,21,33,0.48)] sm:min-h-[440px]">
              <Image
                src={heroImage}
                alt={heroPropertyTitle}
                fill
                priority
                sizes="(max-width: 1279px) 100vw, 52vw"
                unoptimized={isUnoptimizedImageSrc(heroImage)}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,22,0.1)_0%,rgba(8,14,22,0.16)_36%,rgba(8,14,22,0.48)_100%)]" />

              <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-6 sm:top-6">
                <span className="inline-flex rounded-full border border-white/24 bg-[rgba(8,14,22,0.34)] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                  {heroLocationLabel}
                </span>
                {heroProperty?.listingRef ? (
                  <span className="inline-flex rounded-full border border-white/20 bg-white/14 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur">
                    {heroProperty.listingRef}
                  </span>
                ) : null}
              </div>

              <div className="absolute inset-x-4 bottom-4 sm:inset-x-6 sm:bottom-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                  <div className="rounded-[1.45rem] border border-white/16 bg-[rgba(8,14,22,0.42)] px-4 py-4 text-white backdrop-blur-md sm:max-w-[70%]">
                    <h2 className="text-[1.25rem] leading-[1.06] font-semibold sm:text-[1.55rem]">
                      {heroPropertyTitle}
                    </h2>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-white/90">
                      {heroProperty?.rooms ? (
                        <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                          {heroProperty.rooms}
                        </span>
                      ) : null}
                      {heroProperty?.areaM2 ? (
                        <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                          {heroProperty.areaM2} m²
                        </span>
                      ) : null}
                      {heroProperty?.type ? (
                        <span className="rounded-full border border-white/18 bg-white/10 px-3 py-1">
                          {translatePropertyType(heroProperty.type, language)}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  {heroProperty ? (
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                      <div className="rounded-[1.2rem] border border-white/16 bg-[rgba(8,14,22,0.42)] px-4 py-3 text-white backdrop-blur-md">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#f1d7b0]">
                          {copy.startingBand}
                        </p>
                        <p className="mt-2 text-[1.18rem] font-semibold">
                          <PriceText amount={heroProperty.price} />
                        </p>
                      </div>

                      <Link
                        href={`/ilan/${heroProperty.slug}`}
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5"
                      >
                        {heroDetailLabel}
                      </Link>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="frame mt-16">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <span className="section-kicker">{copy.featuredKicker}</span>
              <h2 className="mt-3 text-[1.9rem] leading-none font-semibold text-[#1d1812] sm:text-[2.2rem]">
                {copy.featuredTitle}
              </h2>
            </div>
            <Link href="/portfoyler" className="text-sm font-semibold text-[#6a4f22] underline">
              {copy.viewAll}
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {featured.map((property) => (
              <HomeFeaturedCard key={property.id} property={property} language={language} />
            ))}
          </div>
        </section>

        <section className="frame mt-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="section-kicker">{copy.locationsKicker}</span>
              <h2 className="mt-3 text-[1.9rem] leading-[0.98] font-semibold text-[#1d1812] sm:text-[2.2rem]">
                {copy.locationsTitle}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-7 text-[#62584c]">
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
                    <h3 className="mt-3 text-[1.5rem] leading-[1] font-semibold sm:text-[1.9rem]">
                      {location.title}
                    </h3>
                    <p className="mt-3 max-w-xl text-[13px] leading-6 text-[#ebe0cc]">{location.blurb}</p>

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
