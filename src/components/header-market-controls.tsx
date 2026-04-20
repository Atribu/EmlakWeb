"use client";

import { startTransition, useEffect, useRef, useState } from "react";
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

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`} aria-hidden>
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
  variant?: "desktop-dropdown" | "mobile-dropdown";
};

export function HeaderMarketControlsInner({
  className = "",
  menuAlign = "left",
  variant = "desktop-dropdown",
}: HeaderMarketControlsProps = {}) {
  const router = useRouter();
  const languageMenuRef = useRef<HTMLDetailsElement>(null);
  const currencyMenuRef = useRef<HTMLDetailsElement>(null);
  const mobileRootRef = useRef<HTMLDivElement>(null);
  const { language, currency, setLanguage, setCurrency } = useSitePreferences();
  const copy = headerCopy(language);
  const [openMobileMenu, setOpenMobileMenu] = useState<"language" | "currency" | null>(null);

  const activeLanguage = languageOptions.find((option) => option.code === language) ?? languageOptions[0];
  const activeCurrency = currencyOptions.find((option) => option.code === currency) ?? currencyOptions[0];

  function chooseLanguage(code: SiteLanguage) {
    if (code === language) {
      languageMenuRef.current?.removeAttribute("open");
      setOpenMobileMenu(null);
      return;
    }

    setLanguage(code);
    languageMenuRef.current?.removeAttribute("open");
    setOpenMobileMenu(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function chooseCurrency(code: SiteCurrency) {
    if (code === currency) {
      currencyMenuRef.current?.removeAttribute("open");
      setOpenMobileMenu(null);
      return;
    }

    setCurrency(code);
    currencyMenuRef.current?.removeAttribute("open");
    setOpenMobileMenu(null);
  }

  useEffect(() => {
    if (variant !== "mobile-dropdown" || !openMobileMenu) {
      return;
    }

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      if (!(event.target instanceof Node)) {
        return;
      }

      if (!mobileRootRef.current?.contains(event.target)) {
        setOpenMobileMenu(null);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMobileMenu(null);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMobileMenu, variant]);

  if (variant === "mobile-dropdown") {
    return (
      <div ref={mobileRootRef} className={`grid grid-cols-2 gap-2 text-[11px] text-[var(--brand-primary)] ${className}`}>
        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMobileMenu((current) => (current === "language" ? null : "language"))}
            className="relative flex min-h-11 w-full items-center justify-center rounded-[0.95rem] border border-[var(--line-strong)] bg-white px-3 text-[13px] font-semibold text-[var(--brand-primary)] shadow-[0_14px_24px_-24px_rgba(22,32,48,0.28)]"
            aria-expanded={openMobileMenu === "language"}
            aria-label={`${copy.language}: ${activeLanguage.label}`}
            title={`${copy.language}: ${activeLanguage.label}`}
          >
            <span className="text-[1.25rem]" aria-hidden>
              {activeLanguage.flag}
            </span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-500)]">
              <ChevronIcon open={openMobileMenu === "language"} />
            </span>
          </button>

          {openMobileMenu === "language" ? (
            <div className="absolute left-0 top-[calc(100%+0.55rem)] z-40 w-[9.5rem] overflow-hidden rounded-[1rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_28px_54px_-32px_rgba(16,23,34,0.34)] backdrop-blur">
              <div className="grid grid-cols-2 gap-2">
                {languageOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseLanguage(option.code as SiteLanguage)}
                    className={`flex h-11 items-center justify-center rounded-[0.9rem] border text-lg transition ${
                      language === option.code
                        ? "border-[var(--brand-accent)] bg-[rgba(255,245,235,0.9)] text-[var(--brand-primary)]"
                        : "border-[var(--line-strong)] bg-white text-[var(--ink-700)] hover:bg-[rgba(29,56,92,0.05)]"
                    }`}
                    aria-label={option.label}
                    title={option.label}
                  >
                    <span aria-hidden>{option.flag}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMobileMenu((current) => (current === "currency" ? null : "currency"))}
            className="relative flex min-h-11 w-full items-center justify-center rounded-[0.95rem] border border-[var(--line-strong)] bg-white px-3 text-[13px] font-semibold text-[var(--brand-primary)] shadow-[0_14px_24px_-24px_rgba(22,32,48,0.28)]"
            aria-expanded={openMobileMenu === "currency"}
            aria-label={`${copy.currency}: ${activeCurrency.code}`}
            title={`${copy.currency}: ${activeCurrency.code}`}
          >
            <span className="text-[1.1rem] font-semibold">{activeCurrency.symbol}</span>
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-500)]">
              <ChevronIcon open={openMobileMenu === "currency"} />
            </span>
          </button>

          {openMobileMenu === "currency" ? (
            <div className="absolute right-0 top-[calc(100%+0.55rem)] z-30 w-[8.75rem] overflow-hidden rounded-[1rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] p-2 shadow-[0_28px_54px_-32px_rgba(16,23,34,0.34)] backdrop-blur">
              <div className="grid grid-cols-3 gap-2">
                {currencyOptions.map((option) => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => chooseCurrency(option.code as SiteCurrency)}
                    className={`flex h-11 items-center justify-center rounded-[0.9rem] border text-[1rem] font-semibold transition ${
                      currency === option.code
                        ? "border-[var(--brand-accent)] bg-[rgba(255,245,235,0.9)] text-[var(--brand-primary)]"
                        : "border-[var(--line-strong)] bg-white text-[var(--ink-700)] hover:bg-[rgba(29,56,92,0.05)]"
                    }`}
                    aria-label={option.label}
                    title={option.label}
                  >
                    <span>{option.symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    );
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
