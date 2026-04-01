"use client";

import { useContext, useSyncExternalStore } from "react";

import { SitePreferencesInitialSnapshotContext } from "@/components/site-preferences-provider";
import {
  DEFAULT_SITE_PREFERENCES_SNAPSHOT,
  normalizeSiteCurrency,
  normalizeSiteLanguage,
  SITE_CURRENCY_COOKIE_KEY,
  SITE_CURRENCY_STORAGE_KEY,
  SITE_LANGUAGE_COOKIE_KEY,
  SITE_LANGUAGE_STORAGE_KEY,
  SITE_PREFERENCES_EVENT,
  type SiteCurrency,
  type SiteLanguage,
  type SitePreferencesSnapshot,
} from "@/lib/site-preferences";

let cachedSnapshot = DEFAULT_SITE_PREFERENCES_SNAPSHOT;

function createSnapshot(language: SiteLanguage, currency: SiteCurrency): SitePreferencesSnapshot {
  if (cachedSnapshot.language === language && cachedSnapshot.currency === currency) {
    return cachedSnapshot;
  }

  cachedSnapshot = { language, currency };
  return cachedSnapshot;
}

function readCookieValue(key: string): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const segments = document.cookie.split(";");

  for (const segment of segments) {
    const [name, ...rest] = segment.trim().split("=");
    if (name === key) {
      return decodeURIComponent(rest.join("="));
    }
  }

  return undefined;
}

function readPreferences(): SitePreferencesSnapshot {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_PREFERENCES_SNAPSHOT;
  }

  return createSnapshot(
    normalizeSiteLanguage(
      readCookieValue(SITE_LANGUAGE_COOKIE_KEY) ??
        window.localStorage.getItem(SITE_LANGUAGE_STORAGE_KEY),
    ),
    normalizeSiteCurrency(
      readCookieValue(SITE_CURRENCY_COOKIE_KEY) ??
        window.localStorage.getItem(SITE_CURRENCY_STORAGE_KEY),
    ),
  );
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const onStorage = () => callback();
  window.addEventListener("storage", onStorage);
  window.addEventListener(SITE_PREFERENCES_EVENT, onStorage);

  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(SITE_PREFERENCES_EVENT, onStorage);
  };
}

function emitPreferenceChange() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(SITE_PREFERENCES_EVENT));
  }
}

function persistCookie(key: string, value: string) {
  if (typeof document === "undefined") {
    return;
  }

  document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; samesite=lax`;
}

export function useSitePreferences() {
  const initialSnapshot = useContext(SitePreferencesInitialSnapshotContext);
  const snapshot = useSyncExternalStore(
    subscribe,
    readPreferences,
    () => initialSnapshot,
  );

  function setLanguage(language: SiteLanguage) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SITE_LANGUAGE_STORAGE_KEY, language);
    persistCookie(SITE_LANGUAGE_COOKIE_KEY, language);
    emitPreferenceChange();
  }

  function setCurrency(currency: SiteCurrency) {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(SITE_CURRENCY_STORAGE_KEY, currency);
    persistCookie(SITE_CURRENCY_COOKIE_KEY, currency);
    emitPreferenceChange();
  }

  return {
    language: snapshot.language,
    currency: snapshot.currency,
    setLanguage,
    setCurrency,
  };
}
