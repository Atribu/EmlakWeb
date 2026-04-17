"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState, type KeyboardEvent, type MouseEvent } from "react";

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
    previousImage: "Önceki fotoğraf",
    nextImage: "Sonraki fotoğraf",
  },
  EN: {
    details: "Open Details",
    startingPrice: "Starting",
    photos: "photos",
    previousImage: "Previous photo",
    nextImage: "Next photo",
  },
  RU: {
    details: "Открыть",
    startingPrice: "Старт",
    photos: "фото",
    previousImage: "Предыдущее фото",
    nextImage: "Следующее фото",
  },
  AR: {
    details: "عرض التفاصيل",
    startingPrice: "السعر الابتدائي",
    photos: "صور",
    previousImage: "الصورة السابقة",
    nextImage: "الصورة التالية",
  },
} as const;

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
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

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path
        d="M10 16c2.6-2.87 4-5.12 4-6.95A4 4 0 1 0 6 9.05C6 10.88 7.4 13.13 10 16Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="9" r="1.35" fill="currentColor" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path
        d="M10 16.2 4.85 11.1a3.35 3.35 0 1 1 4.74-4.73L10 6.78l.41-.41a3.35 3.35 0 0 1 4.74 4.73L10 16.2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatIcon({ type }: { type: "rooms" | "area" | "type" }) {
  if (type === "area") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M5 5h3M12 5h3M5 15h3M12 15h3M5 5v3M5 12v3M15 5v3M15 12v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <rect x="7.25" y="7.25" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      </svg>
    );
  }

  if (type === "type") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
        <path d="M4.75 6.25h10.5M4.75 10h10.5M4.75 13.75h6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M3.5 10.25h13v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 14.25V7.75A1.75 1.75 0 0 1 5.25 6h9.5A1.75 1.75 0 0 1 16.5 7.75v6.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10.25V8.75A1.25 1.25 0 0 1 7.25 7.5h1.85a1.25 1.25 0 0 1 1.25 1.25v1.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function HomeFeaturedCard({ property, language }: HomeFeaturedCardProps) {
  const router = useRouter();
  const copy = featuredCardCopy[language];
  const propertyTitle = propertyTitleForLanguage(property, language);
  const gallery = useMemo(() => {
    const images = [property.coverImage, ...property.galleryImages].filter((image) => Boolean(image?.trim()));
    return Array.from(new Set(images));
  }, [property.coverImage, property.galleryImages]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const activeImage = gallery[activeImageIndex] ?? property.coverImage ?? "/next.svg";
  const photoCount = Math.max(1, gallery.length);

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

  function navigateToDetail() {
    router.push(`/ilan/${property.slug}`);
  }

  function shouldIgnoreCardNavigation(target: EventTarget | null) {
    return target instanceof HTMLElement && Boolean(target.closest("button"));
  }

  function handleCardClick(event: MouseEvent<HTMLElement>) {
    if (shouldIgnoreCardNavigation(event.target)) {
      return;
    }

    navigateToDetail();
  }

  function handleCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (shouldIgnoreCardNavigation(event.target)) {
      return;
    }

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigateToDetail();
    }
  }

  return (
    <article
      tabIndex={0}
      role="link"
      aria-label={`${propertyTitle} ${copy.details}`}
      onClick={handleCardClick}
      onKeyDown={handleCardKeyDown}
      className="group block cursor-pointer overflow-hidden rounded-[1.55rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,#fffdfa_0%,#fbf7f0_100%)] shadow-[0_24px_46px_-34px_rgba(24,20,14,0.24)] outline-none transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_54px_-36px_rgba(18,24,36,0.28)] focus-visible:ring-2 focus-visible:ring-[rgba(201,124,78,0.38)]"
    >
      <div className="relative aspect-[4/2.55] overflow-hidden bg-[#d8cab5]">
        <Image
          src={activeImage}
          alt={propertyTitle}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
          unoptimized={isUnoptimizedImageSrc(activeImage)}
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,14,21,0.06)_0%,rgba(9,14,21,0.18)_48%,rgba(9,14,21,0.58)_100%)]" />

        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          <span className="rounded-full border border-white/26 bg-[rgba(8,14,22,0.54)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-sm">
            {translatePropertyType(property.type, language)}
          </span>
        </div>

        <div className="absolute right-3 top-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-[rgba(8,14,22,0.42)] text-white backdrop-blur-sm">
            <HeartIcon />
          </span>
        </div>

        <div className="absolute bottom-3 right-3 rounded-full border border-white/26 bg-[rgba(8,14,22,0.54)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white backdrop-blur-sm">
          {photoCount} {copy.photos}
        </div>

        {gallery.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => stepGallery(-1)}
              aria-label={copy.previousImage}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/34 bg-[#0d1219]/38 text-white backdrop-blur transition hover:bg-[#0d1219]/58"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => stepGallery(1)}
              aria-label={copy.nextImage}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/34 bg-[#0d1219]/38 text-white backdrop-blur transition hover:bg-[#0d1219]/58"
            >
              <ArrowIcon direction="right" />
            </button>
          </>
        ) : null}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-[var(--ink-500)]">
              <PinIcon />
              <span>{property.city} / {property.district}</span>
            </p>
            <h3 className="mt-2 line-clamp-2 text-[1.02rem] leading-5 font-semibold text-[var(--ink-950)]">
              {propertyTitle}
            </h3>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[var(--ink-500)]">
          <div className="flex items-center gap-1.5">
            <StatIcon type="rooms" />
            <span>{translateRoomLabel(property.rooms, language)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatIcon type="area" />
            <span>{property.areaM2} m²</span>
          </div>
          <div className="flex items-center gap-1.5">
            <StatIcon type="type" />
            <span className="truncate">{property.neighborhood}</span>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-3 border-t border-[rgba(220,208,189,0.72)] pt-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
              {copy.startingPrice}
            </p>
            <p className="mt-1 text-[1.18rem] font-semibold text-[var(--brand-primary)]">
              <PriceText amount={property.price} />
            </p>
          </div>

          <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[var(--brand-accent-strong)]">
            {copy.details}
            <span aria-hidden className="transition group-hover:translate-x-1">
              →
            </span>
          </span>
        </div>
      </div>
    </article>
  );
}
