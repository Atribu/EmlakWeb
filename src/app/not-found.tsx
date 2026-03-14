import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <SiteHeader user={null} />
      <main className="mx-auto flex w-full max-w-4xl flex-col items-center px-4 py-20 text-center sm:px-6">
        <p className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-rose-700">
          404
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Aradığınız ilan bulunamadı</h1>
        <p className="mt-3 max-w-lg text-sm text-slate-600">
          İlan kaldırılmış olabilir ya da bağlantı hatalı olabilir. Aktif portföylere dönüp tekrar filtreleme yapabilirsiniz.
        </p>
        <Link
          href="/"
          className="mt-6 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Portföylere dön
        </Link>
      </main>
    </div>
  );
}
