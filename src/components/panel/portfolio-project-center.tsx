"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PortfolioFilterToolbar } from "@/components/panel/portfolio-filter-toolbar";
import { PriceText } from "@/components/price-text";
import { formatDateTimeTR } from "@/lib/format";
import {
  buildPanelCompanyOptions,
  buildPanelCountryOptions,
  defaultPropertyPanelFilters,
  filterPanelProperties,
  normalizePanelText,
  type PropertyPanelFilterState,
} from "@/lib/panel-property-filters";
import {
  getPropertyPublicationBadgeClass,
  isPropertyPendingApproval,
  isPropertyPublished,
  normalizePropertyPublicationStatus,
} from "@/lib/property-panel-options";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import {
  propertyActivityActionBadgeClass,
  propertyActivityActionLabel,
  propertyActivityActorRoleLabel,
} from "@/lib/property-activity";
import { buildPropertyNoteSummaries } from "@/lib/property-notes";
import { exportPropertiesToCsv } from "@/lib/property-export";
import { summarizePropertyQuality } from "@/lib/property-quality";
import type { Advisor, Property, PropertyActivityLog } from "@/lib/types";

type PortfolioProjectCenterProps = {
  initialCompanyFilter?: string;
  initialProperties: Property[];
  advisors: Advisor[];
  canDelete: boolean;
  recentActivityLogs: PropertyActivityLog[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

type CompanyGroup = {
  key: string;
  activeCount: number;
  cityLabels: string[];
  companyName: string;
  countryLabels: string[];
  passiveCount: number;
  properties: Property[];
};

function buildQuickCompanyOptions(properties: Property[]) {
  const counts = new Map<string, number>();

  for (const property of properties) {
    const companyName = property.developerCompany?.trim();

    if (!companyName) {
      continue;
    }

    counts.set(companyName, (counts.get(companyName) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((left, right) => {
      if (right[1] !== left[1]) {
        return right[1] - left[1];
      }

      return left[0].localeCompare(right[0], "tr");
    })
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }));
}

function buildCompanyGroups(properties: Property[]): CompanyGroup[] {
  const grouped = new Map<string, CompanyGroup>();

  for (const property of properties) {
    const companyName = property.developerCompany?.trim() || "Firma bilgisi girilmemiş";
    const key = normalizePanelText(companyName);
    const current = grouped.get(key);

    if (!current) {
      grouped.set(key, {
        key,
        activeCount: isPropertyPublished(property.publicationStatus) ? 1 : 0,
        cityLabels: [`${property.city} / ${property.district}`],
        companyName,
        countryLabels: [property.country?.trim() || "Türkiye"],
        passiveCount: isPropertyPublished(property.publicationStatus) ? 0 : 1,
        properties: [property],
      });
      continue;
    }

    current.properties.push(property);

    if (isPropertyPublished(property.publicationStatus)) {
      current.activeCount += 1;
    } else {
      current.passiveCount += 1;
    }

    const cityLabel = `${property.city} / ${property.district}`;
    if (!current.cityLabels.includes(cityLabel)) {
      current.cityLabels.push(cityLabel);
    }

    const countryLabel = property.country?.trim() || "Türkiye";
    if (!current.countryLabels.includes(countryLabel)) {
      current.countryLabels.push(countryLabel);
    }
  }

  return Array.from(grouped.values())
    .map((group) => ({
      ...group,
      properties: [...group.properties].sort((left, right) => {
        const publicationDiff = normalizePropertyPublicationStatus(left.publicationStatus).localeCompare(
          normalizePropertyPublicationStatus(right.publicationStatus),
          "tr",
        );
        if (publicationDiff !== 0) {
          return publicationDiff;
        }

        return left.title.localeCompare(right.title, "tr");
      }),
      cityLabels: [...group.cityLabels].sort((left, right) => left.localeCompare(right, "tr")),
      countryLabels: [...group.countryLabels].sort((left, right) => left.localeCompare(right, "tr")),
    }))
    .sort((left, right) => {
      if (right.properties.length !== left.properties.length) {
        return right.properties.length - left.properties.length;
      }

      return left.companyName.localeCompare(right.companyName, "tr");
    });
}

export function PortfolioProjectCenter({
  initialCompanyFilter = "",
  initialProperties,
  advisors,
  canDelete,
  recentActivityLogs,
}: PortfolioProjectCenterProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filters, setFilters] = useState<PropertyPanelFilterState>(() => ({
    ...defaultPropertyPanelFilters,
    companyFilter: initialCompanyFilter,
  }));
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [workingKey, setWorkingKey] = useState<string | null>(null);

  const advisorMap = useMemo(
    () => new Map(advisors.map((advisor) => [advisor.id, advisor.name])),
    [advisors],
  );
  const companyOptions = useMemo(() => buildPanelCompanyOptions(properties), [properties]);
  const countryOptions = useMemo(() => buildPanelCountryOptions(properties), [properties]);
  const quickCompanyOptions = useMemo(() => buildQuickCompanyOptions(properties), [properties]);

  const filteredProperties = useMemo(() => filterPanelProperties(properties, filters), [filters, properties]);
  const companyGroups = useMemo(() => buildCompanyGroups(filteredProperties), [filteredProperties]);
  const pendingApprovalCount = useMemo(
    () => filteredProperties.filter((property) => isPropertyPendingApproval(property.publicationStatus)).length,
    [filteredProperties],
  );
  const pendingApprovalProperties = useMemo(
    () => filteredProperties.filter((property) => isPropertyPendingApproval(property.publicationStatus)).slice(0, 8),
    [filteredProperties],
  );

  const filteredActiveCount = filteredProperties.filter((property) => isPropertyPublished(property.publicationStatus)).length;
  const filteredInactiveCount = filteredProperties.length - filteredActiveCount;
  const existingPropertySlugs = useMemo(() => new Set(properties.map((property) => property.slug)), [properties]);
  const visibleActivityLogs = useMemo(() => recentActivityLogs.slice(0, 10), [recentActivityLogs]);
  const propertyQualityMap = useMemo(
    () => new Map(properties.map((property) => [property.slug, summarizePropertyQuality(property)])),
    [properties],
  );
  const attentionProperties = useMemo(
    () =>
      filteredProperties
        .map((property) => ({
          property,
          quality: propertyQualityMap.get(property.slug) ?? summarizePropertyQuality(property),
        }))
        .filter(({ quality }) => quality.totalIssueCount > 0)
        .sort((left, right) => {
          if (right.quality.criticalIssues.length !== left.quality.criticalIssues.length) {
            return right.quality.criticalIssues.length - left.quality.criticalIssues.length;
          }

          return right.quality.advisoryIssues.length - left.quality.advisoryIssues.length;
        })
        .slice(0, 8),
    [filteredProperties, propertyQualityMap],
  );

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  function applyQuickCompany(label: string) {
    setFilters((current) => ({
      ...current,
      companyFilter: current.companyFilter === label ? "" : label,
    }));
  }

  function resetFilters() {
    setFilters(defaultPropertyPanelFilters);
  }

  function handleExportFiltered() {
    exportPropertiesToCsv(filteredProperties, advisors, {
      fileLabel: filters.companyFilter ? `${filters.companyFilter}-firma-merkezi` : "firma-merkezi-portfoyleri",
    });
  }

  async function handleDelete(property: Property) {
    if (!canDelete) {
      return;
    }

    const confirmed = window.confirm(
      `${property.listingRef} kodlu "${property.title}" kaydını firma merkezinden silmek istediğinize emin misiniz?`,
    );

    if (!confirmed) {
      return;
    }

    setWorkingKey(`delete:${property.slug}`);
    setStatus({ type: "idle" });

    try {
      const response = await fetch(`/api/properties/${property.slug}`, { method: "DELETE" });
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Portföy silinemedi.");
      }

      setProperties((current) => current.filter((item) => item.slug !== property.slug));
      setStatus({ type: "success", message: `${property.listingRef} kodlu portföy silindi.` });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Portföy silinemedi.",
      });
    } finally {
      setWorkingKey(null);
    }
  }

  async function handleGroupStatusChange(group: CompanyGroup, nextStatus: Property["publicationStatus"]) {
    if (!canDelete) {
      return;
    }

    const affectedProperties = group.properties.filter(
      (property) => normalizePropertyPublicationStatus(property.publicationStatus) !== nextStatus,
    );

    if (affectedProperties.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `${group.companyName} grubundaki ${affectedProperties.length} portföy ${nextStatus?.toLocaleLowerCase("tr")} yapılacak. Devam etmek istiyor musunuz?`,
    );

    if (!confirmed) {
      return;
    }

    setWorkingKey(`group:${group.key}:${nextStatus}`);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/properties/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set_publication_status",
          publicationStatus: nextStatus,
          slugs: affectedProperties.map((property) => property.slug),
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            count?: number;
            message?: string;
            properties?: Array<{ publicationStatus?: Property["publicationStatus"]; slug: string }>;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Toplu durum güncellemesi tamamlanamadı.");
      }

      const propertyUpdates = new Map(
        (payload?.properties ?? []).map((property) => [property.slug, property.publicationStatus ?? nextStatus]),
      );

      setProperties((current) =>
        current.map((property) =>
          propertyUpdates.has(property.slug)
            ? { ...property, publicationStatus: propertyUpdates.get(property.slug) ?? property.publicationStatus }
            : property,
        ),
      );

      setStatus({
        type: "success",
        message: `${group.companyName} grubunda ${payload?.count ?? affectedProperties.length} portföy güncellendi.`,
      });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Toplu durum güncellemesi tamamlanamadı.",
      });
    } finally {
      setWorkingKey(null);
    }
  }

  async function handlePropertyStatusChange(property: Property, nextStatus: Property["publicationStatus"]) {
    const currentStatus = normalizePropertyPublicationStatus(property.publicationStatus);

    if (!canDelete || currentStatus === nextStatus) {
      return;
    }

    const confirmed = window.confirm(
      `${property.listingRef} kodlu portföy "${currentStatus}" durumundan "${nextStatus}" durumuna geçirilecek. Devam etmek istiyor musunuz?`,
    );

    if (!confirmed) {
      return;
    }

    setWorkingKey(`status:${property.slug}:${nextStatus}`);
    setStatus({ type: "idle" });

    try {
      const response = await fetch("/api/properties/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set_publication_status",
          publicationStatus: nextStatus,
          slugs: [property.slug],
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            properties?: Array<{ publicationStatus?: Property["publicationStatus"]; slug: string }>;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Durum güncellenemedi.");
      }

      const nextProperty = payload?.properties?.[0];
      setProperties((current) =>
        current.map((item) =>
          item.slug === property.slug
            ? { ...item, publicationStatus: nextProperty?.publicationStatus ?? nextStatus }
            : item,
        ),
      );
      setStatus({
        type: "success",
        message: `${property.listingRef} kodlu portföy "${nextStatus}" durumuna alındı.`,
      });
      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Durum güncellenemedi.",
      });
    } finally {
      setWorkingKey(null);
    }
  }

  return (
    <section className="admin-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="admin-kicker">Firma Operasyonları</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Proje / Firma Merkezi</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            Firma adını yazdıkça ilgili portföyler otomatik olarak aynı blokta gruplanır. Böylece aynı firmaya ait tüm
            projeleri tek ekrandan tarayıp düzenleme, kopyalama ve durum yönetimini hızlandırabilirsiniz.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Firma grubu: <strong className="text-slate-900">{companyGroups.length}</strong>
        </div>
      </div>

      <div className="mt-5 rounded-[1.75rem] border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,180px))]">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Firma / Proje Arama</span>
            <input
              value={filters.companyFilter}
              onChange={(event) =>
                setFilters((current) => ({
                  ...current,
                  companyFilter: event.target.value,
                }))
              }
              placeholder="Örn. Rodina, Signature Estates, XYZ İnşaat"
              className="input mt-3 h-12"
            />
            <p className="mt-2 text-xs text-slate-500">
              Yazdığınız firma adı kısmi eşleşmeyle algılanır ve sonuçlar anında aşağıda gruplanır.
            </p>
          </label>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Filtrelenen Portföy</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">{filteredProperties.length}</p>
            <p className="mt-1 text-xs text-slate-500">Tek ekranda listelenen toplam kayıt</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Aktif</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-emerald-700">{filteredActiveCount}</p>
            <p className="mt-1 text-xs text-slate-500">Yayında olan portföyler</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Yayın Dışı</p>
            <p className="mt-2 text-2xl font-semibold tracking-tight text-amber-700">{filteredInactiveCount}</p>
            <p className="mt-1 text-xs text-slate-500">Taslak, onay bekleyen, pasif veya satılmış kayıtlar</p>
          </div>
        </div>

        {quickCompanyOptions.length > 0 ? (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Hızlı Firma Seçimi</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {quickCompanyOptions.map((option) => {
                const isActive = filters.companyFilter === option.label;

                return (
                  <button
                    key={option.label}
                    type="button"
                    onClick={() => applyQuickCompany(option.label)}
                    className={`rounded-full border px-3 py-2 text-sm font-semibold transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                    }`}
                  >
                    {option.label}
                    <span className={`ml-2 text-xs ${isActive ? "text-white/80" : "text-slate-400"}`}>{option.count}</span>
                  </button>
                );
              })}

              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-300"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>
        ) : null}
      </div>

      <PortfolioFilterToolbar
        advisors={advisors}
        companyOptions={companyOptions}
        countryOptions={countryOptions}
        disableExport={filteredProperties.length === 0}
        exportButtonLabel="CSV İndir"
        filteredCount={filteredProperties.length}
        filters={filters}
        idPrefix="portfolio-project-center"
        internalSearchPlaceholder="Firma notu, komisyon veya iç operasyon notlarında ara"
        onExport={handleExportFiltered}
        publicSearchPlaceholder="Başlık, kod, firma, ülke, şehir veya oda tipinde ara"
        setFilters={setFilters}
        totalCount={properties.length}
      />

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}

      {visibleActivityLogs.length > 0 ? (
        <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.18)] sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Son Hareketler</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Portföy aktivite akışı</h3>
              <p className="mt-1 text-sm text-slate-600">
                Oluşturma, güncelleme, danışman ataması ve silme işlemleri burada zaman sırasıyla görünür.
              </p>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {visibleActivityLogs.length} son kayıt
            </div>
          </div>

          <div className="mt-4 space-y-3">
            {visibleActivityLogs.map((activity) => {
              const isExistingProperty = existingPropertySlugs.has(activity.propertySlug);

              return (
                <article
                  key={activity.id}
                  className="rounded-[1.35rem] border border-slate-200 bg-slate-50/70 px-4 py-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                          {activity.listingRef ?? "KODSuz"}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${propertyActivityActionBadgeClass(
                            activity.actionType,
                          )}`}
                        >
                          {propertyActivityActionLabel(activity.actionType)}
                        </span>
                        <span className="text-xs text-slate-500">{formatDateTimeTR(activity.createdAt)}</span>
                      </div>

                      <p className="mt-3 text-base font-semibold text-slate-900">{activity.propertyTitle}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activity.actorName} • {propertyActivityActorRoleLabel(activity.actorRole)}
                      </p>
                      <p className="mt-3 text-sm text-slate-700">{activity.summary}</p>

                      {activity.details.length > 0 ? (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {activity.details.slice(0, 3).map((detail) => (
                            <span
                              key={`${activity.id}-${detail}`}
                              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                            >
                              {detail}
                            </span>
                          ))}
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {isExistingProperty ? (
                        <>
                          <Link
                            href={`/yonetim-ofisi?tab=portfolio-edit&slug=${activity.propertySlug}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                          >
                            Düzenle
                          </Link>
                          <Link
                            href={`/ilan/${activity.propertySlug}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                          >
                            İlanı Aç
                          </Link>
                        </>
                      ) : (
                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-500">
                          Kayıt yayında değil
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      {attentionProperties.length > 0 ? (
        <section className="mt-5 rounded-[1.75rem] border border-amber-200 bg-amber-50/50 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Yayın Öncesi Kontrol</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Eksik veri bulunan portföyler</h3>
              <p className="mt-1 text-sm text-slate-600">
                Onay bekleyen veya yayına alınacak kayıtlar için kritik eksikleri ve içerik uyarılarını bu blokta hızlıca
                görebilirsiniz.
              </p>
            </div>
            <span className="rounded-full border border-amber-200 bg-white px-4 py-2 text-sm font-semibold text-amber-800">
              {attentionProperties.length} kayıt dikkat istiyor
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {attentionProperties.map(({ property, quality }) => (
              <article key={`quality-${property.id}`} className="rounded-[1.35rem] border border-amber-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {property.listingRef}
                      </span>
                      <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-rose-700">
                        {quality.criticalIssues.length} kritik
                      </span>
                      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-amber-700">
                        {quality.advisoryIssues.length} uyarı
                      </span>
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-900">{property.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {[...quality.criticalIssues, ...quality.advisoryIssues].slice(0, 4).map((issue) => (
                        <span
                          key={`${property.id}-${issue.id}`}
                          className={`rounded-full px-3 py-1 text-xs ${
                            issue.tone === "critical"
                              ? "border border-rose-200 bg-rose-50 text-rose-700"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                          }`}
                        >
                          {issue.label}
                        </span>
                      ))}
                    </div>
                  </div>

                  <Link
                    href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                  >
                    Düzenle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {canDelete && pendingApprovalCount > 0 ? (
        <section className="mt-5 rounded-[1.75rem] border border-sky-200 bg-sky-50/70 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-700">Onay Kuyruğu</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Yönetici onayı bekleyen portföyler</h3>
              <p className="mt-1 text-sm text-slate-600">
                Yeni girilen ilanlar önce bu kuyruğa düşer. Buradan hızlıca yayına alabilir, taslağa çekebilir veya
                pasife ayırabilirsiniz.
              </p>
            </div>

            <div className="rounded-full border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-800">
              {pendingApprovalCount} kayıt bekliyor
            </div>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {pendingApprovalProperties.map((property) => (
              <article key={property.id} className="rounded-[1.4rem] border border-sky-200 bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                        {property.listingRef}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getPropertyPublicationBadgeClass(
                          property.publicationStatus,
                        )}`}
                      >
                        {normalizePropertyPublicationStatus(property.publicationStatus)}
                      </span>
                    </div>
                    <p className="mt-3 text-base font-semibold text-slate-900">{property.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {property.developerCompany ?? "Firma bilgisi girilmemiş"} • {property.city} / {property.district}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">
                    <PriceText
                      amount={propertyDisplayAmount(property)}
                      sourceCurrency={propertyDisplayCurrency(property)}
                      displayCurrency={propertyDisplayCurrency(property)}
                    />
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handlePropertyStatusChange(property, "Aktif")}
                    disabled={workingKey === `status:${property.slug}:Aktif`}
                    className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `status:${property.slug}:Aktif` ? "İşleniyor..." : "Yayına Al"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePropertyStatusChange(property, "Taslak")}
                    disabled={workingKey === `status:${property.slug}:Taslak`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `status:${property.slug}:Taslak` ? "İşleniyor..." : "Taslağa Çek"}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handlePropertyStatusChange(property, "Pasif")}
                    disabled={workingKey === `status:${property.slug}:Pasif`}
                    className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {workingKey === `status:${property.slug}:Pasif` ? "İşleniyor..." : "Pasife Al"}
                  </button>
                  <Link
                    href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                  >
                    Düzenle
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-5 space-y-4">
        {companyGroups.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Seçtiğiniz firma ve filtre kombinasyonuna uygun portföy bulunamadı.
          </p>
        ) : (
          companyGroups.map((group) => {
            const canActivate = canDelete && group.passiveCount > 0;
            const canDeactivate = canDelete && group.activeCount > 0;

            return (
              <article
                key={group.key}
                className="overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-[0_18px_34px_-30px_rgba(15,23,42,0.18)]"
              >
                <div className="border-b border-slate-200 bg-slate-50/80 px-5 py-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Firma / Proje Grubu</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-900">{group.companyName}</h3>
                      <p className="mt-2 text-sm text-slate-500">
                        {group.countryLabels.join(", ")} • {group.cityLabels.join(" • ")}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600">
                        {group.properties.length} portföy
                      </span>
                      <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                        {group.activeCount} aktif
                      </span>
                      <span className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800">
                        {group.passiveCount} yayın dışı
                      </span>
                      {canActivate ? (
                        <button
                          type="button"
                          onClick={() => void handleGroupStatusChange(group, "Aktif")}
                          disabled={workingKey === `group:${group.key}:Aktif`}
                          className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingKey === `group:${group.key}:Aktif` ? "İşleniyor..." : "Tümünü Aktif Yap"}
                        </button>
                      ) : null}
                      {canDeactivate ? (
                        <button
                          type="button"
                          onClick={() => void handleGroupStatusChange(group, "Pasif")}
                          disabled={workingKey === `group:${group.key}:Pasif`}
                          className="rounded-full border border-amber-200 bg-white px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {workingKey === `group:${group.key}:Pasif` ? "İşleniyor..." : "Tümünü Pasife Al"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 sm:p-5">
                  {group.properties.map((property) => {
                    const quality = propertyQualityMap.get(property.slug) ?? summarizePropertyQuality(property);
                    const noteSummaries = buildPropertyNoteSummaries(property, { includeAdmin: canDelete });

                    return (
                      <div
                        key={property.id}
                        className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                              {property.listingRef}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getPropertyPublicationBadgeClass(
                                property.publicationStatus,
                              )}`}
                            >
                              {normalizePropertyPublicationStatus(property.publicationStatus)}
                            </span>
                            <span className="rounded-full bg-sky-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-sky-800">
                              {property.marketStatus ?? "Hazır"}
                            </span>
                            <span
                              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                quality.criticalIssues.length > 0
                                  ? "bg-rose-100 text-rose-700"
                                  : quality.advisoryIssues.length > 0
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-emerald-100 text-emerald-700"
                              }`}
                            >
                              {quality.criticalIssues.length > 0
                                ? `${quality.criticalIssues.length} kritik`
                                : quality.advisoryIssues.length > 0
                                  ? `${quality.advisoryIssues.length} uyarı`
                                  : "Hazır"}
                            </span>
                          </div>

                          <p className="mt-3 text-lg font-semibold tracking-tight text-slate-900">{property.title}</p>

                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                            <span>{property.type}</span>
                            <span>{property.rooms}</span>
                            <span>{property.city} / {property.district} / {property.neighborhood}</span>
                            <span>Danışman: {advisorMap.get(property.advisorId) ?? "Atanmamış"}</span>
                          </div>

                          {quality.totalIssueCount > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {[...quality.criticalIssues, ...quality.advisoryIssues].slice(0, 3).map((issue) => (
                                <span
                                  key={`${property.id}-${issue.id}`}
                                  className={`rounded-full px-3 py-1 text-xs ${
                                    issue.tone === "critical"
                                      ? "border border-rose-200 bg-white text-rose-700"
                                      : "border border-amber-200 bg-white text-amber-700"
                                  }`}
                                >
                                  {issue.label}
                                </span>
                              ))}
                            </div>
                          ) : null}

                          {noteSummaries.length > 0 ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {noteSummaries.map((note) => (
                                <span
                                  key={`${property.slug}-${note.key}`}
                                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                                  title={note.preview}
                                >
                                  {note.label}: {note.count}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <div className="min-w-[220px]">
                          <p className="text-right text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Fiyat</p>
                          <p className="mt-2 text-right text-lg font-semibold tracking-tight text-slate-900">
                            <PriceText
                              amount={propertyDisplayAmount(property)}
                              sourceCurrency={propertyDisplayCurrency(property)}
                              displayCurrency={propertyDisplayCurrency(property)}
                            />
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                        >
                          Düzenle
                        </Link>
                        <Link
                          href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}#kopyala-varyantlari`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                        >
                          Kopyala
                        </Link>
                        <Link
                          href={`/ilan/${property.slug}`}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                        >
                          İlanı Aç
                        </Link>
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => void handleDelete(property)}
                            disabled={workingKey === `delete:${property.slug}`}
                            className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                          >
                            {workingKey === `delete:${property.slug}` ? "Siliniyor..." : "Sil"}
                          </button>
                        ) : null}
                      </div>
                      </div>
                    );
                  })}
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
