import { HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS } from "@/lib/home-location-spotlights";
import type {
  CreateHomeLocationSpotlightInput,
  HomeLocationSpotlightLayout,
  HomeLocationSpotlightTranslationFields,
  HomeLocationSpotlightTranslations,
  PropertyPriceCurrency,
} from "@/lib/types";

const validLayouts = HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS.map((option) => option.value) as HomeLocationSpotlightLayout[];
const validPriceCurrencies: PropertyPriceCurrency[] = ["TRY", "USD", "EUR", "GBP"];

function parseRequiredString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parseOptionalPositiveNumber(value: unknown, label: string): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const normalizedValue = typeof value === "string" ? value.trim().replace(",", ".") : value;
  const numeric = Number(normalizedValue);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${label} geçerli bir sayı olmalıdır.`);
  }

  return numeric;
}

function parseOptionalInteger(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.trunc(numeric) : undefined;
}

function parseBoolean(value: unknown, label: string): boolean {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    if (value === "true" || value === "1") {
      return true;
    }

    if (value === "false" || value === "0") {
      return false;
    }
  }

  throw new Error(`${label} geçersiz.`);
}

function parseOptionalPriceCurrency(value: unknown): PropertyPriceCurrency | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !validPriceCurrencies.includes(value as PropertyPriceCurrency)) {
    throw new Error("Fiyat para birimi geçersiz.");
  }

  return value as PropertyPriceCurrency;
}

function parseLayoutVariant(value: unknown): HomeLocationSpotlightLayout | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  if (typeof value !== "string" || !validLayouts.includes(value as HomeLocationSpotlightLayout)) {
    throw new Error("Kart yerleşimi geçersiz.");
  }

  return value as HomeLocationSpotlightLayout;
}

function parseTranslationFields(value: unknown): HomeLocationSpotlightTranslationFields | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const fields = value as Record<string, unknown>;
  const output: HomeLocationSpotlightTranslationFields = {
    title: parseOptionalString(fields.title),
    subtitle: parseOptionalString(fields.subtitle),
    badge: parseOptionalString(fields.badge),
    blurb: parseOptionalString(fields.blurb),
    statText: parseOptionalString(fields.statText),
  };

  if (!Object.values(output).some(Boolean)) {
    return undefined;
  }

  return output;
}

function parseTranslations(value: unknown): HomeLocationSpotlightTranslations | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "object") {
    throw new Error("Dil alanları geçersiz.");
  }

  const translations = value as Record<string, unknown>;
  const output: HomeLocationSpotlightTranslations = {};

  for (const language of ["EN", "RU", "AR"] as const) {
    const parsed = parseTranslationFields(translations[language]);

    if (parsed) {
      output[language] = parsed;
    }
  }

  return output;
}

export function parseHomeLocationSpotlightInput(payload: unknown): CreateHomeLocationSpotlightInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const body = payload as Record<string, unknown>;
  const priceAmount = parseOptionalPositiveNumber(body.priceAmount, "Başlangıç fiyatı");

  return {
    title: parseRequiredString(body.title, "Başlık"),
    subtitle: parseRequiredString(body.subtitle, "Alt başlık"),
    badge: parseRequiredString(body.badge, "Rozet"),
    blurb: parseRequiredString(body.blurb, "Açıklama"),
    statText: parseOptionalString(body.statText),
    href: parseRequiredString(body.href, "Yönlenecek link"),
    image: parseRequiredString(body.image, "Görsel"),
    priceAmount,
    priceCurrency: priceAmount !== undefined ? parseOptionalPriceCurrency(body.priceCurrency) ?? "TRY" : undefined,
    layoutVariant: parseLayoutVariant(body.layoutVariant),
    sortOrder: parseOptionalInteger(body.sortOrder),
    isActive:
      body.isActive === undefined || body.isActive === null ? undefined : parseBoolean(body.isActive, "Aktiflik durumu"),
    translations: parseTranslations(body.translations),
  };
}
