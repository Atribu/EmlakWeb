import Link from "next/link";

import { SiteHeaderAuth } from "@/components/site-header-auth";
import type { SafeUser } from "@/lib/types";

type SiteHeaderProps = {
  initialUser?: SafeUser | null;
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

export function SiteHeader({ initialUser = null }: SiteHeaderProps) {
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

        <SiteHeaderAuth initialUser={initialUser} />
      </div>
    </header>
  );
}
