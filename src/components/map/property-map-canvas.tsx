"use client";

import Link from "next/link";
import { DivIcon, type LatLngTuple } from "leaflet";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";

import { PriceText } from "@/components/price-text";
import { useSitePreferences } from "@/components/use-site-preferences";
import { mapComponentCopy } from "@/lib/site-copy";

export type MapPortfolio = {
  id: string;
  slug: string;
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  listingRef: string;
  price: number;
  latitude: number;
  longitude: number;
  advisorName?: string;
};

export type MapStyleKey = "minimal" | "koyu" | "uydu";

type PropertyMapCanvasProps = {
  portfolios: MapPortfolio[];
  center: LatLngTuple;
  zoom: number;
  mapStyle: MapStyleKey;
};

const markerIcon = new DivIcon({
  className: "portfolio-marker",
  html: "<span></span>",
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -8],
});

const mapStyles: Record<
  MapStyleKey,
  { url: string; attribution: string; className: string }
> = {
  minimal: {
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    className: "map-theme-minimal",
  },
  koyu: {
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    className: "map-theme-dark",
  },
  uydu: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community",
    className: "map-theme-satellite",
  },
};

function MapViewController({ center, zoom }: { center: LatLngTuple; zoom: number }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);

  return null;
}

export function PropertyMapCanvas({
  portfolios,
  center,
  zoom,
  mapStyle,
}: PropertyMapCanvasProps) {
  const { language } = useSitePreferences();
  const copy = mapComponentCopy(language);
  const markers = useMemo(
    () =>
      portfolios.filter(
        (item) => Number.isFinite(item.latitude) && Number.isFinite(item.longitude),
      ),
    [portfolios],
  );
  const style = mapStyles[mapStyle];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9cdbb]">
      <MapContainer
        center={center}
        zoom={zoom}
        className={`h-[460px] w-full ${style.className}`}
        scrollWheelZoom
      >
        <MapViewController center={center} zoom={zoom} />

        <TileLayer key={mapStyle} attribution={style.attribution} url={style.url} />

        {markers.map((portfolio) => (
          <Marker
            key={portfolio.id}
            icon={markerIcon}
            position={[portfolio.latitude, portfolio.longitude]}
          >
            <Popup minWidth={220}>
              <div className="space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#866a43]">
                  {portfolio.listingRef}
                </p>
                <h3 className="text-sm font-semibold text-slate-900">{portfolio.title}</h3>
                <p className="text-xs text-slate-600">
                  {portfolio.city} / {portfolio.district} / {portfolio.neighborhood}
                </p>
                <p className="text-xs font-semibold text-[#6a4f22]">
                  <PriceText amount={portfolio.price} />
                </p>
                {portfolio.advisorName ? (
                  <p className="text-xs text-slate-500">{copy.advisor}: {portfolio.advisorName}</p>
                ) : null}
                <Link href={`/ilan/${portfolio.slug}`} className="text-xs font-semibold underline">
                  {copy.detail}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
