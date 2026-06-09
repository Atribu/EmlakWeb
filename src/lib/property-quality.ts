import type { Property } from "@/lib/types";

export type PropertyQualityIssueTone = "critical" | "advisory";

export type PropertyQualityIssue = {
  id: string;
  label: string;
  tone: PropertyQualityIssueTone;
};

export type PropertyQualitySummary = {
  advisoryIssues: PropertyQualityIssue[];
  criticalIssues: PropertyQualityIssue[];
  isReadyForApproval: boolean;
  totalIssueCount: number;
};

const EXTRA_LANGUAGE_LABELS = [
  { code: "EN", label: "İngilizce" },
  { code: "RU", label: "Rusça" },
  { code: "AR", label: "Arapça" },
] as const;

function hasText(value: string | undefined, minLength = 1) {
  return typeof value === "string" && value.trim().length >= minLength;
}

function addIssue(target: PropertyQualityIssue[], tone: PropertyQualityIssueTone, id: string, label: string) {
  target.push({ id, tone, label });
}

export function summarizePropertyQuality(property: Property): PropertyQualitySummary {
  const criticalIssues: PropertyQualityIssue[] = [];
  const advisoryIssues: PropertyQualityIssue[] = [];

  if (!hasText(property.title, 5)) {
    addIssue(criticalIssues, "critical", "title", "Portföy başlığı çok kısa.");
  }

  if (!hasText(property.description, 60)) {
    addIssue(criticalIssues, "critical", "description", "Türkçe açıklama daha detaylı girilmeli.");
  }

  if (!hasText(property.country) || !hasText(property.city) || !hasText(property.district) || !hasText(property.neighborhood)) {
    addIssue(criticalIssues, "critical", "location", "Ülke, şehir, ilçe ve mahalle bilgileri tamamlanmalı.");
  }

  if (!hasText(property.rooms)) {
    addIssue(criticalIssues, "critical", "rooms", "Oda tipi seçilmemiş.");
  }

  if (!(property.areaM2 > 0)) {
    addIssue(criticalIssues, "critical", "area", "Metrekare bilgisi eksik.");
  }

  if (!(property.price > 0)) {
    addIssue(criticalIssues, "critical", "price", "Fiyat bilgisi eksik.");
  }

  if (!hasText(property.heating)) {
    addIssue(criticalIssues, "critical", "heating", "Isıtma bilgisi seçilmemiş.");
  }

  if (!hasText(property.advisorId)) {
    addIssue(criticalIssues, "critical", "advisor", "Danışman ataması yapılmamış.");
  }

  if (!hasText(property.coverImage)) {
    addIssue(criticalIssues, "critical", "cover", "Kapak görseli eksik.");
  }

  if ((property.galleryImages?.length ?? 0) === 0) {
    addIssue(criticalIssues, "critical", "gallery", "Galeri görseli bulunmuyor.");
  }

  if ((property.highlights?.length ?? 0) === 0) {
    addIssue(advisoryIssues, "advisory", "highlights", "Öne çıkanlar alanı boş.");
  }

  if ((property.features?.length ?? 0) === 0) {
    addIssue(advisoryIssues, "advisory", "features", "Özellikler alanı boş.");
  }

  if ((property.infoItems?.length ?? 0) < 3) {
    addIssue(advisoryIssues, "advisory", "info-items", "Iconlu genel bilgiler artırılabilir.");
  }

  if (!hasText(property.developerCompany)) {
    addIssue(advisoryIssues, "advisory", "developer-company", "Firma / proje bilgisi eklenmemiş.");
  }

  if (
    !Number.isFinite(property.latitude)
    || !Number.isFinite(property.longitude)
    || (property.latitude === 0 && property.longitude === 0)
  ) {
    addIssue(advisoryIssues, "advisory", "coordinates", "Harita konumu netleştirilmeli.");
  }

  EXTRA_LANGUAGE_LABELS.forEach((language) => {
    const translation = property.translations?.[language.code];

    if (!hasText(translation?.title) || !hasText(translation?.description, 40)) {
      addIssue(advisoryIssues, "advisory", `translation-${language.code}`, `${language.label} içerikleri eksik.`);
    }
  });

  return {
    criticalIssues,
    advisoryIssues,
    isReadyForApproval: criticalIssues.length === 0,
    totalIssueCount: criticalIssues.length + advisoryIssues.length,
  };
}
