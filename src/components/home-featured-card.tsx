import Image from "next/image";
import Link from "next/link";

import { PriceText } from "@/components/price-text";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { propertyTitleForLanguage } from "@/lib/property-content";
import { translatePropertyType, translateRoomLabel } from "@/lib/site-copy";
import type { SiteLanguage } from "@/lib/site-preferences";
import type { Property } from "@/lib/types";

type HomeFeaturedCardProps = {
  property: Property;
  language: SiteLanguage;
};

const featuredCardCopy = {
  TR: {
    details: "Detayı Aç",
    startingPrice: "Başlangıç",
    photos: "fotoğraf",
  },
  EN: {
    details: "Open Details",
    startingPrice: "Starting",
    photos: "photos",
  },
  RU: {
    details: "Открыть",
    startingPrice: "Старт",
    photos: "фото",
  },
  AR: {
    details: "عرض التفاصيل",
    startingPrice: "السعر الابتدائي",
    photos: "صور",
  },
} as const;

export function HomeFeaturedCard({ property, language }: HomeFeaturedCardProps) {
  const copy = featuredCardCopy[language];
  const propertyTitle = propertyTitleForLanguage(property, language);
  const image = property.coverImage || property.galleryImages[0] || "/next.svg";
  const photoCount = 1 + property.galleryImages.filter((item) => item.trim().length > 0).length;

  return (
    <Link
      href={`/ilan/${property.slug}`}
      className="group block overflow-hidden rounded-[1.45rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,#fffdfa_0%,#fbf7f0_100%)] shadow-[0_24px_46px_-34px_rgba(24,20,14,0.28)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_54px_-36px_rgba(18,24,36,0.34)]"
    >
      <div className="relative aspect-[4/2.55] overflow-hidden bg-[#d8cab5]">
        <Image
          src={image}
          alt={propertyTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          unoptimized={isUnoptimizedImageSrc(image)}
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,14,21,0.06)_0%,rgba(9,14,21,0.18)_48%,rgba(9,14,21,0.58)_100%)]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/26 bg-[rgba(8,14,22,0.54)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {translatePropertyType(property.type, language)}
          </span>
          <span className="rounded-full border border-white/26 bg-white/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {property.city}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-full border border-white/26 bg-[rgba(8,14,22,0.54)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {photoCount} {copy.photos}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--brand-accent-strong)]">
              {property.listingRef}
            </p>
            <h3 className="mt-2 text-[1.15rem] leading-6 font-semibold text-[var(--ink-950)]">
              {propertyTitle}
            </h3>
          </div>
        </div>

        <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--ink-500)]">
          {property.neighborhood} / {property.district}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            {translateRoomLabel(property.rooms, language)}
          </span>
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            {property.areaM2} m²
          </span>
          <span className="rounded-full bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--brand-primary)]">
            {property.city}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-[rgba(220,208,189,0.72)] pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.startingPrice}
            </p>
            <p className="mt-1 text-[1.28rem] font-semibold text-[var(--brand-primary)]">
              <PriceText amount={property.price} />
            </p>
          </div>

          <span className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--brand-accent-strong)]">
            {copy.details}
            <span aria-hidden className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </Link>
  );
}
