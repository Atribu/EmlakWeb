import { convertAmountBetweenCurrencies, type ExchangeRateTable } from "@/lib/exchange-rates-shared";
import type { SiteCurrency } from "@/lib/site-preferences";
import type { Property } from "@/lib/types";

export type PropertyPriceFields = Pick<Property, "price" | "priceSourceAmount" | "priceCurrency">;

export function propertyDisplayAmount(property: PropertyPriceFields): number {
  return property.priceSourceAmount ?? property.price;
}

export function propertyDisplayCurrency(property: PropertyPriceFields): SiteCurrency {
  return property.priceCurrency ?? "TRY";
}

export function propertyAmountInCurrency(
  property: PropertyPriceFields,
  targetCurrency: SiteCurrency,
  exchangeRates: ExchangeRateTable,
): number {
  return convertAmountBetweenCurrencies(
    propertyDisplayAmount(property),
    propertyDisplayCurrency(property),
    targetCurrency,
    exchangeRates,
  );
}

type DisplayPriceFilter = {
  currency: SiteCurrency;
  exchangeRates: ExchangeRateTable;
  minPrice?: number;
  maxPrice?: number;
};

export function filterPropertiesByDisplayPrice<T extends PropertyPriceFields>(
  properties: T[],
  filter: DisplayPriceFilter,
): T[] {
  const hasMinimum = typeof filter.minPrice === "number" && Number.isFinite(filter.minPrice);
  const hasMaximum = typeof filter.maxPrice === "number" && Number.isFinite(filter.maxPrice);

  if (!hasMinimum && !hasMaximum) {
    return properties;
  }

  return properties.filter((property) => {
    // PriceText displays whole units, so filters compare against that same rounded value.
    const displayAmount = Math.round(propertyAmountInCurrency(property, filter.currency, filter.exchangeRates));

    if (hasMinimum && displayAmount < filter.minPrice!) {
      return false;
    }

    if (hasMaximum && displayAmount > filter.maxPrice!) {
      return false;
    }

    return true;
  });
}
