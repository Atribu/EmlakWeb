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
export const PROPERTY_PUBLICATION_STATUS_OPTIONS: PropertyPublicationStatus[] = [
  "Taslak",
  "Onay Bekliyor",
  "Aktif",
  "Pasif",
  "Satıldı",
];

export function normalizePropertyPublicationStatus(
  status: PropertyPublicationStatus | undefined,
): PropertyPublicationStatus {
  return status ?? "Aktif";
}

export function isPropertyPublished(status: PropertyPublicationStatus | undefined) {
  return normalizePropertyPublicationStatus(status) === "Aktif";
}

export function isPropertyPendingApproval(status: PropertyPublicationStatus | undefined) {
  return normalizePropertyPublicationStatus(status) === "Onay Bekliyor";
}

export function getPropertyPublicationBadgeClass(status: PropertyPublicationStatus | undefined) {
  switch (normalizePropertyPublicationStatus(status)) {
    case "Aktif":
      return "bg-emerald-100 text-emerald-800";
    case "Onay Bekliyor":
      return "bg-sky-100 text-sky-800";
    case "Taslak":
      return "bg-slate-200 text-slate-700";
    case "Satıldı":
      return "bg-rose-100 text-rose-800";
    case "Pasif":
    default:
      return "bg-amber-100 text-amber-800";
  }
}

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
