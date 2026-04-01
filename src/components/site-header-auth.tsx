"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { roleLabel } from "@/lib/format";
import type { SafeUser } from "@/lib/types";

type SiteHeaderAuthProps = {
  initialUser?: SafeUser | null;
};

export function SiteHeaderAuth({ initialUser = null }: SiteHeaderAuthProps) {
  const [user, setUser] = useState<SafeUser | null>(initialUser);
  const [hydrated, setHydrated] = useState(Boolean(initialUser));

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
    return (
      <div
        aria-hidden
        className="h-[42px] w-[152px] rounded-full border border-[#564028] bg-[#121c28]/88"
      />
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2 rounded-full border border-[#4d3b24] bg-[#121c28]/90 px-2 py-1 text-xs">
        <span className="hidden px-2 text-[#cfbd9c] sm:inline">{roleLabel(user.role)}</span>
        <Link
          href="/yonetim-ofisi"
          className="rounded-full btn-gold px-3 py-1.5 font-semibold transition"
        >
          Yönetim
        </Link>
        <form action="/api/auth/logout" method="post">
          <button
            type="submit"
            className="cursor-pointer rounded-full border border-[#55422b] px-3 py-1.5 font-semibold text-[#d4c09d] transition hover:bg-[#1a2635]"
          >
            Çıkış
          </button>
        </form>
      </div>
    );
  }

  return (
    <Link
      href="/yetkili-giris"
      className="rounded-full border border-[#564028] bg-[#121c28]/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#dfc9a2] transition hover:bg-[#192739]"
    >
      Yetkili Girişi
    </Link>
  );
}
