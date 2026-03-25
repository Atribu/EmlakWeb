"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { formatPhoneForHref, formatPrice } from "@/lib/format";
import type { Advisor, Property } from "@/lib/types";

type PropertyCardProps = {
  property: Property;
  advisor?: Advisor;
};

type MetricProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

function truncateText(value: string, limit: number) {
  if (value.length <= limit) {
    return value;
  }

  return `${value.slice(0, limit).trimEnd()}...`;
}

function Metric({ icon, label, value }: MetricProps) {
  return (
    <div className="flex items-center gap-2 border-r border-dashed border-[#d9d1c5] pr-4 last:border-r-0 last:pr-0">
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ddd0c0] bg-[#f7f2ea] text-[#5b4a36]">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8f8374]">{label}</p>
        <p className="text-sm font-semibold text-[#2a241d]">{value}</p>
      </div>
    </div>
  );
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d={direction === "left" ? "M11.75 4.5 6.25 10l5.5 5.5" : "M8.25 4.5 13.75 10l-5.5 5.5"}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BedIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M3.25 10.5h13.5v4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.25 14.75V7.25A1.75 1.75 0 0 1 5 5.5h10A1.75 1.75 0 0 1 16.75 7.25v7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.5V8.75A1.25 1.25 0 0 1 7.25 7.5h2A1.25 1.25 0 0 1 10.5 8.75v1.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function AreaIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M5 5h3M12 5h3M5 15h3M12 15h3M5 5v3M5 12v3M15 5v3M15 12v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <rect x="7.5" y="7.5" width="5" height="5" rx="1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FloorIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M4.5 16.25V7.5L10 3.75l5.5 3.75v8.75" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.75 16.25v-4h4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ContactIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M3.75 5.5h12.5v9H3.75z" stroke="currentColor" strokeWidth="1.4" />
      <path d="m4.5 6.25 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5.5 6.5h2L8.5 5h3l1 1.5h2A1.5 1.5 0 0 1 16 8v6a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 4 14V8a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="10" cy="11" r="2.6" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function PropertyCard({ property, advisor }: PropertyCardProps) {
  const gallery = useMemo(() => {
    const images = [property.coverImage, ...property.galleryImages].filter((image) => Boolean(image?.trim()));
    return Array.from(new Set(images));
  }, [property.coverImage, property.galleryImages]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const activeImage = gallery[activeImageIndex] ?? property.coverImage;
  const locationLabel = `${property.neighborhood} - ${property.district} - ${property.city}`.toLocaleUpperCase("tr");
  const quickHref =
    advisor
      ? `https://wa.me/${formatPhoneForHref(advisor.whatsapp)}?text=${encodeURIComponent(
          `${property.title} ilanı hakkında hızlı bilgi almak istiyorum.`,
        )}`
      : undefined;
  const phoneHref = advisor ? `tel:${formatPhoneForHref(advisor.phone)}` : undefined;

  function stepGallery(direction: -1 | 1) {
    if (gallery.length <= 1) {
      return;
    }

    setActiveImageIndex((current) => {
      const next = current + direction;
      if (next < 0) {
        return gallery.length - 1;
      }

      if (next >= gallery.length) {
        return 0;
      }

      return next;
    });
  }

  return (
    <article className="overflow-hidden rounded-[1.35rem] border border-[#dbcfbf] bg-[linear-gradient(180deg,#fffdfa_0%,#fbf7f0_100%)] shadow-[0_26px_52px_-36px_rgba(33,27,19,0.32)]">
      <div className="grid min-w-0 lg:grid-cols-[420px_minmax(0,1fr)]">
        <div className="relative min-h-[280px] overflow-hidden bg-[#d8cab5] lg:min-h-full">
          <div
            className="absolute inset-0 bg-cover bg-center transition duration-500"
            style={{ backgroundImage: `url(${activeImage})` }}
            aria-hidden
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#10161d]/18 via-transparent to-[#10161d]/12" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11161d]/38 to-transparent" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/40 bg-[#0d1117]/56 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {property.type}
            </span>
            <span className="rounded-full border border-white/36 bg-white/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {property.city}
            </span>
          </div>

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => stepGallery(-1)}
                aria-label="Önceki görsel"
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/42 bg-[#0b0f14]/34 text-white backdrop-blur transition hover:bg-[#0b0f14]/52"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => stepGallery(1)}
                aria-label="Sonraki görsel"
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/42 bg-[#0b0f14]/34 text-white backdrop-blur transition hover:bg-[#0b0f14]/52"
              >
                <ArrowIcon direction="right" />
              </button>
            </>
          ) : null}

          <div className="absolute bottom-3 left-3 rounded-full border border-white/30 bg-[#12171d]/60 px-3 py-1 text-xs font-semibold tracking-[0.08em] text-white backdrop-blur-sm">
            {property.listingRef}
          </div>

          <div className="absolute bottom-3 right-3 flex items-center gap-2 rounded-full border border-white/30 bg-[#12171d]/60 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
            <CameraIcon />
            <span>{gallery.length}</span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-4 border-b border-dashed border-[#d7cebf] pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="text-[1.55rem] leading-[1.1] font-semibold text-[#1e293b] sm:text-[1.75rem]">
                  {property.title}
                </h3>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#5d6168]">
                  {locationLabel}
                </p>
              </div>

              <div className="rounded-full border border-[#e3d7c8] bg-white px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8a7452]">
                Satılık Portföy
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <Metric icon={<BedIcon />} label="Oda" value={property.rooms} />
              <Metric icon={<AreaIcon />} label="Alan" value={`${property.areaM2} m²`} />
              <Metric icon={<FloorIcon />} label="Kat" value={property.floor} />
            </div>
          </div>

          <div className="border-b border-dashed border-[#d7cebf] py-4">
            <p className="text-[15px] leading-7 text-[#5f5548]">{truncateText(property.description, 185)}</p>
          </div>

          <div className="grid gap-4 border-b border-dashed border-[#d7cebf] py-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
            <div className="flex flex-wrap items-center gap-3">
              {advisor ? (
                <div className="flex items-center gap-3 rounded-full border border-[#eadfce] bg-white px-3 py-2 shadow-[0_16px_28px_-24px_rgba(38,28,18,0.45)]">
                  <div
                    className="h-11 w-11 rounded-full border border-[#ddceb8] bg-cover bg-center"
                    style={{ backgroundImage: `url(${advisor.image})` }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#90816e]">Danışman</p>
                    <p className="truncate text-sm font-semibold text-[#2f281f]">{advisor.name}</p>
                  </div>
                </div>
              ) : null}

              <div className="rounded-2xl border border-[#f1d3d5] bg-[#fff5f6] px-4 py-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#b34a51]">Portföy Tipi</p>
                <p className="mt-1 text-sm font-semibold text-[#8f262d]">{property.heating}</p>
              </div>
            </div>

            <div className="xl:text-right">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#7f6d5d]">Başlangıç Fiyatı</p>
              <p className="mt-1 text-[2rem] leading-none font-semibold text-[#d2232d] sm:text-[2.35rem]">
                {formatPrice(property.price)}
              </p>
            </div>
          </div>

          <div className="grid gap-3 pt-4 sm:grid-cols-2">
            {quickHref ? (
              <a
                href={quickHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[#cfd6df] bg-white px-5 py-3 text-sm font-semibold text-[#344256] transition hover:border-[#a9b5c4] hover:bg-[#f6f8fb]"
              >
                <ContactIcon />
                Hızlı İletişim
              </a>
            ) : phoneHref ? (
              <a
                href={phoneHref}
                className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[#cfd6df] bg-white px-5 py-3 text-sm font-semibold text-[#344256] transition hover:border-[#a9b5c4] hover:bg-[#f6f8fb]"
              >
                <ContactIcon />
                Hemen Ara
              </a>
            ) : (
              <Link
                href={`/ilan/${property.slug}`}
                className="inline-flex items-center justify-center gap-2 rounded-[1rem] border border-[#cfd6df] bg-white px-5 py-3 text-sm font-semibold text-[#344256] transition hover:border-[#a9b5c4] hover:bg-[#f6f8fb]"
              >
                <ContactIcon />
                Hızlı İletişim
              </Link>
            )}

            <Link
              href={`/ilan/${property.slug}`}
              className="inline-flex items-center justify-center rounded-[1rem] border border-[#e04f56] bg-white px-5 py-3 text-sm font-semibold tracking-[0.02em] text-[#cf1f2b] transition hover:bg-[#fff5f5]"
            >
              Detaylı Bilgi
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
