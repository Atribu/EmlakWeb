"use client";

import Link from "next/link";

import { useSitePreferences } from "@/components/use-site-preferences";
import { footerCopy } from "@/lib/site-copy";

const SOCIAL_LINKS = [
  { href: "https://instagram.com/portfoysatis", label: "Instagram", icon: "instagram" as const },
  { href: "https://t.me/portfoysatis", label: "Telegram", icon: "telegram" as const },
  { href: "https://wa.me/905321112233", label: "WhatsApp", icon: "whatsapp" as const },
];

const footerMetaCopy = {
  TR: { directLine: "Hızlı Hat" },
  EN: { directLine: "Direct Line" },
  RU: { directLine: "Прямая линия" },
  AR: { directLine: "خط مباشر" },
} as const;

function SocialIcon({ type }: { type: "instagram" | "telegram" | "whatsapp" }) {
  if (type === "telegram") {
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

  if (type === "whatsapp") {
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

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden>
      <rect x="3.75" y="3.75" width="16.5" height="16.5" rx="4.25" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3.6" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.1" cy="6.9" r="1" fill="currentColor" />
    </svg>
  );
}

export function SiteFooter() {
  const { language } = useSitePreferences();
  const copy = footerCopy(language);
  const metaCopy = footerMetaCopy[language];
  const footerLinks = [
    { href: "/", label: copy.links.home },
    { href: "/portfoyler", label: copy.links.listings },
    { href: "/blog", label: copy.links.blog },
    { href: "/harita", label: copy.links.map },
    { href: "/hizmetler", label: copy.links.services },
    { href: "/danismanlar", label: copy.links.advisors },
    { href: "/hakkimizda", label: copy.links.about },
    { href: "/iletisim", label: copy.links.contact },
  ];

  return (
    <footer className="frame mt-[4.5rem] overflow-hidden rounded-[2rem] border border-[var(--line-strong)] bg-[linear-gradient(180deg,rgba(255,253,248,0.98)_0%,rgba(248,243,235,0.96)_100%)] px-5 py-6 text-[var(--ink-600)] shadow-[0_34px_70px_-56px_rgba(23,31,44,0.28)] sm:px-7 sm:py-7 lg:px-8 lg:py-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,var(--brand-primary)_0%,#315682_100%)] text-lg font-semibold text-white shadow-[0_18px_34px_-26px_rgba(29,56,92,0.62)]">
              PS
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-strong)]">PortföySatış</p>
              <p className="mt-1 text-[1.3rem] font-semibold text-[var(--brand-primary)]">Signature Estates</p>
            </div>
          </div>

          <p className="mt-4 max-w-xl text-[1rem] leading-8 text-[var(--ink-600)]">{copy.tagline}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((item) => (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-3 rounded-full border border-[var(--line-strong)] bg-white px-4 text-sm font-semibold text-[var(--brand-primary)] shadow-[0_20px_34px_-28px_rgba(22,32,48,0.28)] transition hover:-translate-y-0.5 hover:border-[var(--brand-accent)] hover:bg-[rgba(29,56,92,0.04)]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[rgba(29,56,92,0.08)] text-[var(--brand-accent-strong)]">
                  <SocialIcon type={item.icon} />
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
          <nav className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            {footerLinks.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-[var(--brand-primary)]">
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="rounded-[1.5rem] border border-[var(--line-strong)] bg-white/92 p-4 shadow-[0_20px_34px_-28px_rgba(22,32,48,0.28)]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-strong)]">{metaCopy.directLine}</p>
            <a href="tel:+905321234567" className="mt-3 block text-lg font-semibold text-[var(--brand-primary)]">
              +90 532 123 45 67
            </a>
            <a href="mailto:hello@portfoysatis.com" className="mt-2 block text-sm text-[var(--ink-600)]">
              hello@portfoysatis.com
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-[rgba(220,208,189,0.72)] pt-4 text-sm">
        <p suppressHydrationWarning>
          © {new Date().getFullYear()} PortföySatış. {copy.copyright}
        </p>
      </div>
    </footer>
  );
}
