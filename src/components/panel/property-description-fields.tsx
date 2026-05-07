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
  defaultTitle?: string;
  defaultDescription?: string;
  defaultTranslations?: PropertyTranslations;
};

export function PropertyDescriptionFields({
  defaultTitle,
  defaultDescription,
  defaultTranslations,
}: PropertyDescriptionFieldsProps) {
  const [activeLanguage, setActiveLanguage] = useState<DescriptionLanguageCode>("TR");

  const languageMap = useMemo(
    () =>
      new Map(
        DESCRIPTION_LANGUAGES.map((language) => [
          language.code,
          {
            title:
              language.code === "TR"
                ? defaultTitle ?? ""
                : defaultTranslations?.[language.code]?.title ?? "",
            description:
              language.code === "TR"
                ? defaultDescription ?? ""
                : defaultTranslations?.[language.code]?.description ?? "",
          },
        ]),
      ),
    [defaultDescription, defaultTitle, defaultTranslations],
  );

  return (
    <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Açıklama Dilleri</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Başlık ve açıklamayı 3 dilde girin</h3>
        <p className="mt-1 text-sm text-slate-600">
          İngilizce ve Rusça alanları tamamen manuel girilir; sistem otomatik çeviri üretmez. Boş kalan ek dil
          alanlarında kullanıcıya Türkçe içerik gösterilmeye devam edilir.
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
          const titleName = language.code === "TR" ? "title" : `translationTitle_${language.code}`;
          const textareaName = language.code === "TR" ? "description" : `translationDescription_${language.code}`;
          const value = languageMap.get(language.code) ?? { title: "", description: "" };

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

              <label className="mb-4 block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Başlık
                </span>
                <input
                  name={titleName}
                  defaultValue={value.title}
                  required={language.code === "TR"}
                  placeholder={`${language.label} başlık`}
                  className="input"
                />
              </label>

              <textarea
                name={textareaName}
                defaultValue={value.description}
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
