"use client";

import { createContext, type ReactNode } from "react";

import {
  DEFAULT_EXCHANGE_RATE_SNAPSHOT,
  type ExchangeRateSnapshot,
} from "@/lib/exchange-rates-shared";
import {
  DEFAULT_SITE_PREFERENCES_SNAPSHOT,
  type SitePreferencesSnapshot,
} from "@/lib/site-preferences";

export const SitePreferencesInitialSnapshotContext = createContext<SitePreferencesSnapshot>(
  DEFAULT_SITE_PREFERENCES_SNAPSHOT,
);

export const ExchangeRatesSnapshotContext = createContext<ExchangeRateSnapshot>(
  DEFAULT_EXCHANGE_RATE_SNAPSHOT,
);

type SitePreferencesProviderProps = {
  initialPreferences: SitePreferencesSnapshot;
  initialExchangeRates: ExchangeRateSnapshot;
  children: ReactNode;
};

export function SitePreferencesProvider({
  initialPreferences,
  initialExchangeRates,
  children,
}: SitePreferencesProviderProps) {
  return (
    <ExchangeRatesSnapshotContext.Provider value={initialExchangeRates}>
      <SitePreferencesInitialSnapshotContext.Provider value={initialPreferences}>
        {children}
      </SitePreferencesInitialSnapshotContext.Provider>
    </ExchangeRatesSnapshotContext.Provider>
  );
}
