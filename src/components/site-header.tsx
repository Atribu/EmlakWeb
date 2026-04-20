"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogoMark } from "@/components/brand-logo-mark";
import { HeaderMarketControlsInner } from "@/components/header-market-controls";
import { SiteHeaderAuth } from "@/components/site-header-auth";
import { useSitePreferences } from "@/components/use-site-preferences";
import { siteHeaderNavigationCopy } from "@/lib/site-copy";
import { headerCopy } from "@/lib/site-preferences";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  initialUser?: SafeUser | null;
};

function ChevronIcon({ open = false }: { open?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className={`h-3.5 w-3.5 transition ${open ? "rotate-180" : ""}`}
      aria-hidden
    >
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="M7.5 5.75 12 10l-4.5 4.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SiteHeader({ initialUser = null }: SiteHeaderProps) {
  const { language } = useSitePreferences();
  const copy = headerCopy(language);
  const navigation = siteHeaderNavigationCopy(language);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMobileGroup, setActiveMobileGroup] = useState<string | null>(null);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1280) {
        setMobileMenuOpen(false);
        setActiveMobileGroup(null);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) {
      document.body.style.removeProperty("overflow");
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.removeProperty("overflow");
    };
  }, [mobileMenuOpen]);

  function closeMobileMenu() {
    setMobileMenuOpen(false);
    setActiveMobileGroup(null);
  }

  function toggleMobileGroup(groupHref: string) {
    setActiveMobileGroup((current) => (current === groupHref ? null : groupHref));
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-[rgba(220,208,189,0.72)] bg-[rgba(255,251,245,0.92)] backdrop-blur-xl">
        <div className="frame-wide px-2 sm:px-4">
          <div className="grid grid-cols-[2.75rem_minmax(0,1fr)_2.75rem] items-center gap-3 py-3 xl:flex xl:justify-between">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand-primary)] shadow-[0_18px_36px_-30px_rgba(22,32,48,0.34)] transition hover:border-[var(--brand-accent)] xl:hidden"
              aria-label={navigation.mobileTitle}
            >
              <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>

            <Link
              href="/"
              className="mx-auto flex items-center gap-2.5 leading-none text-[var(--brand-primary)] transition hover:opacity-90 xl:mx-0"
              aria-label="PortföySatış ana sayfa"
            >
              <BrandLogoMark className="h-11 w-11" />
              <span className="whitespace-nowrap text-[0.92rem] font-semibold tracking-[0.02em] sm:text-[1rem]">
                Signature Estates
              </span>
            </Link>

            <div className="hidden xl:flex xl:items-center xl:gap-4">
              <nav className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--ink-600)]">
                {navigation.menuGroups.map((group) => (
                  <div key={group.href} className="group relative">
                    <Link
                      href={group.href}
                      className="flex min-h-10 items-center gap-1 rounded-full px-4 py-2 transition hover:bg-[rgba(29,56,92,0.07)] hover:text-[var(--brand-primary)] focus-visible:bg-[rgba(29,56,92,0.07)] focus-visible:text-[var(--brand-primary)] focus-visible:outline-none"
                    >
                      {group.label}
                      <ChevronIcon />
                    </Link>

                    <div className="pointer-events-none invisible absolute top-full left-1/2 z-30 w-max -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <div className={`min-w-[32rem] overflow-hidden rounded-[1.15rem] border border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] shadow-[0_30px_64px_-36px_rgba(22,30,42,0.24)] backdrop-blur-xl ${group.panelClassName ?? "w-[34rem]"}`}>
                        <div className="border-b border-[rgba(220,208,189,0.72)] px-4 py-3">
                          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-strong)]">
                            {group.label}
                          </p>
                          <p className="mt-1 max-w-[28rem] line-clamp-2 text-[12px] leading-5 text-[var(--ink-600)]">
                            {group.description}
                          </p>
                        </div>

                        <div className="flex flex-col p-2">
                          {group.items.map((item) => (
                            <Link
                              key={`${item.href}-${item.label}`}
                              href={item.href}
                              className="group/item flex items-center justify-between gap-3 rounded-[0.95rem] border border-transparent bg-white px-3.5 py-2.5 transition hover:border-[var(--line-strong)] hover:bg-[rgba(29,56,92,0.03)]"
                            >
                              <div className="min-w-0">
                                <p className="text-[0.8rem] font-semibold tracking-[0.01em] text-[var(--brand-primary)]">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 line-clamp-1 text-[10px] leading-4 text-[var(--ink-500)]">
                                  {item.description}
                                </p>
                              </div>
                              <span className="shrink-0 text-[var(--brand-accent-strong)] transition group-hover/item:translate-x-0.5">
                                <ArrowIcon />
                              </span>
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
                    className="flex min-h-10 items-center rounded-full px-4 py-2 transition hover:bg-[rgba(29,56,92,0.07)] hover:text-[var(--brand-primary)] focus-visible:bg-[rgba(29,56,92,0.07)] focus-visible:text-[var(--brand-primary)] focus-visible:outline-none"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>

              <HeaderMarketControlsInner className="flex" menuAlign="right" />
              <SiteHeaderAuth initialUser={initialUser} />
            </div>

            <span className="block h-11 w-11 xl:hidden" aria-hidden />
          </div>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-[90] xl:hidden">
          <button
            type="button"
            aria-label="Menüyü kapat"
            onClick={closeMobileMenu}
            className="absolute inset-0 bg-[rgba(12,18,27,0.44)]"
          />

          <aside className="absolute left-0 top-0 flex h-full w-[min(88vw,23rem)] flex-col overflow-hidden border-r border-[var(--line-strong)] bg-[rgba(255,252,247,0.98)] shadow-[0_30px_64px_-30px_rgba(16,23,34,0.34)] backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-[rgba(220,208,189,0.72)] px-4 py-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--brand-accent-strong)]">
                  {navigation.mobileTitle}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[var(--ink-600)]">
                  {navigation.mobileDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={closeMobileMenu}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] bg-white text-[var(--brand-primary)]"
                aria-label="Menüyü kapat"
              >
                <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
                  <path d="M5 5l10 10M15 5 5 15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              <div className="rounded-[1rem] border border-[var(--line-strong)] bg-white p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--ink-500)]">
                  {copy.language} / {copy.currency}
                </p>
                <HeaderMarketControlsInner className="mt-3" variant="mobile-dropdown" />
              </div>

              <div className="space-y-2">
                {navigation.menuGroups.map((group) => {
                  const isOpen = activeMobileGroup === group.href;

                  return (
                    <div key={group.href} className="overflow-hidden rounded-[1rem] border border-[var(--line-strong)] bg-white">
                      <button
                        type="button"
                        onClick={() => toggleMobileGroup(group.href)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-semibold text-[var(--brand-primary)]"
                      >
                        <span>{group.label}</span>
                        <ChevronIcon open={isOpen} />
                      </button>

                      {isOpen ? (
                        <div className="border-t border-[rgba(220,208,189,0.72)] px-3 py-3">
                          <Link
                            href={group.href}
                            onClick={closeMobileMenu}
                            className="mb-2 block rounded-[0.95rem] bg-[rgba(29,56,92,0.05)] px-3 py-2 text-[13px] font-semibold text-[var(--brand-primary)]"
                          >
                            {group.label}
                          </Link>
                          <div className="flex flex-col gap-1.5">
                            {group.items.map((item) => (
                              <Link
                                key={`${group.href}-${item.href}-${item.label}`}
                                href={item.href}
                                onClick={closeMobileMenu}
                                className="flex items-center justify-between gap-3 rounded-[0.95rem] px-3 py-2.5 text-[13px] font-medium text-[var(--ink-700)] transition hover:bg-[rgba(29,56,92,0.05)]"
                              >
                                <span className="min-w-0 truncate">{item.label}</span>
                                <span className="shrink-0 text-[var(--brand-accent-strong)]">
                                  <ArrowIcon />
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-2">
                {navigation.directLinks.map((item) => (
                  <Link
                    key={`mobile-${item.href}`}
                    href={item.href}
                    onClick={closeMobileMenu}
                    className="rounded-[1rem] border border-[var(--line-strong)] bg-white px-4 py-3 text-sm font-semibold tracking-[0.03em] text-[var(--brand-primary)] transition hover:bg-[rgba(29,56,92,0.04)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}
