"use client";

import { startTransition, useRef } from "react";
import { useRouter } from "next/navigation";

import { useSitePreferences } from "@/components/use-site-preferences";
import { headerCopy, type SiteCurrency, type SiteLanguage } from "@/lib/site-preferences";

const languageOptions = [
  { code: "TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "RU", label: "Русский", flag: "🇷🇺" },
  { code: "AR", label: "العربية", flag: "🇸🇦" },
];

const currencyOptions = [
  { code: "TRY", symbol: "₺", label: "Türk Lirası" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
];

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeaderMarketControls() {
  return <HeaderMarketControlsInner />;
}

type HeaderMarketControlsProps = {
  className?: string;
  menuAlign?: "left" | "right";
};

export function HeaderMarketControlsInner({
  className = "",
  menuAlign = "left",
}: HeaderMarketControlsProps = {}) {
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDetailsElement>(null);
  const currencyMenuRef = useRef<HTMLDetailsElement>(null);
  const { language, currency, setLanguage, setCurrency } = useSitePreferences();
  const copy = headerCopy(language);

  const activeLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0];
  const activeCurrency = currencyOptions.find((option) => option.code === currency) ?? currencyOptions[0];

  function chooseLanguage(code: SiteLanguage) {
    if (code === language) {
      languageMenuRef.current?.removeAttribute("open");
      return;
    }

    setLanguage(code);
    languageMenuRef.current?.removeAttribute("open");
    startTransition(() => {
      router.refresh();
    });
  }

  function chooseCurrency(code: SiteCurrency) {
    if (code === currency) {
      currencyMenuRef.current?.removeAttribute("open");
      return;
    }

    setCurrency(code);
    currencyMenuRef.current?.removeAttribute("open");
  }

  return (
    <div className={`flex items-center gap-2 text-[11px] text-[var(--brand-primary)] ${className}`}>
      <details ref={languageMenuRef} className="relative">
        <summary
          className="flex h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-3 text-[var(--brand-primary)] shadow-[0_18px_36px_-30px_rgba(22,32,48,0.34)] transition hover:border-[var(--brand-accent)] [&::-webkit-details-marker]:hidden"
          aria-label={`${copy.language}: ${activeLanguage.label}`}
          title={`${copy.language}: ${activeLanguage.label}`}
        >
          <span className="text-lg" aria-hidden>
            {activeLanguage.flag}
          </span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:inline">
            {activeLanguage.code}
          </span>
          <ChevronIcon />
        </summary>

        <div className={`absolute top-[calc(100%+0.75rem)] z-30 w-48 overflow-hidden rounded-[1.2rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_28px_54px_-32px_rgba(16,23,34,0.34)] backdrop-blur ${menuAlign === "right" ? "right-0" : "left-0"}`}>
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => chooseLanguage(option.code as SiteLanguage)}
              className={`flex w-full items-center justify-between rounded-[0.9rem] px-3 py-3 text-left text-sm font-semibold transition ${
                language === option.code
                  ? "bg-[rgba(29,56,92,0.08)] text-[var(--brand-primary)]"
                  : "text-[var(--ink-700)] hover:bg-[rgba(29,56,92,0.05)]"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-lg" aria-hidden>
                  {option.flag}
                </span>
                {option.label}
              </span>
              {language === option.code ? (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--brand-accent-strong)]">
                  {option.code}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </details>

      <details ref={currencyMenuRef} className="relative">
        <summary
          className="flex h-11 min-w-11 cursor-pointer list-none items-center justify-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-3 text-[var(--brand-primary)] shadow-[0_18px_36px_-30px_rgba(22,32,48,0.34)] transition hover:border-[var(--brand-accent)] [&::-webkit-details-marker]:hidden"
          aria-label={`${copy.currency}: ${activeCurrency.code}`}
          title={`${copy.currency}: ${activeCurrency.code}`}
        >
          <span className="text-base font-semibold">{activeCurrency.symbol}</span>
          <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] sm:inline">
            {activeCurrency.code}
          </span>
          <ChevronIcon />
        </summary>

        <div className={`absolute top-[calc(100%+0.75rem)] z-30 w-44 overflow-hidden rounded-[1.2rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_28px_54px_-32px_rgba(16,23,34,0.34)] backdrop-blur ${menuAlign === "right" ? "right-0" : "left-0"}`}>
          {currencyOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => chooseCurrency(option.code as SiteCurrency)}
              className={`flex w-full items-center justify-between rounded-[0.9rem] px-3 py-3 text-left text-sm font-semibold transition ${
                currency === option.code
                  ? "bg-[rgba(29,56,92,0.08)] text-[var(--brand-primary)]"
                  : "text-[var(--ink-700)] hover:bg-[rgba(29,56,92,0.05)]"
              }`}
            >
              <span className="flex items-center gap-3">
                <span className="text-base font-semibold">{option.symbol}</span>
                {option.label}
              </span>
              {currency === option.code ? (
                <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--brand-accent-strong)]">
                  {option.code}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
}
