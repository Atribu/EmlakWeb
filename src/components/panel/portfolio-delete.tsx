"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { formatPrice } from "@/lib/format";
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

export function PortfolioDelete({ initialProperties, advisors, canManage }: PortfolioDeleteProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const advisorMap = useMemo(
    () => new Map(advisors.map((advisor) => [advisor.id, advisor.name])),
    [advisors],
  );

  const filteredProperties = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr");

    if (!normalizedQuery) {
      return properties;
    }

    return properties.filter((property) =>
      [property.title, property.listingRef, property.city, property.district, property.neighborhood]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(normalizedQuery),
    );
  }, [properties, query]);

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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Portföy Sil</h2>
      <p className="mt-2 text-sm text-slate-600">
        Yayındaki portföyleri listeden bulun ve panel üzerinden güvenli şekilde kaldırın.
      </p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Bu hesapta portföy silme yetkisi bulunmuyor.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Portföy ara (başlık, kod, şehir, ilçe)"
          className="input"
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Toplam kayıt: <strong className="text-slate-900">{properties.length}</strong>
        </div>
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
                    <span className="text-xs font-medium text-slate-500">
                      {property.city} / {property.district} / {property.neighborhood}
                    </span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{property.title}</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {formatPrice(property.price)} • {property.type} • {property.rooms}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Danışman: {advisorMap.get(property.advisorId) ?? "Atanmamış"}
                  </p>
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
