import Link from "next/link";

import { roleLabel } from "@/lib/format";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  user: SafeUser | null;
};

const navItems = [
  { href: "/#ilanlar", label: "Portföyler" },
  { href: "/#harita", label: "Harita" },
  { href: "/#bolgeler", label: "Bölgeler" },
  { href: "/#danismanlar", label: "Danışmanlar" },
  { href: "/#iletisim", label: "İletişim" },
];

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d8cfbf] bg-[#fcfaf7]/92 backdrop-blur">
      <div className="hidden border-b border-[#e5ddcf] md:block">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-[#7a6c56] sm:px-6">
          <p>Satış Odaklı Prestij Portföy Yönetimi</p>
          <div className="flex items-center gap-5">
            <p>TR / EN</p>
            <p>AED / TRY</p>
            <p>Destek: +90 212 900 00 01</p>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="leading-none text-[#1d1912]">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.25em] text-[#8a6a3b]">PortföySatış</span>
          <span className="text-[1.75rem] font-semibold tracking-[0.03em]">Signature Estates</span>
        </Link>

        <nav className="hidden items-center gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#5d5448] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-[#efe6d8] hover:text-[#1f1a14]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
          <div className="flex items-center gap-2 rounded-full border border-[#d3c8b5] bg-white px-2 py-1 text-xs">
            <span className="hidden px-2 text-[#7a6c56] sm:inline">{roleLabel(user.role)}</span>
            <Link
              href="/yonetim-ofisi"
              className="rounded-full bg-[#1f1a14] px-3 py-1.5 font-semibold text-white transition hover:bg-[#000]"
            >
              Yönetim
            </Link>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="cursor-pointer rounded-full border border-[#d3c8b5] px-3 py-1.5 font-semibold text-[#5f5549] transition hover:bg-[#f4ede2]"
              >
                Çıkış
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/yetkili-giris"
            className="rounded-full border border-[#ccb99a] bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6d5a3e] transition hover:bg-[#f5ede0]"
          >
            Yetkili Girişi
          </Link>
        )}
      </div>
    </header>
  );
}
