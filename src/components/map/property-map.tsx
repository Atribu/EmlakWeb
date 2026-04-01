"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";

import { PriceText } from "@/components/price-text";
import { useSitePreferences } from "@/components/use-site-preferences";
import type { MapPortfolio, MapStyleKey } from "@/components/map/property-map-canvas";
import { mapComponentCopy } from "@/lib/site-copy";
import { htmlLangForLanguage } from "@/lib/site-preferences";

const PropertyMapCanvas = dynamic(
  () => import("@/components/map/property-map-canvas").then((module) => module.PropertyMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="h-[460px] animate-pulse rounded-2xl border border-[#d9cdbb] bg-[#f3ecdf]" />
    ),
  },
);

type PropertyMapProps = {
  portfolios: MapPortfolio[];
};

type SearchState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string };

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function averageCenter(items: MapPortfolio[]): LatLngTuple {
  if (items.length === 0) {
    return [41.0082, 28.9784];
  }

  const totals = items.reduce(
    (acc, item) => {
      acc.lat += item.latitude;
      acc.lng += item.longitude;
      return acc;
    },
    { lat: 0, lng: 0 },
  );

  return [totals.lat / items.length, totals.lng / items.length];
}

export function PropertyMap({ portfolios }: PropertyMapProps) {
  const { language } = useSitePreferences();
  const copy = mapComponentCopy(language);
  const [portfolioQuery, setPortfolioQuery] = useState("");
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSearch, setLocationSearch] = useState<SearchState>({ type: "idle" });
  const [mapStyle, setMapStyle] = useState<MapStyleKey>("minimal");

  const defaultCenter = useMemo(() => averageCenter(portfolios), [portfolios]);
  const [viewCenter, setViewCenter] = useState<LatLngTuple>(defaultCenter);
  const [viewZoom, setViewZoom] = useState(10);

  const filteredPortfolios = useMemo(() => {
    const normalized = normalizeText(portfolioQuery.trim());
    if (!normalized) {
      return portfolios;
    }

    return portfolios.filter((item) =>
      normalizeText(
        [item.title, item.city, item.district, item.neighborhood, item.listingRef].join(" "),
      ).includes(normalized),
    );
  }, [portfolioQuery, portfolios]);

  useEffect(() => {
    if (filteredPortfolios.length === 0) {
      return;
    }

    setViewCenter([filteredPortfolios[0].latitude, filteredPortfolios[0].longitude]);
    setViewZoom(12);
  }, [filteredPortfolios]);

  async function handleLocationSearch() {
    const query = locationQuery.trim();
    if (!query) {
      setLocationSearch({ type: "error", message: copy.enterLocation });
      return;
    }

    setLocationSearch({ type: "loading" });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "Accept-Language": htmlLangForLanguage(language),
          },
        },
      );

      if (!response.ok) {
        throw new Error(copy.searchError);
      }

      const results = (await response.json()) as Array<{ lat: string; lon: string }>;
      const first = results[0];

      if (!first) {
        setLocationSearch({ type: "error", message: copy.locationNotFound });
        return;
      }

      setViewCenter([Number(first.lat), Number(first.lon)]);
      setViewZoom(13);
      setLocationSearch({ type: "idle" });
    } catch {
      setLocationSearch({ type: "error", message: copy.serviceUnavailable });
    }
  }

  return (
    <section className="luxury-card p-4 sm:p-6" id="harita">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">{copy.kicker}</span>
          <h2 className="mt-2 text-[2rem] leading-none font-semibold text-[#1f1a14]">
            {copy.title}
          </h2>
          <p className="mt-2 text-sm text-[#655c50]">
            {copy.body}
          </p>
        </div>
        <p className="text-sm text-[#6d6356]">{filteredPortfolios.length} {copy.results}</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7e6d53]">
          {copy.mapStyle}
        </p>
        {[
          { key: "minimal", label: copy.styles.minimal },
          { key: "koyu", label: copy.styles.koyu },
          { key: "uydu", label: copy.styles.uydu },
        ].map((style) => (
          <button
            key={style.key}
            type="button"
            onClick={() => setMapStyle(style.key as MapStyleKey)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              mapStyle === style.key
                ? "bg-[#17140f] text-white"
                : "border border-[#d2c4af] bg-white text-[#6f5a3c] hover:bg-[#f1e6d5]"
            }`}
          >
            {style.label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <div className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={portfolioQuery}
              onChange={(event) => setPortfolioQuery(event.target.value)}
              placeholder={copy.listingSearch}
              className="input"
            />
            <button
              type="button"
              onClick={() => {
                setPortfolioQuery("");
                setViewCenter(defaultCenter);
                setViewZoom(10);
              }}
              className="cursor-pointer rounded-full border border-[#d2c4af] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-[#6f5a3c] transition hover:bg-[#f1e6d5]"
            >
              {copy.clear}
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              placeholder={copy.locationSearch}
              className="input"
            />
            <button
              type="button"
              onClick={handleLocationSearch}
              className="cursor-pointer rounded-full bg-[#17140f] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-black"
            >
              {copy.searchLocation}
            </button>
          </div>

          {locationSearch.type === "error" ? (
            <p className="text-xs text-rose-700">{locationSearch.message}</p>
          ) : null}

          <PropertyMapCanvas
            portfolios={filteredPortfolios}
            center={viewCenter}
            zoom={viewZoom}
            mapStyle={mapStyle}
          />
        </div>

        <aside className="rounded-2xl border border-[#d9cdbb] bg-[#fffdf8] p-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6f45]">
            {copy.mapResults}
          </p>

          <div className="mt-3 space-y-2">
            {filteredPortfolios.slice(0, 8).map((portfolio) => (
              <article key={portfolio.id} className="rounded-xl border border-[#e4d8c6] bg-white p-3">
                <p className="text-[10px] uppercase tracking-[0.15em] text-[#8f8168]">
                  {portfolio.listingRef}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-[#2b241a]">{portfolio.title}</h3>
                <p className="mt-1 text-xs text-[#6d6253]">
                  {portfolio.city} / {portfolio.district}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#6a4f22]"><PriceText amount={portfolio.price} /></p>
                <Link href={`/ilan/${portfolio.slug}`} className="mt-1 inline-block text-xs font-semibold underline">
                  {copy.openListing}
                </Link>
              </article>
            ))}

            {filteredPortfolios.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d8cbb7] p-3 text-xs text-[#6d6253]">
                {copy.noMapResults}
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
