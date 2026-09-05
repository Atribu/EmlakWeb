import type { Property, PropertyMarketStatus, PropertyPublicationStatus } from "@/lib/types";
import { summarizePropertyQuality } from "@/lib/property-quality";

export type PropertyPanelQualityFilter = "all" | "ready" | "critical" | "advisory";

export type PropertyPanelFilterPreset = {
  id: string;
  name: string;
  filters: PropertyPanelFilterState;
  createdAt: string;
};

export type PropertyPanelFilterState = {
  query: string;
  companyFilter: string;
  internalSearch: string;
  advisorFilter: string;
  countryFilter: string;
  publicationFilter: "all" | PropertyPublicationStatus;
  marketStatusFilter: "all" | PropertyMarketStatus;
  qualityFilter: PropertyPanelQualityFilter;
};

export const defaultPropertyPanelFilters: PropertyPanelFilterState = {
  query: "",
  companyFilter: "",
  internalSearch: "",
  advisorFilter: "",
  countryFilter: "",
  publicationFilter: "all",
  marketStatusFilter: "all",
  qualityFilter: "all",
};

export const PROPERTY_PANEL_QUALITY_FILTER_OPTIONS: Array<{
  label: string;
  value: Exclude<PropertyPanelQualityFilter, "all">;
}> = [
  { label: "Sadece onaya hazır", value: "ready" },
  { label: "Sadece kritik eksiği olanlar", value: "critical" },
  { label: "Sadece içerik uyarısı olanlar", value: "advisory" },
];

export function clonePropertyPanelFilters(filters: PropertyPanelFilterState): PropertyPanelFilterState {
  return {
    ...defaultPropertyPanelFilters,
    ...filters,
  };
}

export function sanitizePropertyPanelFilters(value: unknown): PropertyPanelFilterState {
  if (!value || typeof value !== "object") {
    return clonePropertyPanelFilters(defaultPropertyPanelFilters);
  }

  const candidate = value as Partial<PropertyPanelFilterState>;

  return {
    query: typeof candidate.query === "string" ? candidate.query : "",
    companyFilter: typeof candidate.companyFilter === "string" ? candidate.companyFilter : "",
    internalSearch: typeof candidate.internalSearch === "string" ? candidate.internalSearch : "",
    advisorFilter: typeof candidate.advisorFilter === "string" ? candidate.advisorFilter : "",
    countryFilter: typeof candidate.countryFilter === "string" ? candidate.countryFilter : "",
    publicationFilter:
      candidate.publicationFilter === "Taslak"
      || candidate.publicationFilter === "Onay Bekliyor"
      || candidate.publicationFilter === "Aktif"
      || candidate.publicationFilter === "Pasif"
      || candidate.publicationFilter === "Satıldı"
        ? candidate.publicationFilter
        : "all",
    marketStatusFilter:
      candidate.marketStatusFilter === "Hazır" || candidate.marketStatusFilter === "Proje"
        ? candidate.marketStatusFilter
        : "all",
    qualityFilter:
      candidate.qualityFilter === "ready"
      || candidate.qualityFilter === "critical"
      || candidate.qualityFilter === "advisory"
        ? candidate.qualityFilter
        : "all",
  };
}

export function sanitizePropertyPanelFilterPreset(value: unknown): PropertyPanelFilterPreset | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<PropertyPanelFilterPreset>;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";

  if (!name) {
    return null;
  }

  return {
    id:
      typeof candidate.id === "string" && candidate.id.trim()
        ? candidate.id.trim()
        : `preset-${crypto.randomUUID()}`,
    name,
    filters: sanitizePropertyPanelFilters(candidate.filters),
    createdAt:
      typeof candidate.createdAt === "string" && candidate.createdAt.trim()
        ? candidate.createdAt
        : new Date().toISOString(),
  };
}

export function filterPresetStorageKey(scope: string) {
  return `panel-property-filter-presets:${scope}`;
}

export function normalizePanelText(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function buildPanelCompanyOptions(properties: Property[]) {
  return Array.from(
    new Set(
      properties
        .map((property) => property.developerCompany?.trim())
        .filter((company): company is string => Boolean(company)),
    ),
  ).sort((left, right) => left.localeCompare(right, "tr"));
}

export function buildPanelCountryOptions(properties: Property[]) {
  return Array.from(
    new Set(
      properties
        .map((property) => property.country?.trim() || "Türkiye")
        .filter((country): country is string => Boolean(country)),
    ),
  ).sort((left, right) => left.localeCompare(right, "tr"));
}

export function filterPanelProperties(properties: Property[], filters: PropertyPanelFilterState) {
  const normalizedQuery = normalizePanelText(filters.query.trim());
  const normalizedCompany = normalizePanelText(filters.companyFilter.trim());
  const normalizedInternalSearch = normalizePanelText(filters.internalSearch.trim());

  return properties.filter((property) => {
    if (filters.qualityFilter !== "all") {
      const quality = summarizePropertyQuality(property);

      if (filters.qualityFilter === "ready" && !quality.isReadyForApproval) {
        return false;
      }

      if (filters.qualityFilter === "critical" && quality.criticalIssues.length === 0) {
        return false;
      }

      if (
        filters.qualityFilter === "advisory"
        && (quality.criticalIssues.length > 0 || quality.advisoryIssues.length === 0)
      ) {
        return false;
      }
    }

    if (
      filters.publicationFilter !== "all" &&
      (property.publicationStatus ?? "Aktif") !== filters.publicationFilter
    ) {
      return false;
    }

    if (filters.marketStatusFilter !== "all" && (property.marketStatus ?? "Hazır") !== filters.marketStatusFilter) {
      return false;
    }

    if (filters.advisorFilter && property.advisorId !== filters.advisorFilter) {
      return false;
    }

    if (filters.countryFilter && (property.country ?? "Türkiye") !== filters.countryFilter) {
      return false;
    }

    if (normalizedCompany) {
      const companyName = normalizePanelText(property.developerCompany ?? "");

      if (!companyName.includes(normalizedCompany)) {
        return false;
      }
    }

    if (normalizedQuery) {
      const publicHaystack = normalizePanelText(
        [
          property.title,
          property.listingRef,
          property.country ?? "",
          property.city,
          property.district,
          property.neighborhood,
          property.type,
          property.rooms,
          property.developerCompany ?? "",
        ].join(" "),
      );

      if (!publicHaystack.includes(normalizedQuery)) {
        return false;
      }
    }

    if (!normalizedInternalSearch) {
      return true;
    }

    const internalHaystack = normalizePanelText(
      [
        property.title,
        property.listingRef,
        property.country ?? "",
        property.city,
        property.district,
        property.neighborhood,
        property.developerCompany ?? "",
        property.adminCommissionNotes ?? "",
        property.adminPrivateNotes ?? "",
        property.staffNotes ?? "",
        property.customerFeedbackNotes ?? "",
      ].join(" "),
    );

    return internalHaystack.includes(normalizedInternalSearch);
  });
}
