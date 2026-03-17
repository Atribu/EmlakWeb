import type { Metadata } from "next";
import Link from "next/link";

import { PropertyCard } from "@/components/property-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { listAdvisors, listCities, listProperties, listRoomOptions, listTypes } from "@/lib/data-store";

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
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUser()]);

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
      <SiteHeader user={currentUser} />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">Portfolio Collection</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">Premium Portföyler</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            Kriterlerinize göre filtreleyin, detayları inceleyin ve doğrudan danışmana ulaşın.
          </p>
        </section>

        <section className="frame panel-dark mt-7 rounded-[1.15rem] p-4 sm:p-5">
          <form className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7" method="GET">
            <input
              name="q"
              defaultValue={query}
              placeholder="İlan, bölge veya kod"
              className="input dark-input lg:col-span-2"
            />

            <select name="city" defaultValue={city} className="input dark-input">
              <option value="">Şehir</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select name="type" defaultValue={type} className="input dark-input">
              <option value="">Tip</option>
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select name="rooms" defaultValue={rooms} className="input dark-input">
              <option value="">Oda</option>
              {roomOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              name="minPrice"
              defaultValue={minPriceValue}
              type="number"
              min={0}
              placeholder="Min fiyat"
              className="input dark-input"
            />
            <input
              name="maxPrice"
              defaultValue={maxPriceValue}
              type="number"
              min={0}
              placeholder="Max fiyat"
              className="input dark-input"
            />

            <button type="submit" className="btn-gold cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition lg:col-span-1">
              Filtrele
            </button>
          </form>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#b9a889]">
            <p>{properties.length} aktif sonuç</p>
            <Link href="/harita" className="font-semibold text-[#dcc69f] underline">
              Harita görünümüne geç
            </Link>
          </div>
        </section>

        <section className="frame mt-8">
          {properties.length === 0 ? (
            <div className="luxury-card p-8 text-center text-sm text-[#645b50]">
              Filtreye uygun ilan bulunamadı. Arama kriterlerini genişletip tekrar deneyin.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
              ))}
            </div>
          )}
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
