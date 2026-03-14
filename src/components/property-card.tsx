import Link from "next/link";

import { formatPhoneForHref, formatPrice } from "@/lib/format";
import type { Advisor, Property } from "@/lib/types";

type PropertyCardProps = {
  property: Property;
  advisor?: Advisor;
};

export function PropertyCard({ property, advisor }: PropertyCardProps) {
  const phoneHref = advisor ? `tel:${formatPhoneForHref(advisor.phone)}` : undefined;
  const whatsappHref = advisor
    ? `https://wa.me/${formatPhoneForHref(advisor.whatsapp)}?text=${encodeURIComponent(
        `${property.title} ilanı hakkında bilgi almak istiyorum.`,
      )}`
    : undefined;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="h-32 p-5 text-white" style={{ background: property.coverColor }}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">{property.listingRef}</p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">{property.title}</h2>
      </div>

      <div className="space-y-4 p-5">
        <div className="grid grid-cols-2 gap-3 text-sm text-slate-600">
          <p>
            <span className="block text-xs text-slate-400">Bölge</span>
            {property.city} / {property.district}
          </p>
          <p>
            <span className="block text-xs text-slate-400">Mahalle</span>
            {property.neighborhood}
          </p>
          <p>
            <span className="block text-xs text-slate-400">Tip</span>
            {property.type}
          </p>
          <p>
            <span className="block text-xs text-slate-400">Oda</span>
            {property.rooms}
          </p>
        </div>

        <div className="rounded-xl bg-amber-50 px-3 py-2 text-lg font-semibold text-amber-900">
          {formatPrice(property.price)}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link
            href={`/ilan/${property.slug}`}
            className="rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white transition hover:bg-slate-700"
          >
            Detayı Gör
          </Link>
          {phoneHref ? (
            <a href={phoneHref} className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Ara
            </a>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-emerald-700 transition hover:bg-emerald-100"
            >
              WhatsApp
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
