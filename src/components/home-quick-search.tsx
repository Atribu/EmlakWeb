"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState, type FormEvent } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { translatePropertyType } from "@/lib/site-copy";
import type { SiteLanguage } from "@/lib/site-preferences";
import type { PropertyType } from "@/lib/types";

type HomeQuickSearchProps = {
  cities: string[];
  types: string[];
  roomOptions: string[];
  variant?: "default" | "overlay" | "hero-bar";
};

type SearchCopy = {
  eyebrow: string;
  body: string;
  roomsLabel: string;
  roomsPlaceholder: string;
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
  moreFilters: string;
  fewerFilters: string;
  submit: string;
};

const searchCopy: Record<SiteLanguage, SearchCopy> = {
  TR: {
    eyebrow: "Hızlı Arama",
    body: "Mobilde rahat kullanılacak büyük alanlarla lokasyon, tip ve fiyat aralığını seçip direkt sonuç sayfasına geçin.",
    roomsLabel: "Oda Sayısı",
    roomsPlaceholder: "Tüm oda tipleri",
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
    moreFilters: "Daha Fazla Filtre",
    fewerFilters: "Filtreleri Gizle",
    submit: "Portföyleri Ara",
  },
  EN: {
    eyebrow: "Quick Search",
    body: "Use large touch-friendly fields to choose location, type, and budget, then jump straight to the results page.",
    roomsLabel: "Rooms",
    roomsPlaceholder: "All room types",
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
    moreFilters: "More Filters",
    fewerFilters: "Hide Filters",
    submit: "Search Listings",
  },
  RU: {
    eyebrow: "Быстрый поиск",
    body: "Крупные поля удобны для мобильного использования: выберите локацию, тип и бюджет и сразу перейдите к результатам.",
    roomsLabel: "Комнаты",
    roomsPlaceholder: "Все варианты",
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
    moreFilters: "Еще фильтры",
    fewerFilters: "Скрыть фильтры",
    submit: "Искать объекты",
  },
  AR: {
    eyebrow: "بحث سريع",
    body: "حقول كبيرة ومريحة للموبايل لاختيار الموقع ونوع العقار والميزانية ثم الانتقال مباشرة إلى النتائج.",
    roomsLabel: "عدد الغرف",
    roomsPlaceholder: "كل الخيارات",
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
    moreFilters: "فلاتر أكثر",
    fewerFilters: "إخفاء الفلاتر",
    submit: "ابحث عن العقارات",
  },
};

type SearchState = {
  query: string;
  city: string;
  type: string;
  rooms: string;
  minPrice: string;
  maxPrice: string;
};

const initialState: SearchState = {
  query: "",
  city: "",
  type: "",
  rooms: "",
  minPrice: "",
  maxPrice: "",
};

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <circle cx="8.75" cy="8.75" r="4.75" stroke="currentColor" strokeWidth="1.8" />
      <path d="m12.5 12.5 3.5 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M4.5 6.25h11M6.75 10h6.5M8.75 13.75h2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function HomeQuickSearch({
  cities,
  types,
  roomOptions,
  variant = "default",
}: HomeQuickSearchProps) {
  const router = useRouter();
  const { language } = useSitePreferences();
  const copy = searchCopy[language];
  const [form, setForm] = useState<SearchState>(initialState);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

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

    if (form.rooms.trim()) {
      params.set("rooms", form.rooms.trim());
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

  const isOverlay = variant === "overlay";
  const isHeroBar = variant === "hero-bar";

  if (isHeroBar) {
    return (
      <section className="relative overflow-hidden rounded-[1.35rem] border border-[#e5d7c1] bg-[rgba(255,255,255,0.96)] p-4 shadow-[0_28px_56px_-34px_rgba(18,24,36,0.22)] backdrop-blur sm:p-5">
        <form
          onSubmit={handleSubmit}
          className="grid gap-3 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.9fr)_minmax(0,1.08fr)_auto] lg:items-end"
        >
          <label className="flex flex-col gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.cityLabel}
            </span>
            <select
              value={form.city}
              onChange={(event) => updateField("city", event.target.value)}
              className="input min-h-[3.15rem] px-4 text-[14px]"
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.typeLabel}
            </span>
            <select
              value={form.type}
              onChange={(event) => updateField("type", event.target.value)}
              className="input min-h-[3.15rem] px-4 text-[14px]"
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
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.maxPriceLabel}
            </span>
            <div className="grid min-h-[3.15rem] grid-cols-2 gap-2 rounded-[1rem] border border-[var(--line-strong)] bg-white px-3 py-2">
              <input
                value={form.minPrice}
                onChange={(event) => updateField("minPrice", event.target.value)}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={copy.minPricePlaceholder}
                className="min-w-0 border-0 bg-transparent text-[14px] text-[var(--ink-900)] outline-none placeholder:text-[var(--ink-400)]"
              />
              <input
                value={form.maxPrice}
                onChange={(event) => updateField("maxPrice", event.target.value)}
                type="number"
                min={0}
                inputMode="numeric"
                placeholder={copy.maxPricePlaceholder}
                className="min-w-0 border-0 border-l border-[rgba(220,208,189,0.72)] bg-transparent pl-3 text-[14px] text-[var(--ink-900)] outline-none placeholder:text-[var(--ink-400)]"
              />
            </div>
          </label>

          <button
            type="submit"
            className="inline-flex min-h-[3.15rem] items-center justify-center gap-2 rounded-[1rem] bg-[var(--brand-primary)] px-6 text-[14px] font-semibold text-white shadow-[0_18px_28px_-20px_rgba(29,56,92,0.65)] transition hover:-translate-y-0.5"
          >
            <SearchIcon />
            {copy.submit}
          </button>
        </form>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={() => setShowAdvancedFilters((current) => !current)}
            className="inline-flex items-center gap-2 text-[12px] font-semibold text-[var(--brand-accent-strong)] transition hover:text-[var(--brand-primary)]"
            aria-expanded={showAdvancedFilters}
          >
            <FilterIcon />
            {showAdvancedFilters ? copy.fewerFilters : copy.moreFilters}
          </button>
        </div>

        {showAdvancedFilters ? (
          <div className="mt-3 grid gap-3 border-t border-[rgba(220,208,189,0.72)] pt-3 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
                {copy.keywordLabel}
              </span>
              <input
                value={form.query}
                onChange={(event) => updateField("query", event.target.value)}
                placeholder={copy.keywordPlaceholder}
                className="input min-h-[3.05rem] px-4 text-[14px]"
              />
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
                {copy.roomsLabel}
              </span>
              <select
                value={form.rooms}
                onChange={(event) => updateField("rooms", event.target.value)}
                className="input min-h-[3.05rem] px-4 text-[14px]"
              >
                <option value="">{copy.roomsPlaceholder}</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
      </section>
    );
  }

  const wrapperClassName = isOverlay
    ? "relative overflow-hidden rounded-[1.3rem] border border-white/18 bg-[rgba(255,250,244,0.8)] p-2.5 shadow-[0_28px_48px_-34px_rgba(8,14,22,0.48)] backdrop-blur-md sm:p-3 xl:px-4 xl:py-3"
    : "relative overflow-hidden rounded-[1.55rem] border border-[var(--line-strong)] bg-[rgba(255,253,249,0.98)] p-4 shadow-[0_24px_48px_-38px_rgba(18,24,36,0.24)] backdrop-blur sm:p-5 xl:px-6 xl:py-5";
  const overlayGlowClassName = isOverlay
    ? "absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(255,255,255,0.22),transparent_34%),radial-gradient(circle_at_left_top,rgba(201,124,78,0.12),transparent_28%)]"
    : "absolute inset-0 bg-[radial-gradient(circle_at_right_center,rgba(29,56,92,0.08),transparent_32%),radial-gradient(circle_at_left_top,rgba(201,124,78,0.08),transparent_28%)]";
  const inputClassName = isOverlay ? "input min-h-[2.75rem] px-3 text-[13px]" : "input min-h-14 px-4 text-base";
  const selectClassName = isOverlay ? "input min-h-[2.75rem] px-3 text-[13px]" : "input min-h-[3.25rem] px-4 text-[15px]";
  const actionButtonClassName = isOverlay
    ? "inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-[0.9rem] border border-[var(--line-strong)] bg-white px-3.5 text-[11px] font-semibold text-[var(--brand-primary)] transition hover:border-[var(--brand-accent)] hover:bg-[rgba(255,245,235,0.82)]"
    : "inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[1rem] border border-[var(--line-strong)] bg-white px-4 text-[13px] font-semibold text-[var(--brand-primary)] transition hover:border-[var(--brand-accent)] hover:bg-[rgba(255,245,235,0.82)]";
  const submitButtonClassName = isOverlay
    ? "btn-gold inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-[0.9rem] px-4 text-[13px] font-semibold shadow-[0_20px_34px_-24px_rgba(192,118,68,0.55)] transition hover:-translate-y-0.5"
    : "btn-gold inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-[1rem] px-6 text-[15px] font-semibold shadow-[0_22px_36px_-24px_rgba(192,118,68,0.55)] transition hover:-translate-y-0.5";

  return (
    <section className={wrapperClassName}>
      <div className={overlayGlowClassName} />

      <div className={`relative flex flex-col ${isOverlay ? "gap-3" : "gap-4"}`}>
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] ${
              isOverlay ? "bg-white/72 text-[var(--brand-primary)]" : "bg-[rgba(29,56,92,0.08)] text-[var(--brand-primary)]"
            }`}>
              {copy.eyebrow}
            </span>
            <p className={`text-[11px] leading-[1.15rem] sm:text-[12px] ${isOverlay ? "text-white/90" : "text-[var(--ink-600)]"}`}>
              {copy.body}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="flex flex-col gap-2">
            <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
              {copy.keywordLabel}
            </span>
            <input
              value={form.query}
              onChange={(event) => updateField("query", event.target.value)}
              placeholder={copy.keywordPlaceholder}
              className={inputClassName}
            />
          </label>

          <div className="grid gap-2.5 md:grid-cols-3 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
            <label className="flex flex-col gap-2">
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
                {copy.cityLabel}
              </span>
              <select
                value={form.city}
                onChange={(event) => updateField("city", event.target.value)}
                className={selectClassName}
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
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
                {copy.typeLabel}
              </span>
              <select
                value={form.type}
                onChange={(event) => updateField("type", event.target.value)}
                className={selectClassName}
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
              <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
                {copy.roomsLabel}
              </span>
              <select
                value={form.rooms}
                onChange={(event) => updateField("rooms", event.target.value)}
                className={selectClassName}
              >
                <option value="">{copy.roomsPlaceholder}</option>
                {roomOptions.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <button
              type="button"
              onClick={() => setShowAdvancedFilters((current) => !current)}
              className={actionButtonClassName}
              aria-expanded={showAdvancedFilters}
            >
              <FilterIcon />
              {showAdvancedFilters ? copy.fewerFilters : copy.moreFilters}
            </button>

            <button
              type="submit"
              className={submitButtonClassName}
            >
              <SearchIcon />
              {copy.submit}
            </button>
          </div>

          {showAdvancedFilters ? (
            <div className={`grid gap-3 rounded-[1.15rem] p-3 sm:grid-cols-2 ${
              isOverlay ? "border border-white/12 bg-white/12 backdrop-blur-sm" : "border border-[rgba(220,208,189,0.72)] bg-white/82"
            }`}>
              <label className="flex flex-col gap-2">
                <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
                  {copy.minPriceLabel}
                </span>
                <input
                  value={form.minPrice}
                  onChange={(event) => updateField("minPrice", event.target.value)}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={copy.minPricePlaceholder}
                  className={selectClassName}
                />
              </label>

              <label className="flex flex-col gap-2">
                <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${isOverlay ? "text-white/72" : "text-[var(--ink-500)]"}`}>
                  {copy.maxPriceLabel}
                </span>
                <input
                  value={form.maxPrice}
                  onChange={(event) => updateField("maxPrice", event.target.value)}
                  type="number"
                  min={0}
                  inputMode="numeric"
                  placeholder={copy.maxPricePlaceholder}
                  className={selectClassName}
                />
              </label>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
