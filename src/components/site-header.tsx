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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#09111a]/72 backdrop-blur-xl">
      <div className="frame-wide px-2 sm:px-4">
        <div className="flex flex-col gap-2 border-b border-white/8 py-2 lg:flex-row lg:items-center lg:justify-between">
          <HeaderMarketControls />
          <p className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-[#bfa98a] lg:block">
            {copy.topMessage}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 py-3.5">
          <Link href="/" className="leading-none text-[#f8efdf]">
            <span className="block text-[10px] font-semibold uppercase tracking-[0.27em] text-[#dcbc84]">PortföySatış</span>
            <span className="text-[1.56rem] font-semibold tracking-[0.025em]">Signature Estates</span>
          </Link>

          <nav className="hidden xl:flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#d5c3a1]">
            {navigation.menuGroups.map((group) => (
              <div key={group.href} className="group relative">
                <Link
                  href={group.href}
                  className="flex items-center gap-1 rounded-full px-3 py-2 transition hover:bg-white/6 hover:text-white focus-visible:bg-white/6 focus-visible:text-white focus-visible:outline-none"
                >
                  {group.label}
                  <ChevronIcon />
                </Link>

                <div className="pointer-events-none invisible absolute top-full left-1/2 z-30 w-max -translate-x-1/2 translate-y-2 pt-4 opacity-0 transition duration-200 group-hover:visible group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <div className={`overflow-hidden rounded-[1.35rem] border border-[#2e3a49] bg-[#0d1520]/96 shadow-[0_34px_70px_-34px_rgba(0,0,0,0.88)] backdrop-blur-xl ${group.panelClassName ?? "w-[30rem]"}`}>
                    <div className="border-b border-white/8 bg-[linear-gradient(135deg,rgba(216,188,141,0.12)_0%,rgba(255,255,255,0.02)_70%)] px-5 py-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[#d8bc8d]">{group.label}</p>
                      <p className="mt-2 max-w-[26rem] text-sm leading-6 text-[#d7c7ac]">{group.description}</p>
                    </div>

                    <div className="grid gap-2 p-3 sm:grid-cols-2">
                      {group.items.map((item) => (
                        <Link
                          key={`${item.href}-${item.label}`}
                          href={item.href}
                          className="rounded-[1rem] border border-white/10 bg-white/[0.04] px-4 py-3 transition hover:border-[#d6b785]/38 hover:bg-white/[0.08]"
                        >
                          <p className="text-[0.8rem] font-semibold tracking-[0.01em] text-[#f7ecd8]">{item.label}</p>
                          <p className="mt-1 text-xs leading-5 text-[#c4b49a]">{item.description}</p>
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
                className="rounded-full px-3 py-2 transition hover:bg-white/6 hover:text-white focus-visible:bg-white/6 focus-visible:text-white focus-visible:outline-none"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <details className="relative xl:hidden">
              <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[#4d3b24] bg-[#121c28]/90 text-[#e5d0ab] transition hover:bg-[#182535] [&::-webkit-details-marker]:hidden">
                <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
                  <path d="M4 6h12M4 10h12M4 14h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </summary>

              <div className="absolute right-0 top-[calc(100%+0.9rem)] z-30 w-[min(92vw,26rem)] overflow-hidden rounded-[1.35rem] border border-[#2d3948] bg-[#0d1520]/96 shadow-[0_34px_70px_-34px_rgba(0,0,0,0.88)] backdrop-blur-xl">
                <div className="border-b border-white/8 px-5 py-4">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">{navigation.mobileTitle}</p>
                  <p className="mt-2 text-sm leading-6 text-[#d8c9ae]">
                    {navigation.mobileDescription}
                  </p>
                </div>

                <div className="max-h-[70vh] space-y-3 overflow-y-auto p-4">
                  {navigation.menuGroups.map((group) => (
                    <details key={group.href} className="rounded-[1rem] border border-white/8 bg-white/[0.03]">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-semibold tracking-[0.03em] text-[#f4ead7] [&::-webkit-details-marker]:hidden">
                        <span>{group.label}</span>
                        <ChevronIcon />
                      </summary>
                      <div className="grid gap-2 border-t border-white/8 px-3 py-3">
                        {group.items.map((item) => (
                          <Link
                            key={`${group.href}-${item.href}-${item.label}`}
                            href={item.href}
                            className="rounded-[0.95rem] border border-white/8 bg-white/[0.03] px-3 py-3 transition hover:bg-white/[0.06]"
                          >
                            <p className="text-sm font-semibold text-[#f7ecd8]">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-[#c4b49a]">{item.description}</p>
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
                        className="rounded-[1rem] border border-white/8 bg-white/[0.03] px-4 py-3 text-sm font-semibold tracking-[0.03em] text-[#f5ead8] transition hover:bg-white/[0.06]"
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
