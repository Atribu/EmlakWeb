import Link from "next/link";

import { formatPhoneForHref, formatPrice } from "@/lib/format";
import { getProjectMeta } from "@/lib/project-meta";
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

  const projectMeta = getProjectMeta(property);

  return (
    <article className="luxury-card soft-raise group overflow-hidden">
      <div className="relative h-56 overflow-hidden">
        <div
          className="absolute inset-0 scale-100 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${property.coverImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#17130d]/85 via-[#17130d]/20 to-transparent" />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between text-xs">
          <span className="rounded-full border border-white/35 bg-white/15 px-2.5 py-1 font-semibold uppercase tracking-[0.15em] text-white backdrop-blur">
            {projectMeta.launchType}
          </span>
          <span className="rounded-full bg-black/35 px-2.5 py-1 font-semibold uppercase tracking-[0.12em] text-white/90">
            {property.listingRef}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h2 className="line-clamp-2 text-[1.45rem] font-semibold leading-tight">{property.title}</h2>
          <p className="mt-1 text-sm text-white/75">
            {property.neighborhood}, {property.city}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#5b5247]">
          <div className="rounded-xl border border-[#e4dbc9] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9b8e7b]">Tip</p>
            <p className="mt-1 font-semibold">{property.type}</p>
          </div>
          <div className="rounded-xl border border-[#e4dbc9] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9b8e7b]">Oda</p>
            <p className="mt-1 font-semibold">{property.rooms}</p>
          </div>
          <div className="rounded-xl border border-[#e4dbc9] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9b8e7b]">m²</p>
            <p className="mt-1 font-semibold">{property.areaM2}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-[#6a604f]">
          <div className="rounded-xl border border-[#e4dbc9] bg-[#fbf7ef] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9b8d77]">Ödeme Planı</p>
            <p className="mt-1 font-semibold text-[#4f4538]">{projectMeta.paymentPlan}</p>
          </div>
          <div className="rounded-xl border border-[#e4dbc9] bg-[#fbf7ef] px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.14em] text-[#9b8d77]">Teslim</p>
            <p className="mt-1 font-semibold text-[#4f4538]">{projectMeta.deliveryDate}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#e2d4bf] bg-[#f8f2e8] px-3 py-2">
          <p className="text-xl font-semibold text-[#5a4422]">{formatPrice(property.price)}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#8b6a39]">Satılık</p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={`/ilan/${property.slug}`}
            className="rounded-full bg-[#1f1a14] px-4 py-2 font-semibold text-white transition hover:bg-black"
          >
            İlanı İncele
          </Link>
          {phoneHref ? (
            <a
              href={phoneHref}
              className="rounded-full border border-[#d6cab7] bg-white px-4 py-2 font-semibold text-[#544b3f] transition hover:bg-[#f5ede0]"
            >
              Ara
            </a>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#b8d9c4] bg-[#ebf8ef] px-4 py-2 font-semibold text-[#2f7d4b] transition hover:bg-[#def2e5]"
            >
              WhatsApp
            </a>
          ) : null}
        </div>

        {advisor ? (
          <p className="text-xs text-[#7b705f]">
            Danışman: <span className="font-semibold text-[#3f372d]">{advisor.name}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
