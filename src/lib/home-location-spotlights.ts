import type { SiteLanguage } from "@/lib/site-preferences";
import type {
  HomeLocationSpotlight,
  HomeLocationSpotlightLayout,
  HomeLocationSpotlightTranslationFields,
} from "@/lib/types";

export const HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS: Array<{
  value: HomeLocationSpotlightLayout;
  label: string;
  description: string;
}> = [
  {
    value: "hero",
    label: "Büyük Vitrin",
    description: "Solda öne çıkan büyük kart görünümü.",
  },
  {
    value: "compact",
    label: "Kompakt Kart",
    description: "Üst sıradaki küçük tamamlayıcı kart görünümü.",
  },
  {
    value: "wide",
    label: "Geniş Kart",
    description: "Alt sıradaki yatay lokasyon kart görünümü.",
  },
  {
    value: "standard",
    label: "Standart Kart",
    description: "Dengeli genişlikte klasik kart görünümü.",
  },
];

const HOME_LOCATION_SPOTLIGHT_LAYOUT_CLASS_NAMES: Record<HomeLocationSpotlightLayout, string> = {
  hero: "lg:col-span-7 lg:min-h-[25rem]",
  compact: "sm:col-span-1 lg:col-span-5 lg:min-h-[12rem]",
  wide: "sm:col-span-1 lg:col-span-6 lg:min-h-[15rem]",
  standard: "sm:col-span-1 lg:col-span-6 lg:min-h-[14rem]",
};

export function getHomeLocationSpotlightClassName(layoutVariant: HomeLocationSpotlightLayout): string {
  return HOME_LOCATION_SPOTLIGHT_LAYOUT_CLASS_NAMES[layoutVariant] ?? HOME_LOCATION_SPOTLIGHT_LAYOUT_CLASS_NAMES.wide;
}

type LocalizedSpotlightField = keyof HomeLocationSpotlightTranslationFields;

export function getHomeLocationSpotlightField(
  spotlight: HomeLocationSpotlight,
  language: SiteLanguage,
  field: LocalizedSpotlightField,
): string | undefined {
  if (language !== "TR") {
    const translatedValue = spotlight.translations?.[language]?.[field]?.trim();

    if (translatedValue) {
      return translatedValue;
    }
  }

  const baseValue = spotlight[field];
  return typeof baseValue === "string" && baseValue.trim() ? baseValue.trim() : undefined;
}
