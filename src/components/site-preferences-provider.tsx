"use client";

import { createContext, type ReactNode } from "react";

import {
  DEFAULT_SITE_PREFERENCES_SNAPSHOT,
  type SitePreferencesSnapshot,
} from "@/lib/site-preferences";

export const SitePreferencesInitialSnapshotContext = createContext<SitePreferencesSnapshot>(
  DEFAULT_SITE_PREFERENCES_SNAPSHOT,
);

type SitePreferencesProviderProps = {
  initialPreferences: SitePreferencesSnapshot;
  children: ReactNode;
};

export function SitePreferencesProvider({
  initialPreferences,
  children,
}: SitePreferencesProviderProps) {
  return (
    <SitePreferencesInitialSnapshotContext.Provider value={initialPreferences}>
      {children}
    </SitePreferencesInitialSnapshotContext.Provider>
  );
}
