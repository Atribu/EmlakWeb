import type { Metadata } from "next";

import { PropertyCard } from "@/components/property-card";
import { SiteHeader } from "@/components/site-header";
import {
  listAdvisors,
  listCities,
  listProperties,
  listRoomOptions,
  listTypes,
} from "@/lib/data-store";
import { getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = {
  title: "PortföySatış | Satış Odaklı Emlak İlanları",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type HomePageProps = {
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

export default async function HomePage({ searchParams }: HomePageProps) {
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

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <section className="hero-strip fade-rise relative rounded-3xl border border-slate-200 bg-white px-6 py-8 shadow-sm sm:px-8">
          <span className="inline-flex rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
            Satış Odaklı Demo
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Portföyleri hızlı filtrele, danışmana anında ulaş, talebi e-posta ile yakala.
          </h1>
          <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base">
            İlk versiyon DB olmadan mock veriyle çalışır. Sonraki aşamada aynı arayüze Prisma / PostgreSQL bağlanabilir.
          </p>
        </section>

        <section className="fade-rise mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6" method="GET">
            <input name="q" defaultValue={query} placeholder="İlan, bölge veya kod ara" className="input lg:col-span-2" />

            <select name="city" defaultValue={city} className="input">
              <option value="">Şehir</option>
              {cities.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select name="type" defaultValue={type} className="input">
              <option value="">Tip</option>
              {types.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <select name="rooms" defaultValue={rooms} className="input">
              <option value="">Oda</option>
              {roomOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-2 lg:col-span-2">
              <input
                name="minPrice"
                defaultValue={minPriceValue}
                type="number"
                min={0}
                placeholder="Min fiyat"
                className="input"
              />
              <input
                name="maxPrice"
                defaultValue={maxPriceValue}
                type="number"
                min={0}
                placeholder="Max fiyat"
                className="input"
              />
            </div>

            <button
              type="submit"
              className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 lg:col-span-1"
            >
              Filtrele
            </button>
          </form>
        </section>

        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Yayındaki Portföyler</h2>
            <p className="text-sm text-slate-500">{properties.length} sonuç</p>
          </div>

          {properties.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">
              Filtreye uygun ilan bulunamadı. Arama kriterlerini genişletip tekrar deneyin.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
