"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PortfolioFilterToolbar } from "@/components/panel/portfolio-filter-toolbar";
import { PriceText } from "@/components/price-text";
import {
  buildPanelCompanyOptions,
  buildPanelCountryOptions,
  defaultPropertyPanelFilters,
  filterPanelProperties,
  type PropertyPanelFilterState,
} from "@/lib/panel-property-filters";
import { buildPropertyNoteSummaries } from "@/lib/property-notes";
import { exportPropertiesToCsv } from "@/lib/property-export";
import { getPropertyPublicationBadgeClass, normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import type { Advisor, Property } from "@/lib/types";

type PortfolioDeleteProps = {
  initialProperties: Property[];
  advisors: Advisor[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

type BulkAction =
  | "set_active"
  | "set_passive"
  | "set_advisor"
  | "append_staff_note"
  | "append_customer_note"
  | "append_admin_private_note"
  | "append_admin_commission_note"
  | "delete";

type BulkPropertyUpdate = {
  slug: string;
  publicationStatus?: Property["publicationStatus"];
  advisorId?: string;
  staffNotes?: string;
  customerFeedbackNotes?: string;
  adminCommissionNotes?: string;
  adminPrivateNotes?: string;
};

export function PortfolioDelete({ initialProperties, advisors, canManage }: PortfolioDeleteProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [filters, setFilters] = useState<PropertyPanelFilterState>(defaultPropertyPanelFilters);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction>("set_active");
  const [bulkAdvisorId, setBulkAdvisorId] = useState<string>(advisors[0]?.id ?? "");
  const [bulkNoteText, setBulkNoteText] = useState("");
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const advisorMap = useMemo(
    () => new Map(advisors.map((advisor) => [advisor.id, advisor.name])),
    [advisors],
  );

  const developerCompanyOptions = useMemo(() => buildPanelCompanyOptions(properties), [properties]);
  const countryOptions = useMemo(() => buildPanelCountryOptions(properties), [properties]);

  const filteredProperties = useMemo(() => {
    return filterPanelProperties(properties, filters);
  }, [filters, properties]);

  const selectedCount = selectedSlugs.length;
  const selectedFilteredCount = filteredProperties.filter((property) => selectedSlugs.includes(property.slug)).length;
  const allFilteredSelected =
    filteredProperties.length > 0 && filteredProperties.every((property) => selectedSlugs.includes(property.slug));

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  useEffect(() => {
    const availableSlugs = new Set(properties.map((property) => property.slug));
    setSelectedSlugs((current) => current.filter((slug) => availableSlugs.has(slug)));
  }, [properties]);

  function togglePropertySelection(slug: string) {
    setSelectedSlugs((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug]));
  }

  function toggleSelectFiltered() {
    const filteredSlugs = filteredProperties.map((property) => property.slug);

    setSelectedSlugs((current) => {
      if (filteredSlugs.every((slug) => current.includes(slug))) {
        return current.filter((slug) => !filteredSlugs.includes(slug));
      }

      return Array.from(new Set([...current, ...filteredSlugs]));
    });
  }

  function clearSelection() {
    setSelectedSlugs([]);
  }

  const bulkNoteField =
    bulkAction === "append_staff_note"
      ? "staffNotes"
      : bulkAction === "append_customer_note"
        ? "customerFeedbackNotes"
        : bulkAction === "append_admin_private_note"
          ? "adminPrivateNotes"
          : bulkAction === "append_admin_commission_note"
            ? "adminCommissionNotes"
            : null;

  function handleExportFiltered() {
    exportPropertiesToCsv(filteredProperties, advisors, {
      fileLabel: "portfoy-sil-ekrani",
    });
  }

  function applyPropertyUpdate(property: Property, update: BulkPropertyUpdate) {
    return {
      ...property,
      publicationStatus: update.publicationStatus ?? property.publicationStatus,
      advisorId: update.advisorId ?? property.advisorId,
      staffNotes: Object.prototype.hasOwnProperty.call(update, "staffNotes") ? update.staffNotes : property.staffNotes,
      customerFeedbackNotes: Object.prototype.hasOwnProperty.call(update, "customerFeedbackNotes")
        ? update.customerFeedbackNotes
        : property.customerFeedbackNotes,
      adminCommissionNotes: Object.prototype.hasOwnProperty.call(update, "adminCommissionNotes")
        ? update.adminCommissionNotes
        : property.adminCommissionNotes,
      adminPrivateNotes: Object.prototype.hasOwnProperty.call(update, "adminPrivateNotes")
        ? update.adminPrivateNotes
        : property.adminPrivateNotes,
    };
  }

  async function handleBulkAction() {
    if (!canManage || selectedSlugs.length === 0) {
      return;
    }

    if (bulkAction === "set_advisor" && !bulkAdvisorId) {
      setStatus({ type: "error", message: "Toplu danışman ataması için bir danışman seçmelisiniz." });
      return;
    }

    if (bulkNoteField && !bulkNoteText.trim()) {
      setStatus({ type: "error", message: "Toplu not işlemi için bir not metni girmelisiniz." });
      return;
    }

    const selectedProperties = properties.filter((property) => selectedSlugs.includes(property.slug));
    const confirmationMessage =
      bulkAction === "delete"
        ? `${selectedProperties.length} portföyü toplu olarak silmek istediğine emin misin?`
        : bulkAction === "set_active"
          ? `${selectedProperties.length} portföyü toplu olarak aktif yapmak istiyor musun?`
          : bulkAction === "set_passive"
            ? `${selectedProperties.length} portföyü toplu olarak pasif yapmak istiyor musun?`
            : bulkAction === "append_staff_note"
              ? `${selectedProperties.length} portföye çalışan notu eklemek istiyor musun?`
              : bulkAction === "append_customer_note"
                ? `${selectedProperties.length} portföye müşteri geri dönüş notu eklemek istiyor musun?`
                : bulkAction === "append_admin_private_note"
                  ? `${selectedProperties.length} portföye yönetici özel notu eklemek istiyor musun?`
                  : bulkAction === "append_admin_commission_note"
                    ? `${selectedProperties.length} portföye komisyon / iç finans notu eklemek istiyor musun?`
            : `${selectedProperties.length} portföyün danışmanını toplu olarak değiştirmek istiyor musun?`;

    if (!window.confirm(confirmationMessage)) {
      return;
    }

    setBulkSubmitting(true);
    setStatus({ type: "idle" });

    try {
      const requestBody =
        bulkAction === "set_active"
          ? { action: "set_publication_status", slugs: selectedSlugs, publicationStatus: "Aktif" }
          : bulkAction === "set_passive"
            ? { action: "set_publication_status", slugs: selectedSlugs, publicationStatus: "Pasif" }
            : bulkAction === "set_advisor"
              ? { action: "set_advisor", slugs: selectedSlugs, advisorId: bulkAdvisorId }
              : bulkNoteField
                ? { action: "append_note", slugs: selectedSlugs, noteField: bulkNoteField, noteText: bulkNoteText }
              : { action: "delete", slugs: selectedSlugs };

      const response = await fetch("/api/properties/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            message?: string;
            count?: number;
            properties?: BulkPropertyUpdate[];
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Toplu işlem tamamlanamadı.");
      }

      if (bulkAction === "delete") {
        const removedSlugs = new Set((payload?.properties ?? []).map((property) => property.slug));
        setProperties((current) => current.filter((property) => !removedSlugs.has(property.slug)));
        setSelectedSlugs((current) => current.filter((slug) => !removedSlugs.has(slug)));
        setStatus({
          type: "success",
          message: `${payload?.count ?? removedSlugs.size} portföy toplu olarak silindi.`,
        });
      } else {
        const propertyUpdates = new Map(
          (payload?.properties ?? []).map((property) => [property.slug, property]),
        );

        setProperties((current) =>
          current.map((property) => {
            const update = propertyUpdates.get(property.slug);

            if (!update) {
              return property;
            }

            return applyPropertyUpdate(property, update);
          }),
        );

        const successMessage =
          bulkAction === "set_active"
            ? `${payload?.count ?? selectedSlugs.length} portföy aktif duruma alındı.`
            : bulkAction === "set_passive"
              ? `${payload?.count ?? selectedSlugs.length} portföy pasif duruma alındı.`
              : bulkAction === "append_staff_note"
                ? `${payload?.count ?? selectedSlugs.length} portföye çalışan notu eklendi.`
                : bulkAction === "append_customer_note"
                  ? `${payload?.count ?? selectedSlugs.length} portföye müşteri geri dönüş notu eklendi.`
                  : bulkAction === "append_admin_private_note"
                    ? `${payload?.count ?? selectedSlugs.length} portföye yönetici özel notu eklendi.`
                    : bulkAction === "append_admin_commission_note"
                      ? `${payload?.count ?? selectedSlugs.length} portföye komisyon / iç finans notu eklendi.`
              : `${payload?.count ?? selectedSlugs.length} portföy için danışman güncellendi.`;

        setStatus({ type: "success", message: successMessage });
        if (bulkNoteField) {
          setBulkNoteText("");
        }
      }

      router.refresh();
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Toplu işlem tamamlanamadı.",
      });
    } finally {
      setBulkSubmitting(false);
    }
  }

  async function handleDelete(property: Property) {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(
      `${property.listingRef} kodlu "${property.title}" portföyünü silmek istediğine emin misin?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingSlug(property.slug);

    const response = await fetch(`/api/properties/${property.slug}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Portföy silinemedi." });
      setDeletingSlug(null);
      return;
    }

    setProperties((previous) => previous.filter((item) => item.slug !== property.slug));
    setStatus({ type: "success", message: `${property.listingRef} kodlu portföy silindi.` });
    setDeletingSlug(null);
    router.refresh();
  }

  return (
    <section className="admin-card p-6 sm:p-7">
      <span className="admin-kicker">Portföy Temizliği</span>
      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Portföy Sil</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">
        Portföyleri durumlarıyla birlikte listeleyin, toplu aksiyon alın ve gerekiyorsa panel üzerinden güvenli şekilde kaldırın.
      </p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Bu hesapta portföy silme yetkisi bulunmuyor.
        </p>
      ) : null}

      <PortfolioFilterToolbar
        advisors={advisors}
        companyOptions={developerCompanyOptions}
        countryOptions={countryOptions}
        disableExport={filteredProperties.length === 0}
        exportButtonLabel="CSV İndir"
        filteredCount={filteredProperties.length}
        filters={filters}
        idPrefix="portfolio-delete"
        internalSearchPlaceholder="Komisyon, iç not veya operasyon notlarında ara"
        onExport={handleExportFiltered}
        publicSearchPlaceholder="Başlık, kod, ülke, şehir veya mahalle ile ara"
        setFilters={setFilters}
        totalCount={properties.length}
      />

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}

      {canManage ? (
        <div className="admin-note mt-5 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Toplu İşlem</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Seçili portföylerle toplu çalışın</h3>
              <p className="mt-1 text-sm text-slate-600">
                Filtrelenen kayıtları topluca seçip aktif etme, pasife alma, danışman değiştirme veya silme işlemleri
                yapabilirsiniz.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                Seçili kayıt: <strong className="text-slate-900">{selectedCount}</strong>
              </div>
              <button
                type="button"
                onClick={toggleSelectFiltered}
                className="admin-button-secondary cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 transition"
              >
                {allFilteredSelected ? "Filtre seçimini kaldır" : "Filtrelenenleri seç"}
              </button>
              {selectedCount > 0 ? (
                <button
                  type="button"
                  onClick={clearSelection}
                  className="admin-button-secondary cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700 transition"
                >
                  Seçimi temizle
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-3 xl:grid-cols-[240px_240px_minmax(0,1fr)_220px]">
            <select
              value={bulkAction}
              onChange={(event) => setBulkAction(event.target.value as BulkAction)}
              className="input"
            >
              <option value="set_active">Seçilenleri aktif yap</option>
              <option value="set_passive">Seçilenleri pasif yap</option>
              <option value="set_advisor">Danışmanı toplu değiştir</option>
              <option value="append_staff_note">Çalışan notu ekle</option>
              <option value="append_customer_note">Müşteri geri dönüş notu ekle</option>
              <option value="append_admin_private_note">Yönetici özel notu ekle</option>
              <option value="append_admin_commission_note">Komisyon notu ekle</option>
              <option value="delete">Seçilenleri sil</option>
            </select>

            <select
              value={bulkAdvisorId}
              onChange={(event) => setBulkAdvisorId(event.target.value)}
              className="input"
              disabled={bulkAction !== "set_advisor"}
            >
              <option value="">Danışman seç</option>
              {advisors.map((advisor) => (
                <option key={advisor.id} value={advisor.id}>
                  {advisor.name}
                </option>
              ))}
            </select>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
              Filtre içinde seçili: <strong className="text-slate-900">{selectedFilteredCount}</strong> /{" "}
              {filteredProperties.length}
            </div>

            <button
              type="button"
              disabled={
                bulkSubmitting ||
                selectedCount === 0 ||
                (bulkAction === "set_advisor" && !bulkAdvisorId)
              }
              onClick={() => void handleBulkAction()}
              className="admin-button-primary cursor-pointer px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {bulkSubmitting ? "İşleniyor..." : "Toplu İşlemi Uygula"}
            </button>
          </div>

          {bulkNoteField ? (
            <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4">
              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                  Toplu not metni
                </span>
                <textarea
                  value={bulkNoteText}
                  onChange={(event) => setBulkNoteText(event.target.value)}
                  rows={4}
                  placeholder="Seçili portföylere eklenecek notu yazın"
                  className="input min-h-[120px]"
                />
              </label>
              <p className="mt-2 text-xs text-slate-500">
                Sistem bu notu tarih ve kullanıcı adı ile birlikte seçilen tüm kayıtların ilgili not alanına ekler.
              </p>
            </div>
          ) : null}

          <p className="mt-3 text-xs text-slate-500">
            Toplu silme işlemi, seçilen kayıtlara bağlı kullanılmayan görselleri de otomatik temizler.
          </p>
        </div>
      ) : null}

      <div className="mt-5 space-y-3">
        {filteredProperties.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            {properties.length === 0 ? "Silinebilecek portföy bulunmuyor." : "Aramana uygun portföy bulunamadı."}
          </p>
        ) : (
          filteredProperties.map((property) => (
            (() => {
              const noteSummaries = buildPropertyNoteSummaries(property, { includeAdmin: canManage });

              return (
                <article
                  key={property.id}
                  className={`rounded-xl border p-4 transition ${
                    selectedSlugs.includes(property.slug)
                      ? "border-slate-900 bg-slate-100 shadow-[0_18px_34px_-30px_rgba(15,23,42,0.28)]"
                      : "border-slate-200 bg-slate-50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {canManage ? (
                          <label className="mr-1 flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                            <input
                              type="checkbox"
                              checked={selectedSlugs.includes(property.slug)}
                              onChange={() => togglePropertySelection(property.slug)}
                              className="h-3.5 w-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
                            />
                            Seç
                          </label>
                        ) : null}
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          {property.listingRef}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${getPropertyPublicationBadgeClass(
                            property.publicationStatus,
                          )}`}
                        >
                          {normalizePropertyPublicationStatus(property.publicationStatus)}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {property.country && property.country !== "Türkiye"
                            ? `${property.country} / ${property.city} / ${property.district}`
                            : `${property.city} / ${property.district} / ${property.neighborhood}`}
                        </span>
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{property.title}</p>
                      <p className="mt-1 text-sm text-slate-600">
                        <PriceText
                          amount={propertyDisplayAmount(property)}
                          sourceCurrency={propertyDisplayCurrency(property)}
                          displayCurrency={propertyDisplayCurrency(property)}
                        />{" "}
                        • {property.type} • {property.rooms}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Danışman: {advisorMap.get(property.advisorId) ?? "Atanmamış"}
                      </p>
                      {property.developerCompany ? (
                        <p className="mt-1 text-sm text-slate-500">İnşaat firması: {property.developerCompany}</p>
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

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/ilan/${property.slug}`}
                        className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                      >
                        İlanı Aç
                      </Link>
                      <button
                        type="button"
                        disabled={!canManage || deletingSlug === property.slug}
                        onClick={() => void handleDelete(property)}
                        className="cursor-pointer rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      >
                        {deletingSlug === property.slug ? "Siliniyor..." : "Portföyü Sil"}
                      </button>
                    </div>
                  </div>
                </article>
              );
            })()
          ))
        )}
      </div>
    </section>
  );
}
