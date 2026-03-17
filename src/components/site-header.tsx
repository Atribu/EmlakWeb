import Link from "next/link";

import { roleLabel } from "@/lib/format";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  user: SafeUser | null;
};

const navItems = [
  { href: "/", label: "Anasayfa" },
  { href: "/portfoyler", label: "Portföyler" },
  { href: "/blog", label: "Blog" },
  { href: "/harita", label: "Harita" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/danismanlar", label: "Danışmanlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteHeader({ user }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a1119]/66 backdrop-blur-xl">
      <div className="frame-wide flex items-center justify-between gap-4 px-2 py-4 sm:px-4">
        <Link href="/" className="leading-none text-[#f8efdf]">
          <span className="block text-[10px] font-semibold uppercase tracking-[0.27em] text-[#dcbc84]">PortföySatış</span>
          <span className="text-[1.56rem] font-semibold tracking-[0.025em]">Signature Estates</span>
        </Link>

        <nav className="hidden items-center gap-6 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c9b898] md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>

        {user ? (
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
        ) : (
          <Link
            href="/yetkili-giris"
            className="rounded-full border border-[#564028] bg-[#121c28]/88 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.17em] text-[#dfc9a2] transition hover:bg-[#192739]"
          >
            Yetkili Girişi
          </Link>
        )}
      </div>
    </header>
  );
}
