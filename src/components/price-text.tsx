"use client";

import { useExchangeRates } from "@/components/use-exchange-rates";
import { formatPrice } from "@/lib/format";

import { useSitePreferences } from "@/components/use-site-preferences";
import type { SiteCurrency } from "@/lib/site-preferences";

type PriceTextProps = {
  amount: number;
  sourceCurrency?: SiteCurrency;
  displayCurrency?: SiteCurrency;
};

export function PriceText({ amount, sourceCurrency, displayCurrency }: PriceTextProps) {
  const { currency } = useSitePreferences();
  const exchangeRates = useExchangeRates();
  const targetCurrency = displayCurrency ?? currency;

  return (
    <>
      {formatPrice(amount, targetCurrency, {
        sourceCurrency: sourceCurrency ?? targetCurrency,
        exchangeRates: exchangeRates.rates,
      })}
    </>
  );
}
