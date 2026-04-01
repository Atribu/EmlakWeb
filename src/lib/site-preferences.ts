export type SiteLanguage = "TR" | "EN" | "RU" | "AR";
export type SiteCurrency = "TRY" | "USD" | "EUR";

export type SitePreferencesSnapshot = {
  language: SiteLanguage;
  currency: SiteCurrency;
};

export const DEFAULT_SITE_LANGUAGE: SiteLanguage = "TR";
export const DEFAULT_SITE_CURRENCY: SiteCurrency = "TRY";

export const SITE_LANGUAGE_STORAGE_KEY = "portfolio-language";
export const SITE_CURRENCY_STORAGE_KEY = "portfolio-currency";
export const SITE_LANGUAGE_COOKIE_KEY = SITE_LANGUAGE_STORAGE_KEY;
export const SITE_CURRENCY_COOKIE_KEY = SITE_CURRENCY_STORAGE_KEY;
export const SITE_PREFERENCES_EVENT = "portfolio-preferences-change";

export const DEFAULT_SITE_PREFERENCES_SNAPSHOT: SitePreferencesSnapshot = {
  language: DEFAULT_SITE_LANGUAGE,
  currency: DEFAULT_SITE_CURRENCY,
};

const currencyRates: Record<SiteCurrency, number> = {
  TRY: 1,
  USD: 0.031,
  EUR: 0.029,
};

const currencyLocales: Record<SiteCurrency, string> = {
  TRY: "tr-TR",
  USD: "en-US",
  EUR: "de-DE",
};

const languageLocales: Record<SiteLanguage, string> = {
  TR: "tr-TR",
  EN: "en-GB",
  RU: "ru-RU",
  AR: "ar-SA",
};

const htmlLanguageCodes: Record<SiteLanguage, string> = {
  TR: "tr",
  EN: "en",
  RU: "ru",
  AR: "ar",
};

export function normalizeSiteLanguage(value: string | null | undefined): SiteLanguage {
  if (value === "EN" || value === "RU" || value === "AR") {
    return value;
  }

  return DEFAULT_SITE_LANGUAGE;
}

export function normalizeSiteCurrency(value: string | null | undefined): SiteCurrency {
  if (value === "USD" || value === "EUR") {
    return value;
  }

  return DEFAULT_SITE_CURRENCY;
}

export function createSitePreferencesSnapshot(
  language: string | null | undefined,
  currency: string | null | undefined,
): SitePreferencesSnapshot {
  return {
    language: normalizeSiteLanguage(language),
    currency: normalizeSiteCurrency(currency),
  };
}

function readCookieValue(cookieHeader: string | null | undefined, key: string): string | undefined {
  if (!cookieHeader) {
    return undefined;
  }

  const segments = cookieHeader.split(";");

  for (const segment of segments) {
    const [name, ...rest] = segment.trim().split("=");
    if (name === key) {
      const rawValue = rest.join("=");
      return decodeURIComponent(rawValue);
    }
  }

  return undefined;
}

export function readSitePreferencesFromCookieHeader(cookieHeader: string | null | undefined): SitePreferencesSnapshot {
  return createSitePreferencesSnapshot(
    readCookieValue(cookieHeader, SITE_LANGUAGE_COOKIE_KEY),
    readCookieValue(cookieHeader, SITE_CURRENCY_COOKIE_KEY),
  );
}

export function convertPriceFromTry(value: number, currency: SiteCurrency): number {
  const rate = currencyRates[currency] ?? 1;
  return Math.round(value * rate);
}

export function localeForCurrency(currency: SiteCurrency): string {
  return currencyLocales[currency] ?? "tr-TR";
}

export function localeForLanguage(language: SiteLanguage): string {
  return languageLocales[language] ?? "tr-TR";
}

export function htmlLangForLanguage(language: SiteLanguage): string {
  return htmlLanguageCodes[language] ?? "tr";
}

type HeaderCopy = {
  language: string;
  currency: string;
  topMessage: string;
  authLogin: string;
  authShortLogin: string;
  authPanel: string;
  authManagement: string;
  authLogout: string;
  blog: string;
  contact: string;
};

const headerCopies: Record<SiteLanguage, HeaderCopy> = {
  TR: {
    language: "Dil",
    currency: "Para Birimi",
    topMessage: "Premium Portföyler • Doğru Danışman • Hızlı Geri Dönüş",
    authLogin: "Yetkili Girişi",
    authShortLogin: "Giriş",
    authPanel: "Panel",
    authManagement: "Yönetim",
    authLogout: "Çıkış",
    blog: "BLOG",
    contact: "İLETİŞİM",
  },
  EN: {
    language: "Language",
    currency: "Currency",
    topMessage: "Premium Listings • Right Advisor • Fast Response",
    authLogin: "Agency Login",
    authShortLogin: "Login",
    authPanel: "Panel",
    authManagement: "Dashboard",
    authLogout: "Logout",
    blog: "BLOG",
    contact: "CONTACT",
  },
  RU: {
    language: "Язык",
    currency: "Валюта",
    topMessage: "Премиальные объекты • Подходящий консультант • Быстрый ответ",
    authLogin: "Вход для агентов",
    authShortLogin: "Вход",
    authPanel: "Панель",
    authManagement: "Управление",
    authLogout: "Выход",
    blog: "БЛОГ",
    contact: "КОНТАКТЫ",
  },
  AR: {
    language: "اللغة",
    currency: "العملة",
    topMessage: "عقارات مميزة • المستشار المناسب • استجابة سريعة",
    authLogin: "دخول الوكلاء",
    authShortLogin: "دخول",
    authPanel: "لوحة",
    authManagement: "الإدارة",
    authLogout: "خروج",
    blog: "المدونة",
    contact: "اتصل",
  },
};

type DockCopy = {
  instagram: string;
  telegram: string;
  quickMessage: string;
  whatsapp: string;
  assistantTitle: string;
  assistantIntro: string;
  assistantBody: string;
  assistantQuickLinks: string;
  close: string;
  sellTitle: string;
  sellText: string;
  advisorTitle: string;
  advisorText: string;
  listingsTitle: string;
  listingsText: string;
  whatsappPrefill: string;
};

const dockCopies: Record<SiteLanguage, DockCopy> = {
  TR: {
    instagram: "Instagram",
    telegram: "Telegram",
    quickMessage: "Hızlı Mesaj",
    whatsapp: "WhatsApp",
    assistantTitle: "Dijital Asistan",
    assistantIntro: "Hızlı Mesaj",
    assistantBody: "Size en doğru ekibe hızlı yönlendirme yapalım.",
    assistantQuickLinks: "Sık gelen talepler için hızlı yönlendirmeler hazırladık.",
    close: "Kapat",
    sellTitle: "Portföyümü Satmak İstiyorum",
    sellText: "Detaylı formu doldurup satış ekibine doğrudan talep bırak.",
    advisorTitle: "Danışmanla Eşleş",
    advisorText: "Talebini bırak, doğru ekip sana hızlıca dönüş yapsın.",
    listingsTitle: "İlanları İncele",
    listingsText: "Filtreli portföy sayfasına geçip detayları incele.",
    whatsappPrefill: "Merhaba, ilanlar ve premium portföyler hakkında hızlı bilgi almak istiyorum.",
  },
  EN: {
    instagram: "Instagram",
    telegram: "Telegram",
    quickMessage: "Quick Message",
    whatsapp: "WhatsApp",
    assistantTitle: "Digital Assistant",
    assistantIntro: "Quick Message",
    assistantBody: "Let us route you to the right team, fast.",
    assistantQuickLinks: "We prepared quick shortcuts for the most common requests.",
    close: "Close",
    sellTitle: "I Want To Sell My Property",
    sellText: "Fill in the form and send your request directly to the sales team.",
    advisorTitle: "Match Me With An Advisor",
    advisorText: "Leave your request and the right team will contact you quickly.",
    listingsTitle: "Browse Listings",
    listingsText: "Open the filtered portfolio page and review the details.",
    whatsappPrefill: "Hello, I would like quick information about the listings and premium portfolio collection.",
  },
  RU: {
    instagram: "Instagram",
    telegram: "Telegram",
    quickMessage: "Быстрое сообщение",
    whatsapp: "WhatsApp",
    assistantTitle: "Цифровой помощник",
    assistantIntro: "Быстрое сообщение",
    assistantBody: "Мы быстро направим вас к нужной команде.",
    assistantQuickLinks: "Мы подготовили быстрые сценарии для самых частых запросов.",
    close: "Закрыть",
    sellTitle: "Хочу продать объект",
    sellText: "Заполните форму и отправьте запрос напрямую отделу продаж.",
    advisorTitle: "Подобрать консультанта",
    advisorText: "Оставьте заявку, и нужная команда быстро свяжется с вами.",
    listingsTitle: "Смотреть объекты",
    listingsText: "Откройте страницу с фильтрами и изучите детали.",
    whatsappPrefill: "Здравствуйте, хочу быстро получить информацию об объектах и премиальной подборке недвижимости.",
  },
  AR: {
    instagram: "Instagram",
    telegram: "Telegram",
    quickMessage: "رسالة سريعة",
    whatsapp: "WhatsApp",
    assistantTitle: "مساعد رقمي",
    assistantIntro: "رسالة سريعة",
    assistantBody: "سنوصلك سريعًا إلى الفريق المناسب.",
    assistantQuickLinks: "أعددنا اختصارات سريعة لأكثر الطلبات شيوعًا.",
    close: "إغلاق",
    sellTitle: "أريد بيع عقاري",
    sellText: "املأ النموذج وأرسل طلبك مباشرة إلى فريق المبيعات.",
    advisorTitle: "اربطني بمستشار",
    advisorText: "اترك طلبك وسيعود إليك الفريق المناسب بسرعة.",
    listingsTitle: "استعرض العقارات",
    listingsText: "افتح صفحة العقارات المفلترة وراجع التفاصيل.",
    whatsappPrefill: "مرحبًا، أود الحصول على معلومات سريعة عن العقارات المعروضة ومجموعة العقارات المميزة.",
  },
};

export function headerCopy(language: SiteLanguage): HeaderCopy {
  return headerCopies[language] ?? headerCopies.TR;
}

export function dockCopy(language: SiteLanguage): DockCopy {
  return dockCopies[language] ?? dockCopies.TR;
}
