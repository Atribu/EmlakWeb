"use client";

import { useContext } from "react";

import { ExchangeRatesSnapshotContext } from "@/components/site-preferences-provider";

export function useExchangeRates() {
  return useContext(ExchangeRatesSnapshotContext);
}
