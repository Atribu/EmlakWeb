import type { SiteLanguage } from "@/lib/site-preferences";
import type { Property, PropertyTranslationFields, PropertyTranslations } from "@/lib/types";

export const PROPERTY_CONTENT_LANGUAGES = [
  { code: "EN", label: "English" },
  { code: "RU", label: "Русский" },
  { code: "AR", label: "العربية" },
] as const satisfies ReadonlyArray<{ code: Exclude<SiteLanguage, "TR">; label: string }>;

export type PropertyContentLanguage = (typeof PROPERTY_CONTENT_LANGUAGES)[number]["code"];

function sanitizeTranslationFields(fields: PropertyTranslationFields | undefined): PropertyTranslationFields | undefined {
  if (!fields) {
    return undefined;
  }

  const title = typeof fields.title === "string" && fields.title.trim() ? fields.title.trim() : undefined;
  const description =
    typeof fields.description === "string" && fields.description.trim() ? fields.description.trim() : undefined;
  const highlights =
    Array.isArray(fields.highlights) && fields.highlights.length > 0
      ? fields.highlights.map((item) => item.trim()).filter(Boolean)
      : undefined;
  const features =
    Array.isArray(fields.features) && fields.features.length > 0
      ? fields.features.map((item) => item.trim()).filter(Boolean)
      : undefined;

  if (!title && !description && !highlights?.length && !features?.length) {
    return undefined;
  }

  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    ...(highlights?.length ? { highlights } : {}),
    ...(features?.length ? { features } : {}),
  };
}

export function sanitizePropertyTranslations(translations: PropertyTranslations | undefined): PropertyTranslations | undefined {
  if (!translations) {
    return undefined;
  }

  const output = PROPERTY_CONTENT_LANGUAGES.reduce<PropertyTranslations>((accumulator, language) => {
    const nextFields = sanitizeTranslationFields(translations[language.code]);

    if (nextFields) {
      accumulator[language.code] = nextFields;
    }

    return accumulator;
  }, {});

  return Object.keys(output).length > 0 ? output : undefined;
}

function translationForLanguage(property: Property, language: SiteLanguage): PropertyTranslationFields | undefined {
  if (language === "TR") {
    return undefined;
  }

  return sanitizeTranslationFields(property.translations?.[language]);
}

export function propertyTitleForLanguage(property: Property, language: SiteLanguage): string {
  return translationForLanguage(property, language)?.title ?? property.title;
}

export function propertyDescriptionForLanguage(property: Property, language: SiteLanguage): string {
  return translationForLanguage(property, language)?.description ?? property.description;
}

export function propertyHighlightsForLanguage(property: Property, language: SiteLanguage): string[] {
  return translationForLanguage(property, language)?.highlights ?? property.highlights;
}

export function propertyFeaturesForLanguage(property: Property, language: SiteLanguage): string[] {
  return translationForLanguage(property, language)?.features ?? property.features;
}

function readOptionalText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function readOptionalList(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    const items = value.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }

  if (typeof value === "string") {
    const items = value.split(",").map((item) => item.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  }

  return undefined;
}

export function readPropertyTranslationsFromFormData(formData: FormData): PropertyTranslations | undefined {
  const translations = PROPERTY_CONTENT_LANGUAGES.reduce<PropertyTranslations>((accumulator, language) => {
    accumulator[language.code] = {
      title: readOptionalText(formData.get(`translationTitle_${language.code}`)),
      description: readOptionalText(formData.get(`translationDescription_${language.code}`)),
      highlights: readOptionalList(formData.get(`translationHighlights_${language.code}`)),
      features: readOptionalList(formData.get(`translationFeatures_${language.code}`)),
    };

    return accumulator;
  }, {});

  return sanitizePropertyTranslations(translations);
}

export function readPropertyTranslationsFromPayload(value: unknown): PropertyTranslations | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const payload = value as Record<string, unknown>;

  const translations = PROPERTY_CONTENT_LANGUAGES.reduce<PropertyTranslations>((accumulator, language) => {
    const rawLanguageValue = payload[language.code];
    const rawFields = rawLanguageValue && typeof rawLanguageValue === "object"
      ? (rawLanguageValue as Record<string, unknown>)
      : undefined;

    accumulator[language.code] = {
      title: readOptionalText(rawFields?.title),
      description: readOptionalText(rawFields?.description),
      highlights: readOptionalList(rawFields?.highlights),
      features: readOptionalList(rawFields?.features),
    };

    return accumulator;
  }, {});

  return sanitizePropertyTranslations(translations);
}
