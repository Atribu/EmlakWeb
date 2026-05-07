import type { SiteCurrency } from "@/lib/site-preferences";
import type { Property } from "@/lib/types";

type PropertyPriceFields = Pick<Property, "price" | "priceSourceAmount" | "priceCurrency">;

export function propertyDisplayAmount(property: PropertyPriceFields): number {
  return property.priceSourceAmount ?? property.price;
}

export function propertyDisplayCurrency(property: PropertyPriceFields): SiteCurrency {
  return property.priceCurrency ?? "TRY";
}
