import { PROPERTY_CONTENT_LANGUAGES } from "@/lib/property-content";
import type { PropertyTranslations } from "@/lib/types";

type PropertyTranslationFieldsProps = {
  defaultTitle?: string;
  defaultDescription?: string;
  defaultHighlights?: string[];
  defaultFeatures?: string[];
  defaultTranslations?: PropertyTranslations;
};

const contentLanguages = [
  { code: "TR", label: "Türkçe", note: "Ana içerik", required: true },
  ...PROPERTY_CONTENT_LANGUAGES.map((language) => ({
    code: language.code,
    label: language.label,
    note: "Opsiyonel çeviri",
    required: false,
  })),
] as const;

export function PropertyTranslationFields({
  defaultTitle,
  defaultDescription,
  defaultHighlights,
  defaultFeatures,
  defaultTranslations,
}: PropertyTranslationFieldsProps) {
  return (
    <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Dil İçerikleri</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Portföy içeriğini 4 dilde girin</h3>
        <p className="mt-1 text-sm text-slate-600">
          Türkçe ana içerik olarak kullanılır. İngilizce, Rusça ve Arapça alanlarını doldurduğunuzda kullanıcı
          seçtiği dilde başlık, açıklama ve maddeleri görür; boş bırakırsanız sistem Türkçe içeriği gösterir.
        </p>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {contentLanguages.map((language) => {
          const isBaseLanguage = language.code === "TR";
          const translation = !isBaseLanguage ? defaultTranslations?.[language.code] : undefined;
          const titleName = isBaseLanguage ? "title" : `translationTitle_${language.code}`;
          const descriptionName = isBaseLanguage ? "description" : `translationDescription_${language.code}`;
          const highlightsName = isBaseLanguage ? "highlights" : `translationHighlights_${language.code}`;
          const featuresName = isBaseLanguage ? "features" : `translationFeatures_${language.code}`;
          const defaultTitleValue = isBaseLanguage ? defaultTitle ?? "" : translation?.title ?? "";
          const defaultDescriptionValue = isBaseLanguage ? defaultDescription ?? "" : translation?.description ?? "";
          const defaultHighlightsValue = isBaseLanguage
            ? defaultHighlights?.join(", ") ?? ""
            : translation?.highlights?.join(", ") ?? "";
          const defaultFeaturesValue = isBaseLanguage
            ? defaultFeatures?.join(", ") ?? ""
            : translation?.features?.join(", ") ?? "";

          return (
            <article
              key={language.code}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {language.label}
                    <span className="ml-2 text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
                      {language.code}
                    </span>
                  </p>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                      language.required
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {language.note}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 px-4 py-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Başlık
                  </span>
                  <input
                    name={titleName}
                    defaultValue={defaultTitleValue}
                    required={language.required}
                    placeholder={`${language.label} başlık`}
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Açıklama
                  </span>
                  <textarea
                    name={descriptionName}
                    defaultValue={defaultDescriptionValue}
                    required={language.required}
                    rows={4}
                    placeholder={`${language.label} açıklama`}
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Öne Çıkanlar
                  </span>
                  <input
                    name={highlightsName}
                    defaultValue={defaultHighlightsValue}
                    required={language.required}
                    placeholder={`${language.label} öne çıkanlar (virgülle)`}
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Özellikler
                  </span>
                  <input
                    name={featuresName}
                    defaultValue={defaultFeaturesValue}
                    required={language.required}
                    placeholder={`${language.label} özellikler (virgülle)`}
                    className="input"
                  />
                </label>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
