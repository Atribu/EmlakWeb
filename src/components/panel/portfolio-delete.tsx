"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PriceText } from "@/components/price-text";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import type { Advisor, Property, PropertyPublicationStatus } from "@/lib/types";

type PortfolioDeleteProps = {
  initialProperties: Property[];
  advisors: Advisor[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

function normalizeText(value: string) {
  return value
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function PortfolioDelete({ initialProperties, advisors, canManage }: PortfolioDeleteProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [query, setQuery] = useState("");
  const [publicationFilter, setPublicationFilter] = useState<"all" | PropertyPublicationStatus>("all");
  const [companyFilter, setCompanyFilter] = useState("");
  const [internalSearch, setInternalSearch] = useState("");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const advisorMap = useMemo(
    () => new Map(advisors.map((advisor) => [advisor.id, advisor.name])),
    [advisors],
  );

  const developerCompanyOptions = useMemo(
    () =>
      Array.from(
        new Set(
          properties
            .map((property) => property.developerCompany?.trim())
            .filter((company): company is string => Boolean(company)),
        ),
      ).sort((left, right) => left.localeCompare(right, "tr")),
    [properties],
  );

  const filteredProperties = useMemo(() => {
    const normalizedQuery = normalizeText(query.trim());
    const normalizedCompany = normalizeText(companyFilter.trim());
    const normalizedInternalSearch = normalizeText(internalSearch.trim());

    return properties.filter((property) => {
      if (publicationFilter !== "all" && (property.publicationStatus ?? "Aktif") !== publicationFilter) {
        return false;
      }

      if (normalizedCompany) {
        const companyName = normalizeText(property.developerCompany ?? "");

        if (!companyName.includes(normalizedCompany)) {
          return false;
        }
      }

      if (normalizedQuery) {
        const publicHaystack = normalizeText(
          [
            property.title,
            property.listingRef,
            property.country ?? "",
            property.city,
            property.district,
            property.neighborhood,
          ].join(" "),
        );

        if (!publicHaystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (!normalizedInternalSearch) {
        return true;
      }

      const internalHaystack = normalizeText(
        [
          property.title,
          property.listingRef,
          property.country ?? "",
          property.city,
          property.district,
          property.neighborhood,
          property.developerCompany ?? "",
          property.adminCommissionNotes ?? "",
          property.adminPrivateNotes ?? "",
          property.staffNotes ?? "",
          property.customerFeedbackNotes ?? "",
        ].join(" "),
      );

      return internalHaystack.includes(normalizedInternalSearch);
    });
  }, [companyFilter, internalSearch, properties, publicationFilter, query]);

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
        Yayındaki portföyleri listeden bulun ve panel üzerinden güvenli şekilde kaldırın.
      </p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Bu hesapta portföy silme yetkisi bulunmuyor.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_220px_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Portföy ara (başlık, kod, ülke, şehir)"
          className="input"
        />
        <div>
          <input
            value={companyFilter}
            onChange={(event) => setCompanyFilter(event.target.value)}
            list="portfolio-delete-company-options"
            placeholder="Firma adına göre filtrele"
            className="input"
          />
          <datalist id="portfolio-delete-company-options">
            {developerCompanyOptions.map((company) => (
              <option key={company} value={company} />
            ))}
          </datalist>
        </div>
        <input
          value={internalSearch}
          onChange={(event) => setInternalSearch(event.target.value)}
          placeholder="Komisyon veya iç not ara"
          className="input"
        />
        <select
          value={publicationFilter}
          onChange={(event) => setPublicationFilter(event.target.value as "all" | PropertyPublicationStatus)}
          className="input"
        >
          <option value="all">Tüm Yayın Durumları</option>
          <option value="Aktif">Sadece Aktif</option>
          <option value="Pasif">Sadece Pasif</option>
        </select>
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Filtrelenen kayıt: <strong className="text-slate-900">{filteredProperties.length}</strong> / {properties.length}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <p>Firma adı yazdığınızda o firmaya ait tüm projeler listede otomatik olarak öne çıkar.</p>
        {companyFilter ? (
          <button
            type="button"
            onClick={() => setCompanyFilter("")}
            className="admin-button-secondary cursor-pointer px-3 py-1 font-semibold text-slate-600 transition"
          >
            Firma filtresini temizle
          </button>
        ) : null}
      </div>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}

      <div className="mt-5 space-y-3">
        {filteredProperties.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            {properties.length === 0 ? "Silinebilecek portföy bulunmuyor." : "Aramana uygun portföy bulunamadı."}
          </p>
        ) : (
          filteredProperties.map((property) => (
            <article key={property.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      {property.listingRef}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] ${
                        (property.publicationStatus ?? "Aktif") === "Pasif"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {property.publicationStatus ?? "Aktif"}
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
          ))
        )}
      </div>
    </section>
  );
}
