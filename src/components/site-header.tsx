import Link from "next/link";

import { roleLabel } from "@/lib/format";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  user: SafeUser | null;
};

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          PortföySatış
        </Link>

        <nav className="flex items-center gap-2 text-sm font-medium text-slate-700 sm:gap-4">
          <Link href="/" className="rounded-md px-3 py-2 transition hover:bg-slate-100">
            İlanlar
          </Link>
          <Link href="/panel" className="rounded-md px-3 py-2 transition hover:bg-slate-100">
            Admin Panel
          </Link>

          {user ? (
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2 py-1">
              <span className="hidden text-xs text-slate-500 sm:inline">{roleLabel(user.role)}</span>
              <span className="rounded bg-slate-900 px-2 py-1 text-xs text-white">{user.name}</span>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="cursor-pointer rounded bg-slate-100 px-2 py-1 text-xs text-slate-700 transition hover:bg-slate-200"
                >
                  Çıkış
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/giris"
              className="rounded-md bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Giriş Yap
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
