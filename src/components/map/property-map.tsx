"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { LatLngTuple } from "leaflet";

import { formatPrice } from "@/lib/format";
import type { MapPortfolio, MapStyleKey } from "@/components/map/property-map-canvas";

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
      setLocationSearch({ type: "error", message: "Lütfen bir konum girin." });
      return;
    }

    setLocationSearch({ type: "loading" });

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`,
        {
          headers: {
            "Accept-Language": "tr",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Konum aranırken hata oluştu.");
      }

      const results = (await response.json()) as Array<{ lat: string; lon: string }>;
      const first = results[0];

      if (!first) {
        setLocationSearch({ type: "error", message: "Konum bulunamadı. Daha net arayın." });
        return;
      }

      setViewCenter([Number(first.lat), Number(first.lon)]);
      setViewZoom(13);
      setLocationSearch({ type: "idle" });
    } catch {
      setLocationSearch({ type: "error", message: "Konum servisine ulaşılamadı." });
    }
  }

  return (
    <section className="luxury-card p-4 sm:p-6" id="harita">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="section-kicker">Harita Üzerinden Keşfet</span>
          <h2 className="mt-2 text-[2rem] leading-none font-semibold text-[#1f1a14]">
            Portföy Lokasyon Haritası
          </h2>
          <p className="mt-2 text-sm text-[#655c50]">
            Haritada ilanları görün, konum araması yapın ve ilgili portföye doğrudan gidin.
          </p>
        </div>
        <p className="text-sm text-[#6d6356]">{filteredPortfolios.length} sonuç</p>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7e6d53]">
          Harita Görünümü
        </p>
        {[
          { key: "minimal", label: "Minimal" },
          { key: "koyu", label: "Koyu" },
          { key: "uydu", label: "Uydu" },
        ].map((style) => (
          <button
            key={style.key}
            type="button"
            onClick={() => setMapStyle(style.key as MapStyleKey)}
            className={`cursor-pointer rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition ${
              mapStyle === style.key
                ? "bg-[#1f1a14] text-white"
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
              placeholder="Portföy ara (başlık, ilçe, kod)"
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
              Temizle
            </button>
          </div>

          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <input
              value={locationQuery}
              onChange={(event) => setLocationQuery(event.target.value)}
              placeholder="Haritada konum ara (örn. Nişantaşı, İstanbul)"
              className="input"
            />
            <button
              type="button"
              onClick={handleLocationSearch}
              className="cursor-pointer rounded-full bg-[#1f1a14] px-4 py-2 text-xs font-semibold uppercase tracking-[0.15em] text-white transition hover:bg-black"
            >
              Konum Ara
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
            Harita Sonuçları
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
                <p className="mt-1 text-xs font-semibold text-[#6a4f22]">{formatPrice(portfolio.price)}</p>
                <Link href={`/ilan/${portfolio.slug}`} className="mt-1 inline-block text-xs font-semibold underline">
                  Portföyü Aç
                </Link>
              </article>
            ))}

            {filteredPortfolios.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[#d8cbb7] p-3 text-xs text-[#6d6253]">
                Haritada gösterilecek sonuç yok.
              </p>
            ) : null}
          </div>
        </aside>
      </div>
    </section>
  );
}
