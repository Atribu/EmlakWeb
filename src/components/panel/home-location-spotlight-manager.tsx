"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import {
  HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS,
  getHomeLocationSpotlightClassName,
} from "@/lib/home-location-spotlights";
import type {
  HomeLocationSpotlight,
  HomeLocationSpotlightLayout,
  HomeLocationSpotlightTranslations,
  PropertyPriceCurrency,
} from "@/lib/types";

type HomeLocationSpotlightManagerProps = {
  initialSpotlights: HomeLocationSpotlight[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

type TranslationFormFields = {
  title: string;
  subtitle: string;
  badge: string;
  blurb: string;
  statText: string;
};

type SpotlightFormState = {
  title: string;
  subtitle: string;
  badge: string;
  blurb: string;
  statText: string;
  href: string;
  image: string;
  priceAmount: string;
  priceCurrency: PropertyPriceCurrency;
  layoutVariant: HomeLocationSpotlightLayout;
  sortOrder: string;
  isActive: boolean;
  translations: Record<"EN" | "RU" | "AR", TranslationFormFields>;
};

const currencyOptions: PropertyPriceCurrency[] = ["TRY", "USD", "EUR", "GBP"];
const languageLabels: Record<"EN" | "RU" | "AR", string> = {
  EN: "İngilizce",
  RU: "Rusça",
  AR: "Arapça",
};

function createEmptyTranslationFields(): TranslationFormFields {
  return {
    title: "",
    subtitle: "",
    badge: "",
    blurb: "",
    statText: "",
  };
}

function createEmptyFormState(): SpotlightFormState {
  return {
    title: "",
    subtitle: "",
    badge: "",
    blurb: "",
    statText: "",
    href: "/portfoyler",
    image: "",
    priceAmount: "",
    priceCurrency: "TRY",
    layoutVariant: "wide",
    sortOrder: "0",
    isActive: true,
    translations: {
      EN: createEmptyTranslationFields(),
      RU: createEmptyTranslationFields(),
      AR: createEmptyTranslationFields(),
    },
  };
}

function spotlightToFormState(spotlight: HomeLocationSpotlight): SpotlightFormState {
  const formState = createEmptyFormState();

  for (const language of ["EN", "RU", "AR"] as const) {
    const translation = spotlight.translations?.[language];

    formState.translations[language] = {
      title: translation?.title ?? "",
      subtitle: translation?.subtitle ?? "",
      badge: translation?.badge ?? "",
      blurb: translation?.blurb ?? "",
      statText: translation?.statText ?? "",
    };
  }

  return {
    ...formState,
    title: spotlight.title,
    subtitle: spotlight.subtitle,
    badge: spotlight.badge,
    blurb: spotlight.blurb,
    statText: spotlight.statText ?? "",
    href: spotlight.href,
    image: spotlight.image,
    priceAmount: spotlight.priceAmount ? String(spotlight.priceAmount) : "",
    priceCurrency: spotlight.priceCurrency ?? "TRY",
    layoutVariant: spotlight.layoutVariant,
    sortOrder: String(spotlight.sortOrder),
    isActive: spotlight.isActive,
  };
}

function buildPayload(form: SpotlightFormState) {
  const translations: HomeLocationSpotlightTranslations = {};

  for (const language of ["EN", "RU", "AR"] as const) {
    translations[language] = {
      title: form.translations[language].title,
      subtitle: form.translations[language].subtitle,
      badge: form.translations[language].badge,
      blurb: form.translations[language].blurb,
      statText: form.translations[language].statText,
    };
  }

  return {
    title: form.title,
    subtitle: form.subtitle,
    badge: form.badge,
    blurb: form.blurb,
    statText: form.statText,
    href: form.href,
    image: form.image,
    priceAmount: form.priceAmount.trim() ? Number(form.priceAmount.trim().replace(",", ".")) : undefined,
    priceCurrency: form.priceCurrency,
    layoutVariant: form.layoutVariant,
    sortOrder: form.sortOrder.trim() ? Number(form.sortOrder) : 0,
    isActive: form.isActive,
    translations,
  };
}

function formatPrice(amount: number | undefined, currency: PropertyPriceCurrency | undefined) {
  if (!amount) {
    return "Fiyat gösterilmiyor";
  }

  return `${new Intl.NumberFormat("tr-TR").format(amount)} ${currency ?? "TRY"}`;
}

function layoutLabel(layoutVariant: HomeLocationSpotlightLayout) {
  return HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS.find((option) => option.value === layoutVariant)?.label ?? layoutVariant;
}

export function HomeLocationSpotlightManager({
  initialSpotlights,
  canManage,
}: HomeLocationSpotlightManagerProps) {
  const router = useRouter();
  const [spotlights, setSpotlights] = useState<HomeLocationSpotlight[]>(initialSpotlights);
  const [form, setForm] = useState<SpotlightFormState>(createEmptyFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [workingId, setWorkingId] = useState<string | null>(null);

  function resetForm() {
    setEditingId(null);
    setForm(createEmptyFormState());
  }

  function updateForm<K extends keyof SpotlightFormState>(key: K, value: SpotlightFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function updateTranslation(
    language: "EN" | "RU" | "AR",
    field: keyof TranslationFormFields,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      translations: {
        ...current.translations,
        [language]: {
          ...current.translations[language],
          [field]: value,
        },
      },
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canManage) {
      return;
    }

    const isEditing = Boolean(editingId);
    setStatus({ type: "loading" });

    const response = await fetch(
      isEditing ? `/api/home-location-spotlights/${editingId}` : "/api/home-location-spotlights",
      {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload(form)),
      },
    );

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({
        type: "error",
        message: payload?.message ?? "Popüler lokasyon kaydı kaydedilemedi.",
      });
      return;
    }

    const payload = (await response.json()) as { spotlight: HomeLocationSpotlight };
    setSpotlights((current) => {
      const nextItems = isEditing
        ? current.map((item) => (item.id === payload.spotlight.id ? payload.spotlight : item))
        : [payload.spotlight, ...current];

      return [...nextItems].sort((left, right) => {
        if (left.sortOrder !== right.sortOrder) {
          return left.sortOrder - right.sortOrder;
        }

        return right.createdAt.localeCompare(left.createdAt);
      });
    });
    setStatus({
      type: "success",
      message: isEditing
        ? `${payload.spotlight.title} güncellendi.`
        : `${payload.spotlight.title} popüler lokasyonlara eklendi.`,
    });
    resetForm();
    router.refresh();
  }

  function handleEdit(spotlight: HomeLocationSpotlight) {
    setEditingId(spotlight.id);
    setForm(spotlightToFormState(spotlight));
    setStatus({ type: "idle" });
  }

  async function handleDelete(spotlight: HomeLocationSpotlight) {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(`"${spotlight.title}" kaydını silmek istediğinize emin misiniz?`);

    if (!confirmed) {
      return;
    }

    setWorkingId(spotlight.id);

    const response = await fetch(`/api/home-location-spotlights/${spotlight.id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Popüler lokasyon kaydı silinemedi." });
      setWorkingId(null);
      return;
    }

    setSpotlights((current) => current.filter((item) => item.id !== spotlight.id));
    setStatus({ type: "success", message: `${spotlight.title} silindi.` });
    setWorkingId(null);

    if (editingId === spotlight.id) {
      resetForm();
    }

    router.refresh();
  }

  async function handleToggleActive(spotlight: HomeLocationSpotlight) {
    if (!canManage) {
      return;
    }

    setWorkingId(spotlight.id);

    const response = await fetch(`/api/home-location-spotlights/${spotlight.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...buildPayload(spotlightToFormState(spotlight)),
        isActive: !spotlight.isActive,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Yayın durumu güncellenemedi." });
      setWorkingId(null);
      return;
    }

    const payload = (await response.json()) as { spotlight: HomeLocationSpotlight };
    setSpotlights((current) =>
      current.map((item) => (item.id === payload.spotlight.id ? payload.spotlight : item)),
    );
    setStatus({
      type: "success",
      message: payload.spotlight.isActive
        ? `${payload.spotlight.title} anasayfada gösterilecek.`
        : `${payload.spotlight.title} anasayfadan gizlendi.`,
    });
    setWorkingId(null);
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <article className="admin-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="admin-kicker">Ana Sayfa Yönetimi</span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">
              Popüler Lokasyonlar
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Anasayfadaki büyük lokasyon kartlarını burada manuel olarak ekleyebilir, sıralayabilir,
              aktif/pasif yapabilir ve çok dilli metinlerini girebilirsiniz.
            </p>
          </div>

          <div className="admin-note min-w-[220px] px-4 py-3 text-sm text-slate-600">
            Toplam kayıt: <strong className="text-slate-900">{spotlights.length}</strong>
            <br />
            Yayında olan:{" "}
            <strong className="text-slate-900">
              {spotlights.filter((spotlight) => spotlight.isActive).length}
            </strong>
          </div>
        </div>

        {!canManage ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Bu alanı yönetmek için portföy düzenleme yetkisi gerekir.
          </p>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(18rem,0.8fr)]">
            <div className="admin-subsection space-y-4 p-4 sm:p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Başlık
                  </span>
                  <input
                    required
                    value={form.title}
                    onChange={(event) => updateForm("title", event.target.value)}
                    placeholder="Örn. Zekeriyaköy"
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Alt Başlık
                  </span>
                  <input
                    required
                    value={form.subtitle}
                    onChange={(event) => updateForm("subtitle", event.target.value)}
                    placeholder="Örn. İstanbul / Sarıyer"
                    className="input"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Rozet
                  </span>
                  <input
                    required
                    value={form.badge}
                    onChange={(event) => updateForm("badge", event.target.value)}
                    placeholder="Örn. Premium Seçki"
                    className="input"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Sağ Üst Etiket
                  </span>
                  <input
                    value={form.statText}
                    onChange={(event) => updateForm("statText", event.target.value)}
                    placeholder="Örn. 12 aktif portföy"
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Açıklama
                  </span>
                  <textarea
                    required
                    rows={4}
                    value={form.blurb}
                    onChange={(event) => updateForm("blurb", event.target.value)}
                    placeholder="Kart altında gösterilecek kısa açıklama"
                    className="input min-h-[8rem] resize-y"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Yönlenecek Link
                  </span>
                  <input
                    required
                    value={form.href}
                    onChange={(event) => updateForm("href", event.target.value)}
                    placeholder="/portfoyler?q=Sarıyer"
                    className="input"
                  />
                </label>

                <label className="md:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Görsel URL
                  </span>
                  <input
                    required
                    value={form.image}
                    onChange={(event) => updateForm("image", event.target.value)}
                    placeholder="https://... veya /uploads/..."
                    className="input"
                  />
                </label>
              </div>
            </div>

            <div className="admin-subsection space-y-4 p-4 sm:p-5">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Kart Yerleşimi
                </span>
                <select
                  value={form.layoutVariant}
                  onChange={(event) => updateForm("layoutVariant", event.target.value as HomeLocationSpotlightLayout)}
                  className="input"
                >
                  {HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-500">
                  {
                    HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS.find(
                      (option) => option.value === form.layoutVariant,
                    )?.description
                  }
                </p>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Başlangıç Fiyatı
                  </span>
                  <input
                    value={form.priceAmount}
                    onChange={(event) => updateForm("priceAmount", event.target.value)}
                    placeholder="Opsiyonel"
                    className="input"
                    inputMode="decimal"
                  />
                </label>

                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Para Birimi
                  </span>
                  <select
                    value={form.priceCurrency}
                    onChange={(event) => updateForm("priceCurrency", event.target.value as PropertyPriceCurrency)}
                    className="input"
                  >
                    {currencyOptions.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    Sıra
                  </span>
                  <input
                    value={form.sortOrder}
                    onChange={(event) => updateForm("sortOrder", event.target.value)}
                    placeholder="0"
                    className="input"
                    inputMode="numeric"
                  />
                </label>

                <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) => updateForm("isActive", event.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-900">Anasayfada göster</span>
                    <span className="block text-xs text-slate-500">Pasif olursa sadece panelde kalır</span>
                  </span>
                </label>
              </div>

              {form.image ? (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                  {/* Preview keeps image/link checks lightweight while editing */}
                  <div
                    className={`relative min-h-[11rem] bg-cover bg-center ${getHomeLocationSpotlightClassName(form.layoutVariant)}`}
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.12), rgba(15,23,42,0.82)), url(${form.image})` }}
                  >
                    <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80">
                        {form.subtitle || "Alt başlık"}
                      </p>
                      <p className="mt-2 text-xl font-semibold">{form.title || "Başlık"}</p>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="admin-subsection space-y-4 p-4 sm:p-5">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Diğer Diller</h3>
              <p className="mt-1 text-sm text-slate-600">
                İngilizce, Rusça ve Arapça alanları boş bırakırsanız Türkçe içerik kullanılır.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-3">
              {(["EN", "RU", "AR"] as const).map((language) => (
                <div key={language} className="rounded-2xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{languageLabels[language]}</p>
                  <div className="mt-4 space-y-3">
                    <input
                      value={form.translations[language].title}
                      onChange={(event) => updateTranslation(language, "title", event.target.value)}
                      placeholder="Başlık"
                      className="input"
                    />
                    <input
                      value={form.translations[language].subtitle}
                      onChange={(event) => updateTranslation(language, "subtitle", event.target.value)}
                      placeholder="Alt başlık"
                      className="input"
                    />
                    <input
                      value={form.translations[language].badge}
                      onChange={(event) => updateTranslation(language, "badge", event.target.value)}
                      placeholder="Rozet"
                      className="input"
                    />
                    <input
                      value={form.translations[language].statText}
                      onChange={(event) => updateTranslation(language, "statText", event.target.value)}
                      placeholder="Sağ üst etiket"
                      className="input"
                    />
                    <textarea
                      rows={4}
                      value={form.translations[language].blurb}
                      onChange={(event) => updateTranslation(language, "blurb", event.target.value)}
                      placeholder="Kısa açıklama"
                      className="input min-h-[7rem] resize-y"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={!canManage || status.type === "loading"}
              className="admin-button-primary cursor-pointer px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.type === "loading"
                ? "Kaydediliyor..."
                : editingId
                  ? "Lokasyonu Güncelle"
                  : "Lokasyon Ekle"}
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="cursor-pointer rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {editingId ? "Düzenlemeyi İptal Et" : "Formu Temizle"}
            </button>
          </div>

          {status.type === "error" ? <p className="text-sm text-rose-700">{status.message}</p> : null}
          {status.type === "success" ? <p className="text-sm text-emerald-700">{status.message}</p> : null}
        </form>
      </article>

      <article className="admin-card p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-xl font-semibold text-slate-900">Mevcut Lokasyon Kartları</h3>
            <p className="mt-2 text-sm text-slate-600">
              Kartlar sırasına göre listelenir. Aktif olanlar anasayfada gösterilir.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {spotlights.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              Henüz manuel popüler lokasyon eklenmedi. Bu durumda anasayfada mevcut varsayılan kartlar gösterilir.
            </p>
          ) : (
            spotlights.map((spotlight) => (
              <article key={spotlight.id} className="overflow-hidden rounded-[1.3rem] border border-slate-200 bg-slate-50">
                <div className="grid gap-0 lg:grid-cols-[18rem_minmax(0,1fr)]">
                  <div
                    className="min-h-[12rem] bg-cover bg-center"
                    style={{ backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.08), rgba(15,23,42,0.45)), url(${spotlight.image})` }}
                    aria-hidden
                  />

                  <div className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                            {layoutLabel(spotlight.layoutVariant)}
                          </span>
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                              spotlight.isActive
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {spotlight.isActive ? "Yayında" : "Pasif"}
                          </span>
                          <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                            Sıra {spotlight.sortOrder}
                          </span>
                        </div>

                        <p className="mt-3 text-xl font-semibold text-slate-900">{spotlight.title}</p>
                        <p className="mt-1 text-sm text-slate-600">{spotlight.subtitle}</p>
                        <p className="mt-3 text-sm leading-6 text-slate-600">{spotlight.blurb}</p>

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Link
                            </p>
                            <p className="mt-1 break-all text-slate-900">{spotlight.href}</p>
                          </div>
                          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              Başlangıç Fiyatı
                            </p>
                            <p className="mt-1 text-slate-900">
                              {formatPrice(spotlight.priceAmount, spotlight.priceCurrency)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(spotlight)}
                          className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                        >
                          Düzenle
                        </button>
                        <button
                          type="button"
                          disabled={workingId === spotlight.id}
                          onClick={() => void handleToggleActive(spotlight)}
                          className="cursor-pointer rounded-full border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingId === spotlight.id
                            ? "Kaydediliyor..."
                            : spotlight.isActive
                              ? "Pasife Al"
                              : "Yayına Al"}
                        </button>
                        <button
                          type="button"
                          disabled={workingId === spotlight.id}
                          onClick={() => void handleDelete(spotlight)}
                          className="cursor-pointer rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingId === spotlight.id ? "İşleniyor..." : "Sil"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
