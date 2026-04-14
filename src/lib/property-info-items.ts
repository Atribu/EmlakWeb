import type { PropertyInfoIconKey, PropertyInfoItem } from "@/lib/types";

export const PROPERTY_INFO_FIELD_COUNT = 6;

export const PROPERTY_INFO_OPTIONS: Array<{ key: PropertyInfoIconKey; label: string }> = [
  { key: "commission", label: "Komisyon" },
  { key: "location", label: "Konum" },
  { key: "building", label: "Bina / Blok" },
  { key: "rooms", label: "Oda Sayısı" },
  { key: "bath", label: "Banyo" },
  { key: "pool", label: "Havuz" },
  { key: "calendar", label: "Teslim / Tarih" },
  { key: "plane", label: "Havalimanı" },
  { key: "beach", label: "Deniz / Sahil" },
  { key: "area", label: "Alan / Mesafe" },
];

export const PROPERTY_SPECIAL_INFO_OPTIONS: Array<{ key: PropertyInfoIconKey; label: string }> = [
  { key: "commission", label: "Komisyon" },
  { key: "building", label: "Bina / Blok" },
  { key: "bath", label: "Banyo" },
  { key: "pool", label: "Havuz" },
  { key: "calendar", label: "Teslim / Tarih" },
  { key: "plane", label: "Havalimanı" },
  { key: "beach", label: "Deniz / Sahil" },
];

const validIcons = new Set<PropertyInfoIconKey>(PROPERTY_INFO_OPTIONS.map((option) => option.key));

export function sanitizePropertyInfoItems(items: PropertyInfoItem[] | undefined): PropertyInfoItem[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return items
    .map((item) => ({
      icon: item.icon,
      value: typeof item.value === "string" ? item.value.trim() : "",
    }))
    .filter((item): item is PropertyInfoItem => validIcons.has(item.icon) && item.value.length > 0);
}

export function readPropertyInfoItemsFromFormData(formData: FormData): PropertyInfoItem[] {
  const items: PropertyInfoItem[] = [];

  for (let index = 0; index < PROPERTY_INFO_FIELD_COUNT; index += 1) {
    const icon = formData.get(`infoIcon_${index}`); 
    const value = formData.get(`infoValue_${index}`);

    if (typeof icon !== "string" || typeof value !== "string") {
      continue;
    }

    const trimmedValue = value.trim();

    if (!validIcons.has(icon as PropertyInfoIconKey) || !trimmedValue) {
      continue;
    }

    items.push({
      icon: icon as PropertyInfoIconKey,
      value: trimmedValue,
    });
  }

  return sanitizePropertyInfoItems(items);
}

export function readPropertyInfoItemsFromPayload(value: unknown): PropertyInfoItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return sanitizePropertyInfoItems(
    value.map((item) => {
      const record = item && typeof item === "object" ? (item as Record<string, unknown>) : {};

      return {
        icon: record.icon as PropertyInfoIconKey,
        value: typeof record.value === "string" ? record.value : "",
      };
    }),
  );
}
