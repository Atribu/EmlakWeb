"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { propertyDetailGalleryCopy } from "@/lib/site-copy";

type ImageLightboxProps = {
  images: string[];
  imageLabels?: string[];
  title: string;
  initialIndex: number;
  onClose: () => void;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-6 w-6" aria-hidden>
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

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="m5.5 5.5 9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function ImageLightbox({
  images,
  imageLabels = [],
  title,
  initialIndex,
  onClose,
}: ImageLightboxProps) {
  const { language } = useSitePreferences();
  const copy = propertyDetailGalleryCopy(language);
  const gallery = useMemo(
    () => Array.from(new Set(images.filter((image) => Boolean(image?.trim())))),
    [images],
  );
  const safeInitialIndex = Math.min(Math.max(initialIndex, 0), Math.max(gallery.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(safeInitialIndex);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (gallery.length <= 1) {
        return;
      }

      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActiveIndex((current) => (current === 0 ? gallery.length - 1 : current - 1));
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        setActiveIndex((current) => (current === gallery.length - 1 ? 0 : current + 1));
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [gallery.length, onClose]);

  if (gallery.length === 0) {
    return null;
  }

  const activeImage = gallery[activeIndex] ?? gallery[0];
  const activeLabel =
    imageLabels[activeIndex - 1] ??
    (activeIndex === 0 ? copy.cover : `${copy.image} ${activeIndex + 1}`);

  function step(direction: -1 | 1) {
    if (gallery.length <= 1) {
      return;
    }

    setActiveIndex((current) => {
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
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#05070bcc]/95 p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
    >
      <div
        className="relative flex h-full max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-[1.5rem] border border-white/12 bg-[#0b1118] shadow-[0_40px_110px_-42px_rgba(0,0,0,0.85)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 text-white sm:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">{title}</p>
            <p className="mt-1 text-xs text-white/65">
              {activeLabel} • {activeIndex + 1} / {gallery.length}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-white/8 text-white transition hover:bg-white/14"
            aria-label={copy.close}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 bg-[#05070b]">
          <Image
            src={activeImage}
            alt={`${title} - ${activeLabel}`}
            fill
            unoptimized={isUnoptimizedImageSrc(activeImage)}
            sizes="100vw"
            className="object-contain"
            priority
          />

          {gallery.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={copy.previous}
                className="absolute left-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-[#0b1118]/72 text-white backdrop-blur transition hover:bg-[#0b1118]"
              >
                <ArrowIcon direction="left" />
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={copy.next}
                className="absolute right-3 top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/18 bg-[#0b1118]/72 text-white backdrop-blur transition hover:bg-[#0b1118]"
              >
                <ArrowIcon direction="right" />
              </button>
            </>
          ) : null}
        </div>

        {gallery.length > 1 ? (
          <div className="grid max-h-[7.5rem] grid-cols-4 gap-2 overflow-x-auto border-t border-white/10 bg-[#0b1118] p-3 sm:grid-cols-6 lg:grid-cols-8">
            {gallery.map((image, index) => {
              const label = imageLabels[index - 1] ?? (index === 0 ? copy.cover : `${copy.image} ${index + 1}`);

              return (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`relative overflow-hidden rounded-xl border transition ${
                    index === activeIndex
                      ? "border-[#d5b27b] ring-2 ring-[#d5b27b]/45"
                      : "border-white/12 hover:border-white/28"
                  }`}
                  aria-label={label}
                >
                  <div className="relative h-16 w-full min-w-[4.5rem]">
                    <Image
                      src={image}
                      alt={`${title} ${label}`}
                      fill
                      unoptimized={isUnoptimizedImageSrc(image)}
                      sizes="120px"
                      className="object-cover"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
