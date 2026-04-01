import {
  convertPriceFromTry,
  DEFAULT_SITE_CURRENCY,
  DEFAULT_SITE_LANGUAGE,
  localeForCurrency,
  localeForLanguage,
  type SiteCurrency,
  type SiteLanguage,
} from "@/lib/site-preferences";

export function formatPrice(value: number, currency: SiteCurrency = DEFAULT_SITE_CURRENCY): string {
  const formatter = new Intl.NumberFormat(localeForCurrency(currency), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  });

  return formatter.format(convertPriceFromTry(value, currency));
}

export function formatPhoneForHref(value: string): string {
  return value.replace(/\s+/g, "").replace(/[()]/g, "");
}

export function roleLabel(role: string, language: SiteLanguage = DEFAULT_SITE_LANGUAGE): string {
  if (role === "portal_admin") return "Portal Admin";
  if (role === "admin") return "Admin";

  if (role === "portfolio_manager") {
    if (language === "EN") return "Portfolio Manager";
    if (language === "RU") return "Менеджер портфеля";
    if (language === "AR") return "مدير المحفظة";
    return "Portföy Yetkilisi";
  }

  if (role === "advisor") {
    if (language === "EN") return "Advisor";
    if (language === "RU") return "Консультант";
    if (language === "AR") return "مستشار";
    return "Danışman";
  }

  if (role === "editor") {
    if (language === "EN") return "Content Editor";
    if (language === "RU") return "Контент-редактор";
    if (language === "AR") return "محرر المحتوى";
    return "İçerik Yükleyici";
  }

  return role;
}

export function formatDate(value: string, language: SiteLanguage = DEFAULT_SITE_LANGUAGE): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(localeForLanguage(language), {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatDateTR(value: string): string {
  return formatDate(value, "TR");
}

export function leadStageLabel(stage: string): string {
  if (stage === "new") return "Yeni";
  if (stage === "called") return "Arandı";
  if (stage === "appointment_scheduled") return "Randevu";
  if (stage === "offer_submitted") return "Teklif";
  if (stage === "won") return "Kazanıldı";
  if (stage === "lost") return "Kaybedildi";
  return stage;
}

export function leadSourceLabel(source: string): string {
  if (source === "contact_form") return "İletişim Formu";
  if (source === "appointment_form") return "Randevu Formu";
  return source;
}
