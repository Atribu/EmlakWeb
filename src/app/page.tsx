import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { HomeFeaturedCard } from "@/components/home-featured-card";
import { HomeQuickSearch } from "@/components/home-quick-search";
import { PriceText } from "@/components/price-text";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listCities, listProperties, listRoomOptions, listTypes } from "@/lib/data-store";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { propertyTitleForLanguage } from "@/lib/property-content";
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

function TrustIcon({ type }: { type: "shield" | "support" | "globe" }) {
  if (type === "support") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <path d="M6.5 15.5v-2a5.5 5.5 0 0 1 11 0v2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <rect x="4" y="14" width="3.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <rect x="16.5" y="14" width="3.5" height="5.5" rx="1.2" stroke="currentColor" strokeWidth="1.7" />
        <path d="M12 6.5a3.5 3.5 0 0 1 3.5 3.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "globe") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.7" />
        <path d="M4.5 12h15" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path d="M12 4c2.2 2.3 3.4 5 3.4 8s-1.2 5.7-3.4 8c-2.2-2.3-3.4-5-3.4-8S9.8 6.3 12 4Z" stroke="currentColor" strokeWidth="1.7" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M12 3.75 18.5 6v5.4c0 4.1-2.74 7.86-6.5 8.85-3.76-.99-6.5-4.75-6.5-8.85V6L12 3.75Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
      <path d="m9.2 12.15 1.8 1.8 3.8-4.1" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

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
  const featured = properties.slice(0, 4);
  const featuredPreview = featured.slice(0, 3);
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

  const heroLocationLabel = heroProperty
    ? `${heroProperty.city}${heroProperty.district ? ` • ${heroProperty.district}` : ""}`
    : copy.featuredKicker;
  const heroPropertyTitle = heroProperty ? propertyTitleForLanguage(heroProperty, language) : copy.featuredTitle;
  const heroGuideLabel =
    language === "TR"
      ? "Satın Alma Rehberi"
      : language === "EN"
        ? "Buying Guide"
        : language === "RU"
          ? "Гид покупателя"
          : "دليل الشراء";
  const trustItems =
    language === "TR"
      ? [
          { key: "secure", title: "Güvenli Yatırım", text: "Resmi sözleşme ve yasal güvence", icon: "shield" as const },
          { key: "support", title: "Uzman Danışmanlık", text: "Size özel profesyonel destek", icon: "support" as const },
          { key: "global", title: "Uluslararası Hizmet", text: "Birçok dilde müşteri desteği", icon: "globe" as const },
        ]
      : language === "EN"
        ? [
            { key: "secure", title: "Secure Investment", text: "Official contracts and legal assurance", icon: "shield" as const },
            { key: "support", title: "Expert Guidance", text: "Dedicated professional support", icon: "support" as const },
            { key: "global", title: "International Service", text: "Support in multiple languages", icon: "globe" as const },
          ]
        : language === "RU"
          ? [
              { key: "secure", title: "Безопасная инвестиция", text: "Официальный договор и правовая защита", icon: "shield" as const },
              { key: "support", title: "Экспертное сопровождение", text: "Персональная профессиональная помощь", icon: "support" as const },
              { key: "global", title: "Международный сервис", text: "Поддержка на нескольких языках", icon: "globe" as const },
            ]
          : [
              { key: "secure", title: "استثمار آمن", text: "عقود رسمية وضمان قانوني", icon: "shield" as const },
              { key: "support", title: "استشارة متخصصة", text: "دعم مهني مخصص لكم", icon: "support" as const },
              { key: "global", title: "خدمة دولية", text: "دعم عملاء بعدة لغات", icon: "globe" as const },
            ];

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide mt-4 fade-up">
          <div className="rounded-[2.15rem] border border-[#e3d6c3] bg-[linear-gradient(180deg,#fffdfa_0%,#f9f3e9_100%)] px-5 py-6 shadow-[0_32px_64px_-46px_rgba(22,30,42,0.22)] sm:px-7 sm:py-8 xl:px-10 xl:pt-10 xl:pb-14">
            <div className="grid gap-7 xl:grid-cols-[minmax(0,0.82fr)_minmax(460px,1.18fr)] xl:items-center">
              <div className="max-w-xl">
                <div className="flex gap-4">
                  <span className="hidden w-[4px] rounded-full bg-[linear-gradient(180deg,var(--brand-accent)_0%,#d3ab76_100%)] sm:block" />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent-strong)]">
                      {copy.heroKicker}
                    </p>
                    <h1 className="mt-4 max-w-lg text-[2.05rem] leading-[0.94] font-semibold text-[var(--ink-950)] sm:text-[3rem] xl:text-[3.55rem]">
                      {copy.heroTitle}
                    </h1>
                    <p className="mt-5 max-w-md text-[0.96rem] leading-7 text-[var(--ink-600)]">
                      {copy.heroBody}
                    </p>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Link
                        href="/portfoyler"
                        className="inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-primary)] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        {copy.ctaListings}
                      </Link>
                      <Link
                        href="/blog"
                        className="inline-flex min-h-12 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white px-6 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)]"
                      >
                        {heroGuideLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative min-h-[18rem] overflow-hidden rounded-[1.8rem] border border-[#dfd0bd] bg-[#d8cab5] shadow-[0_30px_58px_-42px_rgba(20,24,32,0.3)] sm:min-h-[23rem] xl:min-h-[26.5rem]">
                <Image
                  src={heroImage}
                  alt={heroPropertyTitle}
                  fill
                  priority
                  sizes="(max-width: 1279px) 100vw, 52vw"
                  unoptimized={isUnoptimizedImageSrc(heroImage)}
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,14,22,0.08)_0%,rgba(8,14,22,0.08)_34%,rgba(8,14,22,0.22)_100%)]" />

                <div className="absolute left-4 top-4 flex flex-wrap gap-2 sm:left-5 sm:top-5">
                  <span className="inline-flex rounded-full border border-white/26 bg-[rgba(8,14,22,0.42)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                    {heroLocationLabel}
                  </span>
                  {heroProperty?.listingRef ? (
                    <span className="inline-flex rounded-full border border-white/20 bg-white/14 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur">
                      {heroProperty.listingRef}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 mx-auto -mt-8 max-w-6xl px-2 sm:-mt-11">
            <HomeQuickSearch
              cities={cities}
              types={types}
              roomOptions={roomOptions}
              variant="hero-bar"
            />
          </div>
        </section>

        <section className="frame-wide mt-12 fade-up sm:mt-16">
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

          <div className="grid gap-4 lg:grid-cols-3">
            {featuredPreview.map((property) => (
              <HomeFeaturedCard key={property.id} property={property} language={language} />
            ))}
          </div>

          <div className="mt-7 grid gap-4 rounded-[1.6rem] border border-[#e2d7c8] bg-[rgba(255,252,247,0.92)] p-5 shadow-[0_22px_42px_-36px_rgba(18,24,36,0.18)] sm:grid-cols-3 sm:p-6">
            {trustItems.map((item) => (
              <div key={item.key} className="flex items-start gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[rgba(201,124,78,0.1)] text-[var(--brand-accent-strong)]">
                  <TrustIcon type={item.icon} />
                </span>
                <div>
                  <p className="text-[0.95rem] font-semibold text-[var(--ink-950)]">{item.title}</p>
                  <p className="mt-1 text-[13px] leading-6 text-[var(--ink-600)]">{item.text}</p>
                </div>
              </div>
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
