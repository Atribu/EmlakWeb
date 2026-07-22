import assert from "node:assert/strict";
import test from "node:test";

import {
  missingPageMetadata,
  privatePageMetadata,
  publicPageMetadata,
} from "@/lib/seo";

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
