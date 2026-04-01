import { cookies } from "next/headers";

import {
  createSitePreferencesSnapshot,
  htmlLangForLanguage,
  SITE_CURRENCY_COOKIE_KEY,
  SITE_LANGUAGE_COOKIE_KEY,
  type SiteLanguage,
  type SitePreferencesSnapshot,
} from "@/lib/site-preferences";

export async function getServerSitePreferences(): Promise<SitePreferencesSnapshot> {
  const cookieStore = await cookies();

  return createSitePreferencesSnapshot(
    cookieStore.get(SITE_LANGUAGE_COOKIE_KEY)?.value,
    cookieStore.get(SITE_CURRENCY_COOKIE_KEY)?.value,
  );
}

export async function getServerSiteLanguage(): Promise<SiteLanguage> {
  return (await getServerSitePreferences()).language;
}

export async function getServerHtmlLang(): Promise<string> {
  return htmlLangForLanguage(await getServerSiteLanguage());
}
