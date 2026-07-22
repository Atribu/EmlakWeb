import assert from "node:assert/strict";
import test from "node:test";

import {
  BRAND_NAME,
  absoluteUrl,
  breadcrumbSchema,
  missingPageMetadata,
  organizationSchema,
  privatePageMetadata,
  propertySchema,
  publicPageMetadata,
  websiteSchema,
} from "@/lib/seo";
import type { Property } from "@/lib/types";

test("publicPageMetadata assigns the page-specific canonical URL", () => {
  const metadata = publicPageMetadata({
    title: "Portföyler | RODINA Invest Co.",
    description: "Aktif portföyler",
    canonical: "/portfoyler",
  });

  assert.equal(metadata.alternates?.canonical, "/portfoyler");
  assert.equal(metadata.openGraph?.url, "/portfoyler");
  assert.equal(metadata.robots, undefined);
});

test("filtered public pages stay crawlable but are excluded from the index", () => {
  const metadata = publicPageMetadata({
    title: "İstanbul Portföyleri | RODINA Invest Co.",
    description: "Filtrelenmiş portföyler",
    canonical: "/portfoyler",
    indexable: false,
  });

  assert.equal(metadata.robots && typeof metadata.robots !== "string" && metadata.robots.index, false);
  assert.equal(metadata.robots && typeof metadata.robots !== "string" && metadata.robots.follow, true);
  assert.equal(metadata.alternates?.canonical, "/portfoyler");
});

test("private and missing pages cannot inherit a public canonical URL", () => {
  const privateMetadata = privatePageMetadata("Yönetim Ofisi");
  const missingMetadata = missingPageMetadata("İlan Bulunamadı");

  assert.equal(privateMetadata.alternates?.canonical, null);
  assert.equal(missingMetadata.alternates?.canonical, null);
  assert.equal(privateMetadata.robots && typeof privateMetadata.robots !== "string" && privateMetadata.robots.index, false);
  assert.equal(missingMetadata.robots && typeof missingMetadata.robots !== "string" && missingMetadata.robots.index, false);
});

test("organization schema identifies the RODINA brand with an absolute logo", () => {
  const schema = organizationSchema();

  assert.equal(schema.name, BRAND_NAME);
  assert.equal(schema["@type"], "RealEstateAgent");
  assert.equal(schema.logo, "http://localhost:3000/brand/rodina-logo.webp");
  assert.deepEqual(schema.sameAs, ["https://instagram.com/rodinainvest", "https://t.me/rodinainvest"]);
});

test("website schema exposes the portfolio search action", () => {
  const schema = websiteSchema();

  assert.equal(schema["@type"], "WebSite");
  assert.equal(schema.potentialAction.target.urlTemplate, "http://localhost:3000/portfoyler?q={search_term_string}");
});

test("breadcrumb schema builds absolute ordered list items", () => {
  const schema = breadcrumbSchema([
    { name: "Ana Sayfa", path: "/" },
    { name: "Portföyler", path: "/portfoyler" },
  ]);

  assert.equal(schema.itemListElement[0].position, 1);
  assert.equal(schema.itemListElement[0].item, "http://localhost:3000/");
  assert.equal(schema.itemListElement[1].position, 2);
  assert.equal(schema.itemListElement[1].item, "http://localhost:3000/portfoyler");
});

test("property schema uses absolute image URLs and connects the seller organization", () => {
  const property: Property = {
    id: "prop-1",
    slug: "test-villa",
    title: "Test Villa",
    country: "Türkiye",
    city: "İstanbul",
    district: "Sarıyer",
    neighborhood: "Zekeriyaköy",
    type: "Villa",
    price: 1000000,
    priceCurrency: "EUR",
    priceSourceAmount: 1000000,
    rooms: "4+1",
    areaM2: 250.5,
    floor: "",
    heating: "Yerden Isıtma",
    marketStatus: "Hazır",
    publicationStatus: "Aktif",
    listingRef: "RN-0001",
    description: "Bahçeli premium villa.",
    highlights: [],
    features: [],
    advisorId: "",
    latitude: 41.1,
    longitude: 29,
    coverColor: "#111827",
    coverImage: "/api/uploads/test-cover.webp",
    galleryImages: ["/api/uploads/test-gallery.webp", "https://images.example.com/external.webp"],
    imageLabels: [],
    publishedAt: "2026-07-22T00:00:00.000Z",
  };
  const schema = propertySchema(property);

  assert.deepEqual(schema.image, [
    "http://localhost:3000/api/uploads/test-cover.webp",
    "http://localhost:3000/api/uploads/test-gallery.webp",
    "https://images.example.com/external.webp",
  ]);
  assert.equal(schema.seller["@id"], "http://localhost:3000/#organization");
  assert.equal(schema.offers.priceCurrency, "EUR");
});

test("absoluteUrl preserves external image URLs", () => {
  assert.equal(absoluteUrl("https://images.example.com/listing.webp"), "https://images.example.com/listing.webp");
});
