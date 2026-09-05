"use client";

import { useEffect, useState, type Dispatch, type SetStateAction } from "react";

import {
  PROPERTY_MARKET_STATUS_OPTIONS,
  PROPERTY_PUBLICATION_STATUS_OPTIONS,
} from "@/lib/property-panel-options";
import {
  clonePropertyPanelFilters,
  defaultPropertyPanelFilters,
  filterPresetStorageKey,
  PROPERTY_PANEL_QUALITY_FILTER_OPTIONS,
  sanitizePropertyPanelFilterPreset,
  type PropertyPanelFilterPreset,
  type PropertyPanelFilterState,
} from "@/lib/panel-property-filters";
import type { Advisor } from "@/lib/types";

type PortfolioFilterToolbarProps = {
  advisors: Advisor[];
  companyOptions: string[];
  disableExport?: boolean;
  countryOptions: string[];
  exportButtonLabel?: string;
  filteredCount: number;
  filters: PropertyPanelFilterState;
  idPrefix: string;
  internalSearchPlaceholder: string;
  onExport?: (() => void) | undefined;
  publicSearchPlaceholder: string;
  setFilters: Dispatch<SetStateAction<PropertyPanelFilterState>>;
  totalCount: number;
};

function readSavedPresets(storageKey: string) {
  if (typeof window === "undefined") {
    return [] as PropertyPanelFilterPreset[];
  }

  const rawValue = window.localStorage.getItem(storageKey);

  if (!rawValue) {
    return [] as PropertyPanelFilterPreset[];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as unknown[];
    return Array.isArray(parsedValue)
      ? parsedValue
          .map((item) => sanitizePropertyPanelFilterPreset(item))
          .filter((item): item is PropertyPanelFilterPreset => Boolean(item))
      : [];
  } catch {
    return [] as PropertyPanelFilterPreset[];
  }
}

export function PortfolioFilterToolbar({
  advisors,
  companyOptions,
  disableExport = false,
  countryOptions,
  exportButtonLabel = "CSV Dışa Aktar",
  filteredCount,
  filters,
  idPrefix,
  internalSearchPlaceholder,
  onExport,
  publicSearchPlaceholder,
  setFilters,
  totalCount,
}: PortfolioFilterToolbarProps) {
  const storageKey = filterPresetStorageKey(idPrefix);
  const [savedPresets, setSavedPresets] = useState<PropertyPanelFilterPreset[]>(() => readSavedPresets(storageKey));
  const [presetName, setPresetName] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(storageKey, JSON.stringify(savedPresets));
  }, [savedPresets, storageKey]);

  function updateFilter<K extends keyof PropertyPanelFilterState>(
    key: K,
    value: PropertyPanelFilterState[K],
  ) {
    setFilters((current) => ({ ...current, [key]: value }));
  }

  const activeFilters = [
    filters.query ? `Arama: ${filters.query}` : null,
    filters.companyFilter ? `Firma: ${filters.companyFilter}` : null,
    filters.internalSearch ? `İç not: ${filters.internalSearch}` : null,
    filters.countryFilter ? `Ülke: ${filters.countryFilter}` : null,
    filters.publicationFilter !== "all" ? `Yayın: ${filters.publicationFilter}` : null,
    filters.marketStatusFilter !== "all" ? `Portföy durumu: ${filters.marketStatusFilter}` : null,
    filters.qualityFilter === "ready"
      ? "Kalite: Onaya hazır"
      : filters.qualityFilter === "critical"
        ? "Kalite: Kritik eksik"
        : filters.qualityFilter === "advisory"
          ? "Kalite: İçerik uyarısı"
          : null,
    filters.advisorFilter
      ? `Danışman: ${advisors.find((advisor) => advisor.id === filters.advisorFilter)?.name ?? filters.advisorFilter}`
      : null,
  ].filter((item): item is string => Boolean(item));

  const selectedPreset = selectedPresetId
    ? savedPresets.find((preset) => preset.id === selectedPresetId) ?? null
    : null;

  function applyQuickView(mode: "all" | "pending" | "active" | "critical" | "advisory" | "ready") {
    if (mode === "all") {
      setFilters(clonePropertyPanelFilters(defaultPropertyPanelFilters));
      return;
    }

    if (mode === "pending") {
      setFilters({
        ...clonePropertyPanelFilters(defaultPropertyPanelFilters),
        publicationFilter: "Onay Bekliyor",
      });
      return;
    }

    if (mode === "active") {
      setFilters({
        ...clonePropertyPanelFilters(defaultPropertyPanelFilters),
        publicationFilter: "Aktif",
      });
      return;
    }

    if (mode === "critical") {
      setFilters({
        ...clonePropertyPanelFilters(defaultPropertyPanelFilters),
        qualityFilter: "critical",
      });
      return;
    }

    if (mode === "advisory") {
      setFilters({
        ...clonePropertyPanelFilters(defaultPropertyPanelFilters),
        qualityFilter: "advisory",
      });
      return;
    }

    setFilters({
      ...clonePropertyPanelFilters(defaultPropertyPanelFilters),
      qualityFilter: "ready",
    });
  }

  function buildFallbackPresetName() {
    if (activeFilters.length > 0) {
      return activeFilters.slice(0, 2).join(" • ");
    }

    return `Özel görünüm ${savedPresets.length + 1}`;
  }

  function savePreset(mode: "create" | "update") {
    const resolvedName = presetName.trim() || selectedPreset?.name || buildFallbackPresetName();
    const nextFilters = clonePropertyPanelFilters(filters);

    if (mode === "update" && selectedPreset) {
      const updatedPreset: PropertyPanelFilterPreset = {
        ...selectedPreset,
        name: resolvedName,
        filters: nextFilters,
      };

      const nextPresets = savedPresets.map((preset) => (preset.id === selectedPreset.id ? updatedPreset : preset));
      setSavedPresets(nextPresets);
      setPresetName(updatedPreset.name);
      return;
    }

    const nextPreset: PropertyPanelFilterPreset = {
      id: `preset-${crypto.randomUUID()}`,
      name: resolvedName,
      filters: nextFilters,
      createdAt: new Date().toISOString(),
    };

    setSavedPresets((current) => [nextPreset, ...current].slice(0, 12));
    setSelectedPresetId(nextPreset.id);
    setPresetName(nextPreset.name);
  }

  function applySavedPreset(presetId: string) {
    setSelectedPresetId(presetId);

    const preset = savedPresets.find((item) => item.id === presetId);
    if (!preset) {
      return;
    }

    setFilters(clonePropertyPanelFilters(preset.filters));
    setPresetName(preset.name);
  }

  function deleteSelectedPreset() {
    if (!selectedPreset) {
      return;
    }

    setSavedPresets((current) => current.filter((preset) => preset.id !== selectedPreset.id));
    setSelectedPresetId("");
    setPresetName("");
  }

  return (
    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/90 p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filtre Merkezi</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Portföy arama ve segmentasyon</h3>
          <p className="mt-1 text-sm text-slate-600">
            Firma, danışman, ülke, yayın durumu ve iç notlara göre kayıtları hızlıca daraltın.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Filtrelenen kayıt: <strong className="text-slate-900">{filteredCount}</strong> / {totalCount}
          </div>
          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              disabled={disableExport}
              className="admin-button-secondary cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exportButtonLabel}
            </button>
          ) : null}
          {activeFilters.length > 0 ? (
            <button
              type="button"
              onClick={() => setFilters(defaultPropertyPanelFilters)}
              className="admin-button-secondary cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 transition"
            >
              Tüm filtreleri temizle
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => applyQuickView("all")}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-300"
        >
          Tümü
        </button>
        <button
          type="button"
          onClick={() => applyQuickView("pending")}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-300"
        >
          Onay Bekleyen
        </button>
        <button
          type="button"
          onClick={() => applyQuickView("active")}
          className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-600 transition hover:border-slate-300"
        >
          Aktifler
        </button>
        <button
          type="button"
          onClick={() => applyQuickView("critical")}
          className="rounded-full border border-rose-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50"
        >
          Kritik Eksik
        </button>
        <button
          type="button"
          onClick={() => applyQuickView("advisory")}
          className="rounded-full border border-amber-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 transition hover:bg-amber-50"
        >
          İçerik Uyarısı
        </button>
        <button
          type="button"
          onClick={() => applyQuickView("ready")}
          className="rounded-full border border-emerald-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-50"
        >
          Onaya Hazır
        </button>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-4">
        <input
          value={filters.query}
          onChange={(event) => updateFilter("query", event.target.value)}
          placeholder={publicSearchPlaceholder}
          className="input xl:col-span-2"
        />

        <div className="xl:col-span-2">
          <input
            value={filters.internalSearch}
            onChange={(event) => updateFilter("internalSearch", event.target.value)}
            placeholder={internalSearchPlaceholder}
            className="input"
          />
        </div>

        <div>
          <input
            value={filters.companyFilter}
            onChange={(event) => updateFilter("companyFilter", event.target.value)}
            list={`${idPrefix}-company-options`}
            placeholder="Firma adına göre filtrele"
            className="input"
          />
          <datalist id={`${idPrefix}-company-options`}>
            {companyOptions.map((company) => (
              <option key={company} value={company} />
            ))}
          </datalist>
        </div>

        <select
          value={filters.advisorFilter}
          onChange={(event) => updateFilter("advisorFilter", event.target.value)}
          className="input"
        >
          <option value="">Tüm danışmanlar</option>
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.name}
            </option>
          ))}
        </select>

        <select
          value={filters.countryFilter}
          onChange={(event) => updateFilter("countryFilter", event.target.value)}
          className="input"
        >
          <option value="">Tüm ülkeler</option>
          {countryOptions.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>

        <select
          value={filters.publicationFilter}
          onChange={(event) =>
            updateFilter("publicationFilter", event.target.value as PropertyPanelFilterState["publicationFilter"])
          }
          className="input"
        >
          <option value="all">Tüm yayın durumları</option>
          {PROPERTY_PUBLICATION_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Sadece {option}
            </option>
          ))}
        </select>

        <select
          value={filters.marketStatusFilter}
          onChange={(event) =>
            updateFilter("marketStatusFilter", event.target.value as PropertyPanelFilterState["marketStatusFilter"])
          }
          className="input"
        >
          <option value="all">Tüm portföy durumları</option>
          {PROPERTY_MARKET_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              Sadece {option}
            </option>
          ))}
        </select>

        <select
          value={filters.qualityFilter}
          onChange={(event) =>
            updateFilter("qualityFilter", event.target.value as PropertyPanelFilterState["qualityFilter"])
          }
          className="input"
        >
          <option value="all">Tüm kalite durumları</option>
          {PROPERTY_PANEL_QUALITY_FILTER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_260px_160px_160px_140px]">
        <input
          value={presetName}
          onChange={(event) => setPresetName(event.target.value)}
          placeholder="Bu görünüm için bir ad yazın"
          className="input"
        />

        <select
          value={selectedPresetId}
          onChange={(event) => applySavedPreset(event.target.value)}
          className="input"
        >
          <option value="">Kayıtlı görünüm seç</option>
          {savedPresets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.name}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => savePreset("create")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
        >
          Yeni Kaydet
        </button>

        <button
          type="button"
          disabled={!selectedPreset}
          onClick={() => savePreset("update")}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Güncelle
        </button>

        <button
          type="button"
          disabled={!selectedPreset}
          onClick={deleteSelectedPreset}
          className="rounded-xl border border-rose-200 bg-white px-4 py-3 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Sil
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {activeFilters.length > 0 ? (
          activeFilters.map((filterLabel) => (
            <span key={filterLabel} className="admin-chip text-slate-600">
              {filterLabel}
            </span>
          ))
        ) : (
          <p className="text-xs text-slate-500">
            Henüz aktif filtre yok. Geniş veri listelerinde önce firma veya danışman filtresi ile başlamanız en hızlı
            yöntem olur.
          </p>
        )}
      </div>
    </div>
  );
}
