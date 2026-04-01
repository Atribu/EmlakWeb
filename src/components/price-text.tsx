"use client";

import { formatPrice } from "@/lib/format";

import { useSitePreferences } from "@/components/use-site-preferences";

type PriceTextProps = {
  amount: number;
};

export function PriceText({ amount }: PriceTextProps) {
  const { currency } = useSitePreferences();
  return <>{formatPrice(amount, currency)}</>;
}
