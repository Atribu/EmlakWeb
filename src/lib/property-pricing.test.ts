import assert from "node:assert/strict";
import test from "node:test";

import { filterPropertiesByDisplayPrice, propertyAmountInCurrency } from "@/lib/property-pricing";

const exchangeRates = {
  TRY: 1,
  USD: 32,
  EUR: 35,
  GBP: 40,
} as const;

test("exact displayed price is included by an equal minimum and maximum", () => {
  const property = {
    price: 2_500_000,
    priceSourceAmount: 100_000,
    priceCurrency: "USD" as const,
  };

  const results = filterPropertiesByDisplayPrice([property], {
    currency: "USD",
    exchangeRates,
    minPrice: 100_000,
    maxPrice: 100_000,
  });

  assert.deepEqual(results, [property]);
});

test("filtering uses original listing currency instead of a stale TRY snapshot", () => {
  const property = {
    price: 2_500_000,
    priceSourceAmount: 100_000,
    priceCurrency: "USD" as const,
  };

  assert.equal(propertyAmountInCurrency(property, "TRY", exchangeRates), 3_200_000);
  assert.equal(
    filterPropertiesByDisplayPrice([property], {
      currency: "TRY",
      exchangeRates,
      minPrice: 3_200_000,
      maxPrice: 3_200_000,
    }).length,
    1,
  );
});

test("display rounding and inclusive range boundaries match PriceText", () => {
  const property = {
    price: 3_200_013,
    priceSourceAmount: 100_000.4,
    priceCurrency: "USD" as const,
  };

  assert.equal(
    filterPropertiesByDisplayPrice([property], {
      currency: "USD",
      exchangeRates,
      minPrice: 100_000,
      maxPrice: 100_000,
    }).length,
    1,
  );
});
