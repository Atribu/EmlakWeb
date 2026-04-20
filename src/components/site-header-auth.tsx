"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { useSitePreferences } from "@/components/use-site-preferences";
import { roleLabel } from "@/lib/format";
import { headerCopy } from "@/lib/site-preferences";
import type { SafeUser } from "@/lib/types";

type SiteHeaderAuthProps = {
  initialUser?: SafeUser | null;
};

export function SiteHeaderAuth({ initialUser = null }: SiteHeaderAuthProps) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const [hydrated, setHydrated] = useState(Boolean(initialUser));
  const { language } = useSitePreferences();
  const copy = headerCopy(language);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const response = await fetch("/api/auth/session", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
      }).catch(() => null);

      if (cancelled) {
        return;
      }

      if (!response || !response.ok) {
        setUser(null);
        setHydrated(true);
        return;
      }

      const payload = (await response.json().catch(() => null)) as { user?: SafeUser | null } | null;
      setUser(payload?.user ?? null);
      setHydrated(true);
    }

    void loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!hydrated && !user) {
    return null;
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-white px-2 py-1 text-xs shadow-[0_18px_36px_-30px_rgba(22,32,48,0.34)]">
        <span className="hidden px-2 text-[var(--ink-500)] sm:inline">{roleLabel(user.role, language)}</span>
        <Link
          href="/yonetim-ofisi"
          className="rounded-full bg-[var(--brand-primary)] px-3 py-2 font-semibold text-white transition hover:bg-[#27466e]"
        >
          <span className="sm:hidden">{copy.authPanel}</span>
          <span className="hidden sm:inline">{copy.authManagement}</span>
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="cursor-pointer rounded-full border border-[var(--line-strong)] px-3 py-2 font-semibold text-[var(--brand-primary)] transition hover:bg-[rgba(29,56,92,0.05)]"
          >
            {copy.authLogout}
          </button>
        </form>
      </div>
    );
  }

  return null;
}
