import type { PropertyMarketStatus, PropertyPriceCurrency, PropertyPublicationStatus } from "@/lib/types";

export const PROPERTY_TYPE_OPTIONS = ["Daire", "Villa", "Rezidans", "Arsa", "Ofis"] as const;

export const PROPERTY_COUNTRY_OPTIONS = [
  "Türkiye",
  "Birleşik Arap Emirlikleri",
  "Katar",
  "Suudi Arabistan",
  "Kuzey Kıbrıs",
  "İngiltere",
  "Almanya",
  "Rusya",
] as const;

export const PROPERTY_PRICE_CURRENCY_OPTIONS: Array<{ code: PropertyPriceCurrency; label: string; symbol: string }> = [
  { code: "TRY", label: "Türk Lirası", symbol: "₺" },
  { code: "USD", label: "Dolar", symbol: "$" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "GBP", label: "Sterlin", symbol: "£" },
];

export const PROPERTY_MARKET_STATUS_OPTIONS: PropertyMarketStatus[] = ["Hazır", "Proje"];
export const PROPERTY_PUBLICATION_STATUS_OPTIONS: PropertyPublicationStatus[] = ["Pasif", "Aktif"];

export const PROPERTY_ROOM_OPTIONS = [
  "Stüdyo",
  "1+0",
  "1+1",
  "2+1",
  "2+2",
  "3+1",
  "3+2",
  "4+1",
  "4+2",
  "5+1",
  "5+2",
  "6+1",
  "6+2",
  "Açık Plan",
] as const;

export const PROPERTY_HEATING_OPTIONS = [
  "Kombi",
  "Merkezi",
  "Yerden Isıtma",
  "VRF / Merkezi Klima",
  "Klima",
  "Doğalgaz Sobalı",
  "Elektrikli",
  "Yok",
] as const;
