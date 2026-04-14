"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState, type FormEvent } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { translatePropertyType } from "@/lib/site-copy";
import type { SiteLanguage } from "@/lib/site-preferences";
import type { PropertyType } from "@/lib/types";

type QuickLink = {
  label: string;
  href: string;
};

type HomeQuickSearchProps = {
  cities: string[];
  types: string[];
  quickLinks: QuickLink[];
};

type SearchCopy = {
  eyebrow: string;
  title: string;
  body: string;
  keywordLabel: string;
  keywordPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  typeLabel: string;
  typePlaceholder: string;
  minPriceLabel: string;
  minPricePlaceholder: string;
  maxPriceLabel: string;
  maxPricePlaceholder: string;
  quickLinksLabel: string;
  submit: string;
};

const searchCopy: Record<SiteLanguage, SearchCopy> = {
  TR: {
    eyebrow: "Hızlı Arama",
    title: "Tek dokunuşta doğru portföye gidin",
    body: "Mobilde rahat kullanılacak büyük alanlarla lokasyon, tip ve fiyat aralığını seçip direkt sonuç sayfasına geçin.",
    keywordLabel: "Anahtar Kelime",
    keywordPlaceholder: "Şehir, bölge veya ilan adı",
    cityLabel: "Lokasyon",
    cityPlaceholder: "Şehir seçin",
    typeLabel: "Emlak Tipi",
    typePlaceholder: "Tüm tipler",
    minPriceLabel: "Min. Fiyat",
    minPricePlaceholder: "Alt sınır",
    maxPriceLabel: "Maks. Fiyat",
    maxPricePlaceholder: "Üst sınır",
    quickLinksLabel: "Hızlı rotalar",
    submit: "Portföyleri Ara",
  },
  EN: {
    eyebrow: "Quick Search",
    title: "Reach the right listing in one move",
    body: "Use large touch-friendly fields to choose location, type, and budget, then jump straight to the results page.",
    keywordLabel: "Keyword",
    keywordPlaceholder: "City, district, or listing name",
    cityLabel: "Location",
    cityPlaceholder: "Choose a city",
    typeLabel: "Property Type",
    typePlaceholder: "All types",
    minPriceLabel: "Min Price",
    minPricePlaceholder: "Minimum",
    maxPriceLabel: "Max Price",
    maxPricePlaceholder: "Maximum",
    quickLinksLabel: "Quick routes",
    submit: "Search Listings",
  },
  RU: {
    eyebrow: "Быстрый поиск",
    title: "Найдите нужный объект в одно действие",
    body: "Крупные поля удобны для мобильного использования: выберите локацию, тип и бюджет и сразу перейдите к результатам.",
    keywordLabel: "Ключевое слово",
    keywordPlaceholder: "Город, район или название объекта",
    cityLabel: "Локация",
    cityPlaceholder: "Выберите город",
    typeLabel: "Тип недвижимости",
    typePlaceholder: "Все типы",
    minPriceLabel: "Мин. цена",
    minPricePlaceholder: "Нижняя граница",
    maxPriceLabel: "Макс. цена",
    maxPricePlaceholder: "Верхняя граница",
    quickLinksLabel: "Быстрые маршруты",
    submit: "Искать объекты",
  },
  AR: {
    eyebrow: "بحث سريع",
    title: "الوصول إلى العقار المناسب بخطوة واحدة",
    body: "حقول كبيرة ومريحة للموبايل لاختيار الموقع ونوع العقار والميزانية ثم الانتقال مباشرة إلى النتائج.",
    keywordLabel: "كلمة مفتاحية",
    keywordPlaceholder: "المدينة أو المنطقة أو اسم العقار",
    cityLabel: "الموقع",
    cityPlaceholder: "اختر مدينة",
    typeLabel: "نوع العقار",
    typePlaceholder: "كل الأنواع",
    minPriceLabel: "أقل سعر",
    minPricePlaceholder: "الحد الأدنى",
    maxPriceLabel: "أعلى سعر",
    maxPricePlaceholder: "الحد الأعلى",
    quickLinksLabel: "مسارات سريعة",
    submit: "ابحث عن العقارات",
  },
};

type SearchState = {
  query: string;
  city: string;
  type: string;
  minPrice: string;
  maxPrice: string;
};

const initialState: SearchState = {
  query: "",
  city: "",
  type: "",
  minPrice: "",
  maxPrice: "",
};

export function HomeQuickSearch({ cities, types, quickLinks }: HomeQuickSearchProps) {
  const router = useRouter();
  const { language } = useSitePreferences();
  const copy = searchCopy[language];
  const [form, setForm] = useState<SearchState>(initialState);

  function updateField<K extends keyof SearchState>(key: K, value: SearchState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const params = new URLSearchParams();

    if (form.query.trim()) {
      params.set("q", form.query.trim());
    }

    if (form.city.trim()) {
      params.set("city", form.city.trim());
    }

    if (form.type.trim()) {
      params.set("type", form.type.trim());
    }

    if (form.minPrice.trim()) {
      params.set("minPrice", form.minPrice.trim());
    }

    if (form.maxPrice.trim()) {
      params.set("maxPrice", form.maxPrice.trim());
    }

    const queryString = params.toString();
    const href = queryString ? `/portfoyler?${queryString}` : "/portfoyler";

    startTransition(() => {
      router.push(href);
    });
  }

  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-[var(--line-strong)] bg-[rgba(255,253,249,0.98)] p-4 shadow-[0_28px_58px_-42px_rgba(18,24,36,0.28)] backdrop-blur xl:px-6 xl:py-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(29,56,92,0.08),transparent_32%),radial-gradient(circle_at_left_top,rgba(201,124,78,0.08),transparent_28%)]" />

      <div className="relative flex flex-col gap-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full bg-[rgba(29,56,92,0.08)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-primary)]">
                {copy.eyebrow}
              </span>
              <p className="text-sm leading-6 text-[var(--ink-600)]">
                {copy.body}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {quickLinks.slice(0, 4).map((item) => (
              <Link
                key={`${item.href}-${item.label}`}
                href={item.href}
                className="inline-flex min-h-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--brand-primary)] transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:bg-[rgba(255,245,235,0.9)]"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3 xl:grid-cols-[minmax(0,1.25fr)_repeat(2,minmax(0,0.82fr))_repeat(2,minmax(0,0.72fr))_auto]">
          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.keywordLabel}
            </span>
            <input
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
              placeholder={copy.keywordPlaceholder}
              className="input min-h-14 px-4 text-base"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.cityLabel}
            </span>
            <select
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              className="input min-h-14 px-4 text-base"
            >
              <option value="">{copy.cityPlaceholder}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.typeLabel}
            </span>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className="input min-h-14 px-4 text-base"
            >
              <option value="">{copy.typePlaceholder}</option>
              {types.map((type) => (
                <option key={type} value={type}>
                  {translatePropertyType(type as PropertyType, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.minPriceLabel}
            </span>
            <input
              value={form.minPrice}
              onChange={(event) => updateField("minPrice", event.target.value)}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={copy.minPricePlaceholder}
              className="input min-h-14 px-4 text-base"
            />
          </label>

          <label className="flex flex-col gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.maxPriceLabel}
            </span>
            <input
              value={form.maxPrice}
              onChange={(event) => updateField("maxPrice", event.target.value)}
              type="number"
              min={0}
              inputMode="numeric"
              placeholder={copy.maxPricePlaceholder}
              className="input min-h-14 px-4 text-base"
            />
          </label>

          <button
            type="submit"
            className="btn-gold mt-auto inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.1rem] px-6 text-base font-semibold shadow-[0_22px_36px_-24px_rgba(192,118,68,0.55)] transition hover:-translate-y-0.5"
          >
            <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
              <circle cx="8.75" cy="8.75" r="4.75" stroke="currentColor" strokeWidth="1.8" />
              <path d="m12.5 12.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
              {copy.submit}
          </button>
        </form>
      </div>
    </section>
  );
}
