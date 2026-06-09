import { normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { summarizePropertyQuality } from "@/lib/property-quality";
import type { Advisor, Property } from "@/lib/types";

function escapeCsvValue(value: string | number) {
  const stringValue = String(value ?? "");
  if (stringValue.includes(",") || stringValue.includes("\"") || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, "\"\"")}"`;
  }

  return stringValue;
}

function fileSafeText(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "portfoyler";
}

export function exportPropertiesToCsv(
  properties: Property[],
  advisors: Advisor[],
  options: { fileLabel?: string } = {},
) {
  if (properties.length === 0 || typeof window === "undefined") {
    return;
  }

  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor.name]));
  const headers = [
    "Portfoy Kodu",
    "Baslik",
    "Ulke",
    "Sehir",
    "Ilce",
    "Mahalle",
    "Tip",
    "Oda",
    "m2",
    "Fiyat",
    "Para Birimi",
    "Yayin Durumu",
    "Portfoy Durumu",
    "Danisman",
    "Firma",
    "Kalite Durumu",
    "Eksik Ozeti",
    "Yayin Tarihi",
  ];

  const rows = properties.map((property) => {
    const quality = summarizePropertyQuality(property);
    const issues = [...quality.criticalIssues, ...quality.advisoryIssues].map((issue) => issue.label).join(" | ");
    const qualityLabel =
      quality.criticalIssues.length > 0
        ? `${quality.criticalIssues.length} kritik`
        : quality.advisoryIssues.length > 0
          ? `${quality.advisoryIssues.length} uyari`
          : "Hazir";

    return [
      property.listingRef,
      property.title,
      property.country ?? "Türkiye",
      property.city,
      property.district,
      property.neighborhood,
      property.type,
      property.rooms,
      property.areaM2,
      property.priceSourceAmount ?? property.price,
      property.priceCurrency ?? "TRY",
      normalizePropertyPublicationStatus(property.publicationStatus),
      property.marketStatus ?? "Hazır",
      advisorMap.get(property.advisorId) ?? "Danışman yok",
      property.developerCompany ?? "",
      qualityLabel,
      issues,
      property.publishedAt,
    ];
  });

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => escapeCsvValue(cell)).join(","))
    .join("\n");

  const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const timestamp = new Date().toISOString().slice(0, 10);

  link.href = objectUrl;
  link.download = `${fileSafeText(options.fileLabel ?? "portfoy-listesi")}-${timestamp}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}
