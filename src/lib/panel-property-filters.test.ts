import assert from "node:assert/strict";
import test from "node:test";

import {
  defaultPropertyPanelFilters,
  filterPanelProperties,
  sanitizePropertyPanelFilters,
} from "@/lib/panel-property-filters";
import type { Property } from "@/lib/types";

function createProperty(overrides: Partial<Property>): Property {
  return {
    id: "prp-1",
    slug: "zekeriyakoy-villa",
    title: "Zekeriyakoy Villa",
    country: "Türkiye",
    city: "İstanbul",
    district: "Sarıyer",
    neighborhood: "Zekeriyaköy",
    type: "Villa",
    price: 1000000,
    priceCurrency: "TRY",
    priceSourceAmount: 1000000,
    rooms: "4+1",
    areaM2: 240,
    floor: "",
    heating: "Yerden Isıtma",
    marketStatus: "Hazır",
    publicationStatus: "Aktif",
    listingRef: "PN-0001",
    description: "Açıklama",
    highlights: ["Bahçe"],
    features: ["Havuz"],
    infoItems: [],
    developerCompany: "Rodina",
    staffNotes: "Satış ekibi notu",
    customerFeedbackNotes: "",
    adminCommissionNotes: "Komisyon notu",
    adminPrivateNotes: "",
    advisorId: "adv-1",
    latitude: 41,
    longitude: 29,
    coverColor: "#000000",
    coverImage: "/cover.webp",
    galleryImages: ["/gallery.webp"],
    imageLabels: ["Galeri 1"],
    translations: {},
    publishedAt: new Date().toISOString(),
    ...overrides,
  };
}

test("sanitizePropertyPanelFilters falls back to safe defaults for invalid values", () => {
  const filters = sanitizePropertyPanelFilters({
    query: "villa",
    publicationFilter: "invalid",
    marketStatusFilter: "Proje",
    qualityFilter: "unknown",
  });

  assert.equal(filters.query, "villa");
  assert.equal(filters.publicationFilter, "all");
  assert.equal(filters.marketStatusFilter, "Proje");
  assert.equal(filters.qualityFilter, "all");
});

test("filterPanelProperties filters by company, country, status, advisor, and internal notes", () => {
  const properties = [
    createProperty({ slug: "a", developerCompany: "Rodina", advisorId: "adv-1" }),
    createProperty({
      slug: "b",
      developerCompany: "Other",
      country: "Dubai",
      advisorId: "adv-2",
      adminCommissionNotes: "özel anlaşma",
      marketStatus: "Proje",
    }),
  ];

  const result = filterPanelProperties(properties, {
    ...defaultPropertyPanelFilters,
    companyFilter: "rodina",
    countryFilter: "Türkiye",
    marketStatusFilter: "Hazır",
    advisorFilter: "adv-1",
    internalSearch: "satış",
  });

  assert.deepEqual(result.map((property) => property.slug), ["a"]);
});
