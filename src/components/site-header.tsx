"use client";

import Link from "next/link";

import { HeaderMarketControls } from "@/components/header-market-controls";
import { SiteHeaderAuth } from "@/components/site-header-auth";
import { useSitePreferences } from "@/components/use-site-preferences";
import { siteHeaderNavigationCopy } from "@/lib/site-copy";
import { headerCopy } from "@/lib/site-preferences";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  initialUser?: SafeUser | null;
};

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteHeader({ initialUser = null }: SiteHeaderProps) {
  const { language } = useSitePreferences();
  const copy = headerCopy(language);
  const navigation = siteHeaderNavigationCopy(language);

  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(220,208,189,0.72)] bg-[rgba(255,251,245,0.86)] backdrop-blur-xl">
      <div className="frame-wide px-2 sm:px-4">
        <div className="flex flex-col gap-2 border-b border-[rgba(220,208,189,0.72)] py-2 lg:flex-row lg:items-center lg:justify-between">
          <HeaderMarketControls />
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--ink-500)] lg:block">
            {copy.topMessage}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5">
          <Link href="/" className="flex items-center gap-3 leading-none text-[var(--brand-primary)]">
            <span className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,var(--brand-primary)_0%,#315682_100%)] text-lg font-semibold text-white shadow-[0_18px_34px_-26px_rgba(29,56,92,0.62)]">
              PS
            </span>
            <span className="block">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.27em] text-[var(--brand-accent-strong)]">PortföySatış</span>
              <span className="text-[1.3rem] font-semibold tracking-[0.025em] sm:text-[1.56rem]">Signature Estates</span>
            </span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[var(--ink-600)]">
            {navigation.menuGroups.map((group) => (
              <div key={group.href} className="group relative">
                <Link
                  href={group.href}
                  className="flex min-h-11 items-center gap-1 rounded-full px-4 py-2 transition hover:bg-[rgba(29,56,92,0.07)] hover:text-[var(--brand-primary)] focus-visible:bg-[rgba(29,56,92,0.07)] focus-visible:text-[var(--brand-primary)] focus-visible:outline-none"
                >
                  {group.label}
                  <ChevronIcon />
                </Link>

                <div className="pointer-events-none invisible absolute top-full left-1/2 z-30 w-max -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className={`overflow-hidden rounded-[1.35rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] shadow-[0_34px_70px_-34px_rgba(22,30,42,0.28)] backdrop-blur-xl ${group.panelClassName ?? "w-[30rem]"}`}>
                    <div className="border-b border-[rgba(220,208,189,0.72)] bg-[linear-gradient(135deg,rgba(201,124,78,0.08)_0%,rgba(29,56,92,0.03)_72%)] px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--brand-accent-strong)]">{group.label}</p>
                      <p className="mt-2 max-w-[26rem] text-sm leading-6 text-[var(--ink-600)]">{group.description}</p>
                    </div>

                    <div className="grid gap-2 p-3 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          className="rounded-[1rem] border border-[var(--line-strong)] bg-white px-4 py-3 transition hover:border-[var(--brand-accent)] hover:bg-[rgba(29,56,92,0.03)]"
                        >
                          <p className="text-[0.84rem] font-semibold tracking-[0.01em] text-[var(--brand-primary)]">{item.label}</p>
                          <p className="mt-1 text-xs leading-5 text-[var(--ink-500)]">{item.description}</p>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {navigation.directLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-full px-4 py-2 transition hover:bg-[rgba(29,56,92,0.07)] hover:text-[var(--brand-primary)] focus-visible:bg-[rgba(29,56,92,0.07)] focus-visible:text-[var(--brand-primary)] focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <details className="relative xl:hidden">
              <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand-primary)] shadow-[0_18px_36px_-30px_rgba(22,32,48,0.34)] transition hover:border-[var(--brand-accent)] [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </summary>

              <div className="absolute right-0 top-[calc(100%+0.9rem)] z-30 w-[min(92vw,26rem)] overflow-hidden rounded-[1.35rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] shadow-[0_34px_70px_-34px_rgba(22,30,42,0.28)] backdrop-blur-xl">
                <div className="border-b border-[rgba(220,208,189,0.72)] px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-strong)]">{navigation.mobileTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--ink-600)]">
                    {navigation.mobileDescription}
                  </p>
                </div>

                <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
                  {navigation.menuGroups.map((group) => (
                    <details key={group.href} className="rounded-[1rem] border border-[var(--line-strong)] bg-white">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold tracking-[0.03em] text-[var(--brand-primary)] [&::-webkit-details-marker]:hidden">
                        <span>{group.label}</span>
                        <ChevronIcon />
                      </summary>
                      <div className="grid gap-2 border-t border-[rgba(220,208,189,0.72)] px-3 py-3">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.href}-${item.href}-${item.label}`}
                            href={item.href}
                            className="rounded-[0.95rem] border border-[var(--line-strong)] bg-[rgba(29,56,92,0.03)] px-3 py-3 transition hover:bg-[rgba(29,56,92,0.06)]"
                          >
                            <p className="text-sm font-semibold text-[var(--brand-primary)]">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-[var(--ink-500)]">{item.description}</p>
                          </Link>
                        ))}
                      </div>
                    </details>
                  ))}

                  <div className="grid gap-2">
                    {navigation.directLinks.map((item) => (
                      <Link
                        key={`mobile-${item.href}`}
                        href={item.href}
                        className="rounded-[1rem] border border-[var(--line-strong)] bg-white px-4 py-3 text-sm font-semibold tracking-[0.03em] text-[var(--brand-primary)] transition hover:bg-[rgba(29,56,92,0.04)]"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </details>

            <SiteHeaderAuth initialUser={initialUser} />
          </div>
        </div>
      </div>
    </header>
  );
}
