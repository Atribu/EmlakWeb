"use client";

import { startTransition } from "react";
import { useRouter } from "next/navigation";

import { headerCopy, type SiteCurrency, type SiteLanguage } from "@/lib/site-preferences";

import { useSitePreferences } from "@/components/use-site-preferences";

const languageOptions = [
  { code: "TR", label: "Türkçe", flag: "🇹🇷" },
  { code: "EN", label: "English", flag: "🇬🇧" },
  { code: "RU", label: "Русский", flag: "🇷🇺" },
  { code: "AR", label: "العربية", flag: "🇸🇦" },
];

const currencyOptions = [
  { code: "TRY", symbol: "₺" },
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
];

export function HeaderMarketControls() {
  const router = useRouter();
  const { language, currency, setLanguage, setCurrency } = useSitePreferences();
  const copy = headerCopy(language);

  function chooseLanguage(code: SiteLanguage) {
    if (code === language) {
      return;
    }

    setLanguage(code);
    startTransition(() => {
      router.refresh();
    });
  }

  function chooseCurrency(code: SiteCurrency) {
    if (code === currency) {
      return;
    }

    setCurrency(code);
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#e8dcc8]">
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 backdrop-blur">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cfb27f]">{copy.language}</span>
        <div className="flex items-center gap-1">
          {languageOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => chooseLanguage(option.code as SiteLanguage)}
              className={`rounded-full px-2 py-1 transition ${
                language === option.code
                  ? "bg-[#e0bd86] text-[#1f1912]"
                  : "text-[#e8dcc8] hover:bg-white/8"
              }`}
              title={option.label}
              aria-pressed={language === option.code}
            >
              <span aria-hidden>{option.flag}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 backdrop-blur">
        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#cfb27f]">{copy.currency}</span>
        <div className="flex items-center gap-1">
          {currencyOptions.map((option) => (
            <button
              key={option.code}
              type="button"
              onClick={() => chooseCurrency(option.code as SiteCurrency)}
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                currency === option.code
                  ? "bg-[#e0bd86] text-[#1f1912]"
                  : "text-[#e8dcc8] hover:bg-white/8"
              }`}
              aria-pressed={currency === option.code}
            >
              {option.symbol} {option.code}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
