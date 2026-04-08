"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";

import { dockCopy } from "@/lib/site-preferences";

import { useSitePreferences } from "@/components/use-site-preferences";

const CHANNELS = {
  whatsappPhone: "+905321112233",
  telegramUrl: "https://t.me/portfoysatis",
  instagramUrl: "https://instagram.com/portfoysatis",
};

function formatPhoneForHref(value: string) {
  return value.replace(/\D/g, "");
}

function FloatingButton({
  href,
  label,
  accent,
  children,
}: {
  href: string;
  label: string;
  accent: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      title={label}
      className={`group relative flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-white/18 ${accent} text-white shadow-[0_22px_42px_-22px_rgba(0,0,0,0.48)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.02]`}
    >
      {children}
      <span className="pointer-events-none absolute right-[calc(100%+0.8rem)] rounded-full border border-[#dac39d] bg-[#fffaf1] px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-[#35291d] opacity-0 shadow-[0_16px_30px_-26px_rgba(30,24,17,0.8)] transition duration-200 group-hover:opacity-100">
        {label}
      </span>
    </a>
  );
}

function MobileDockButton({
  label,
  accent,
  onClick,
  href,
  children,
}: {
  label: string;
  accent: string;
  onClick?: () => void;
  href?: string;
  children: ReactNode;
}) {
  const className = `flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-[1rem] px-2 text-center text-[11px] font-semibold ${accent} text-white shadow-[0_20px_36px_-24px_rgba(0,0,0,0.35)] transition active:scale-[0.98]`;

  if (href) {
    return (
      <a href={href} target="_blank" rel="noreferrer" aria-label={label} className={className}>
        {children}
        <span>{label}</span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-label={label} className={className}>
      {children}
      <span>{label}</span>
    </button>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="M20 11.97a7.98 7.98 0 0 1-11.79 7l-3.21 1 1.05-3.12A8 8 0 1 1 20 11.97Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.45 8.9c.18-.41.38-.42.56-.43.14-.01.3-.01.45-.01.15 0 .4.06.61.52.21.46.73 1.58.79 1.7.06.12.1.26.02.42-.08.16-.12.25-.24.39-.12.14-.25.31-.35.42-.12.12-.25.25-.1.49.15.24.65 1.07 1.4 1.74.96.85 1.76 1.11 2 .23.08-.17.37-.42.59-.42.22 0 .44.01.63.12.19.11 1.23.58 1.44.68.21.1.35.16.4.26.05.1.05.57-.13 1.12-.18.55-1.04 1.07-1.44 1.13-.37.06-.83.09-1.34-.08-.3-.1-.68-.22-1.18-.43-2.08-.89-3.44-2.97-3.54-3.11-.1-.14-.84-1.12-.84-2.14 0-1.02.52-1.53.7-1.74Z"
        fill="currentColor"
      />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="m21.2 4.8-2.37 13.41c-.18.95-.66 1.19-1.33.74l-3.68-2.72-1.78 1.72c-.2.2-.37.37-.76.37l.26-3.74 6.8-6.15c.3-.26-.06-.41-.46-.14l-8.4 5.29-3.62-1.13c-.79-.25-.8-.79.16-1.17L19.6 4.1c.64-.24 1.2.14 1 .7Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <path
        d="m12 3 1.84 4.9L19 9.75l-4.11 2.3L13.6 17 12 13.65 10.4 17l-1.29-4.95L5 9.75l5.16-1.85L12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const hiddenPrefixes = ["/yonetim-ofisi", "/giris", "/yetkili-giris", "/panel"];

export function FloatingContactDock() {
  const pathname = usePathname();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const { language } = useSitePreferences();
  const copy = dockCopy(language);

  const shouldHide = useMemo(
    () => hiddenPrefixes.some((prefix) => pathname?.startsWith(prefix)),
    [pathname],
  );

  if (shouldHide) {
    return null;
  }

  const whatsappText = encodeURIComponent(copy.whatsappPrefill);
  const whatsappHref = `https://wa.me/${formatPhoneForHref(CHANNELS.whatsappPhone)}?text=${whatsappText}`;

  return (
    <div className="pointer-events-none fixed right-3 bottom-3 left-3 z-[80] flex flex-col items-end gap-3 sm:right-6 sm:bottom-6 sm:left-auto">
      {isAssistantOpen ? (
        <div className="pointer-events-auto w-full max-w-[21rem] overflow-hidden rounded-[1.35rem] border border-[#dbc7a3] bg-[#fffaf2] shadow-[0_28px_66px_-30px_rgba(16,12,8,0.55)] sm:w-[min(92vw,21rem)]">
          <div className="bg-[linear-gradient(135deg,#101b27_0%,#172738_58%,#1f3245_100%)] px-5 py-4 text-[#f7ecda]">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#dfc18f]">
                  {copy.assistantIntro}
                </p>
                <p className="mt-2 text-lg font-semibold">{copy.assistantTitle}</p>
                <p className="mt-1 text-sm leading-6 text-[#d8c9ae]">
                  {copy.assistantBody}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAssistantOpen(false)}
                className="rounded-full border border-white/15 px-2.5 py-1 text-xs font-semibold text-[#efe0c1] transition hover:bg-white/10"
              >
                {copy.close}
              </button>
            </div>
          </div>

          <div className="space-y-3 px-5 py-4">
            <p className="text-sm leading-6 text-[#554a3d]">
              {copy.assistantQuickLinks}
            </p>

            <div className="grid gap-2">
              <Link
                href="/emlak-sat?intent=sat"
                className="rounded-2xl border border-[#e2d4bf] bg-white px-4 py-3 text-left transition hover:bg-[#fbf5ea]"
              >
                <p className="text-sm font-semibold text-[#231d17]">{copy.sellTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[#6a5f50]">{copy.sellText}</p>
              </Link>

              <Link
                href="/iletisim"
                className="rounded-2xl border border-[#e2d4bf] bg-white px-4 py-3 text-left transition hover:bg-[#fbf5ea]"
              >
                <p className="text-sm font-semibold text-[#231d17]">{copy.advisorTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[#6a5f50]">{copy.advisorText}</p>
              </Link>

              <Link
                href="/portfoyler"
                className="rounded-2xl border border-[#e2d4bf] bg-white px-4 py-3 text-left transition hover:bg-[#fbf5ea]"
              >
                <p className="text-sm font-semibold text-[#231d17]">{copy.listingsTitle}</p>
                <p className="mt-1 text-xs leading-5 text-[#6a5f50]">{copy.listingsText}</p>
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto hidden flex-col items-end gap-2 sm:flex">
        <FloatingButton href={CHANNELS.instagramUrl} label={copy.instagram} accent="bg-[linear-gradient(135deg,#6f2dbd_0%,#d62976_55%,#f77737_100%)]">
          <InstagramIcon />
        </FloatingButton>

        <FloatingButton href={CHANNELS.telegramUrl} label={copy.telegram} accent="bg-[linear-gradient(135deg,#1d8fff_0%,#2aa3ff_100%)]">
          <TelegramIcon />
        </FloatingButton>

        <button
          type="button"
          aria-label={copy.quickMessage}
          title={copy.quickMessage}
          onClick={() => setIsAssistantOpen((current) => !current)}
          className="group relative flex h-14 w-14 items-center justify-center rounded-[1.1rem] border border-white/18 bg-[linear-gradient(135deg,#14202d_0%,#24384c_100%)] text-white shadow-[0_22px_42px_-22px_rgba(0,0,0,0.48)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:scale-[1.02]"
        >
          <SparkIcon />
          <span className="pointer-events-none absolute right-[calc(100%+0.8rem)] rounded-full border border-[#dac39d] bg-[#fffaf1] px-3 py-1 text-[11px] font-semibold whitespace-nowrap text-[#35291d] opacity-0 shadow-[0_16px_30px_-26px_rgba(30,24,17,0.8)] transition duration-200 group-hover:opacity-100">
            {copy.quickMessage}
          </span>
        </button>

        <FloatingButton href={whatsappHref} label={copy.whatsapp} accent="bg-[linear-gradient(135deg,#1ca84f_0%,#25d366_100%)]">
          <WhatsAppIcon />
        </FloatingButton>
      </div>

      <div className="pointer-events-auto w-full sm:hidden">
        <div className="grid grid-cols-4 gap-2 rounded-[1.35rem] border border-[rgba(220,208,189,0.9)] bg-[rgba(255,252,247,0.96)] p-2 shadow-[0_28px_54px_-30px_rgba(16,23,34,0.24)] backdrop-blur">
          <MobileDockButton label={copy.instagram} href={CHANNELS.instagramUrl} accent="bg-[linear-gradient(135deg,#6f2dbd_0%,#d62976_55%,#f77737_100%)]">
            <InstagramIcon />
          </MobileDockButton>

          <MobileDockButton label={copy.telegram} href={CHANNELS.telegramUrl} accent="bg-[linear-gradient(135deg,#1d8fff_0%,#2aa3ff_100%)]">
            <TelegramIcon />
          </MobileDockButton>

          <MobileDockButton
            label={copy.quickMessage}
            onClick={() => setIsAssistantOpen((current) => !current)}
            accent="bg-[linear-gradient(135deg,#14202d_0%,#24384c_100%)]"
          >
            <SparkIcon />
          </MobileDockButton>

          <MobileDockButton label={copy.whatsapp} href={whatsappHref} accent="bg-[linear-gradient(135deg,#1ca84f_0%,#25d366_100%)]">
            <WhatsAppIcon />
          </MobileDockButton>
        </div>
      </div>
    </div>
  );
}
