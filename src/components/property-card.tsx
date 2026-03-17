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
    <article className="luxury-card soft-raise group overflow-hidden">
      <div className="relative h-60 overflow-hidden">
        <div
          className="absolute inset-0 scale-100 bg-cover bg-center transition duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${property.coverImage})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#10161f]/82 via-[#10161f]/24 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(205,167,107,0.22),transparent_44%)]" />

        <div className="absolute left-3 right-3 top-3 flex items-center justify-between">
          <span className="rounded-full border border-white/28 bg-[#0f1520]/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#f4e1c0] backdrop-blur">
            {property.type}
          </span>
          <span className="rounded-full border border-white/30 bg-[#0e1219]/65 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
            {property.listingRef}
          </span>
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <h3 className="line-clamp-2 text-[1.52rem] font-semibold leading-tight">{property.title}</h3>
          <p className="mt-1 text-sm text-[#ece1d0]">
            {property.city} / {property.district} / {property.neighborhood}
          </p>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-2 text-center text-xs text-[#6d6458]">
          <div className="rounded-xl border border-[#e4d8c6] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#a09179]">Oda</p>
            <p className="mt-1 font-semibold text-[#2f281f]">{property.rooms}</p>
          </div>
          <div className="rounded-xl border border-[#e4d8c6] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#a09179]">m²</p>
            <p className="mt-1 font-semibold text-[#2f281f]">{property.areaM2}</p>
          </div>
          <div className="rounded-xl border border-[#e4d8c6] bg-white px-2 py-2">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#a09179]">Isıtma</p>
            <p className="mt-1 font-semibold text-[#2f281f]">{property.heating}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-[#e2d1b5] bg-[linear-gradient(135deg,#fcf8ef,#f3e8d4)] px-3 py-2">
          <p className="text-[1.45rem] font-semibold text-[#5a4423]">{formatPrice(property.price)}</p>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8f6d3d]">Satılık</p>
        </div>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href={`/ilan/${property.slug}`}
            className="rounded-full bg-[#17140f] px-4 py-2 font-semibold text-white transition hover:bg-black"
          >
            İncele
          </Link>
          {phoneHref ? (
            <a
              href={phoneHref}
              className="rounded-full border border-[#d6c5a8] bg-white px-4 py-2 font-semibold text-[#4f4435] transition hover:bg-[#f6edde]"
            >
              Ara
            </a>
          ) : null}
          {whatsappHref ? (
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-[#b7dcc5] bg-[#ebf8ef] px-4 py-2 font-semibold text-[#2f7d4b] transition hover:bg-[#def2e5]"
            >
              WhatsApp
            </a>
          ) : null}
        </div>

        {advisor ? (
          <p className="text-xs text-[#7f7364]">
            Danışman: <span className="font-semibold text-[#40362b]">{advisor.name}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}
