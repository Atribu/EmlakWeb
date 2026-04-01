import type { Metadata } from "next";
import Link from "next/link";

import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listAdvisors, listCities, listProperties, listRoomOptions, listTypes } from "@/lib/data-store";
import { portfolioPageCopy, translatePropertyType, translateRoomLabel } from "@/lib/site-copy";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";

export const metadata: Metadata = {
  title: "Portföyler | PortföySatış",
  description: "Filtrelenebilir satılık portföyleri tek sayfada inceleyin.",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type PortfoylerPageProps = {
  searchParams: SearchParams;
};

function readString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function PortfoylerPage({ searchParams }: PortfoylerPageProps) {
  const language = await getServerSiteLanguage();
  const copy = portfolioPageCopy(language);
  const params = await searchParams;

  const query = readString(params.q).trim();
  const city = readString(params.city).trim();
  const type = readString(params.type).trim();
  const rooms = readString(params.rooms).trim();
  const minPriceValue = readString(params.minPrice);
  const maxPriceValue = readString(params.maxPrice);

  const properties = listProperties({
    query: query || undefined,
    city: city || undefined,
    type: type || undefined,
    rooms: rooms || undefined,
    minPrice: toNumber(minPriceValue),
    maxPrice: toNumber(maxPriceValue),
  });

  const advisors = listAdvisors();
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));

  const cities = listCities();
  const types = listTypes();
  const roomOptions = listRoomOptions();

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

        <section className="frame mt-8">
          <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="panel-dark h-fit rounded-[1.2rem] p-4 sm:p-5 xl:sticky xl:top-24">
              <div className="border-b border-white/10 pb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">{copy.filterKicker}</p>
                <h2 className="mt-2 text-[1.75rem] leading-none font-semibold text-[#f2e7d4]">{copy.filterTitle}</h2>
                <p className="mt-2 text-sm leading-6 text-[#c7b79b]">
                  {copy.filterBody}
                </p>
              </div>

              <form className="mt-5 grid gap-3" method="GET">
                <input
                  name="q"
                  defaultValue={query}
                  placeholder={copy.searchPlaceholder}
                  className="input dark-input"
                />

                <select name="city" defaultValue={city} className="input dark-input">
                  <option value="">{copy.cityPlaceholder}</option>
                  {cities.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>

                <select name="type" defaultValue={type} className="input dark-input">
                  <option value="">{copy.typePlaceholder}</option>
                  {types.map((item) => (
                    <option key={item} value={item}>
                      {translatePropertyType(item, language)}
                    </option>
                  ))}
                </select>

                <select name="rooms" defaultValue={rooms} className="input dark-input">
                  <option value="">{copy.roomPlaceholder}</option>
                  {roomOptions.map((item) => (
                    <option key={item} value={item}>
                      {translateRoomLabel(item, language)}
                    </option>
                  ))}
                </select>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                  <input
                    name="minPrice"
                    defaultValue={minPriceValue}
                    type="number"
                    min={0}
                    placeholder={copy.minPricePlaceholder}
                    className="input dark-input"
                  />
                  <input
                    name="maxPrice"
                    defaultValue={maxPriceValue}
                    type="number"
                    min={0}
                    placeholder={copy.maxPricePlaceholder}
                    className="input dark-input"
                  />
                </div>

                <button type="submit" className="btn-gold mt-2 cursor-pointer rounded-full px-4 py-3 text-sm font-semibold transition">
                  {copy.submit}
                </button>
              </form>

              <div className="mt-5 rounded-[1rem] border border-white/10 bg-white/5 p-4 text-sm text-[#c7b79b]">
                <p>
                  {copy.activeResults}: <strong className="text-[#fff4df]">{properties.length}</strong>
                </p>
                <Link href="/harita" className="mt-2 inline-flex font-semibold text-[#e1c898] underline">
                  {copy.mapView}
                </Link>
              </div>
            </aside>

            <div className="min-w-0">
              {properties.length === 0 ? (
                <div className="luxury-card p-8 text-center text-sm text-[#645b50]">
                  {copy.noResults}
                </div>
              ) : (
                <div className="grid gap-5">
                  {properties.map((property) => (
                    <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
