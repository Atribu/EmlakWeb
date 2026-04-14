"use client";

import { useMemo, useState } from "react";

import type { PropertyTranslations } from "@/lib/types";

const DESCRIPTION_LANGUAGES = [
  { code: "TR", label: "Türkçe", note: "Ana açıklama" },
  { code: "EN", label: "English", note: "Ek dil" },
  { code: "RU", label: "Русский", note: "Ek dil" },
] as const;

type DescriptionLanguageCode = (typeof DESCRIPTION_LANGUAGES)[number]["code"];

type PropertyDescriptionFieldsProps = {
  defaultDescription?: string;
  defaultTranslations?: PropertyTranslations;
};

export function PropertyDescriptionFields({
  defaultDescription,
  defaultTranslations,
}: PropertyDescriptionFieldsProps) {
  const [activeLanguage, setActiveLanguage] = useState<DescriptionLanguageCode>("TR");

  const languageMap = useMemo(
    () =>
      new Map(
        DESCRIPTION_LANGUAGES.map((language) => [
          language.code,
          language.code === "TR"
            ? defaultDescription ?? ""
            : defaultTranslations?.[language.code]?.description ?? "",
        ]),
      ),
    [defaultDescription, defaultTranslations],
  );

  return (
    <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Açıklama Dilleri</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Açıklamayı sekmeli olarak girin</h3>
        <p className="mt-1 text-sm text-slate-600">
          Ortak bilgiler tek alanda kalır. Açıklama için Türkçe ana metne ek olarak İngilizce ve Rusça versiyon
          girebilirsiniz.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {DESCRIPTION_LANGUAGES.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => setActiveLanguage(language.code)}
            className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${
              activeLanguage === language.code
                ? "bg-slate-900 text-white"
                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
            }`}
          >
            {language.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-white p-4">
        {DESCRIPTION_LANGUAGES.map((language) => {
          const isActive = activeLanguage === language.code;
          const textareaName = language.code === "TR" ? "description" : `translationDescription_${language.code}`;
          const value = languageMap.get(language.code) ?? "";

          return (
            <div key={language.code} className={isActive ? "block" : "hidden"}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{language.label}</p>
                  <p className="text-xs text-slate-500">{language.note}</p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                    language.code === "TR" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {language.code}
                </span>
              </div>

              <textarea
                name={textareaName}
                defaultValue={value}
                required={language.code === "TR"}
                rows={7}
                placeholder={`${language.label} açıklama`}
                className="input min-h-[180px]"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
