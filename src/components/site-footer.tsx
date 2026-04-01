import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Anasayfa" },
  { href: "/portfoyler", label: "Portföyler" },
  { href: "/blog", label: "Blog" },
  { href: "/harita", label: "Harita" },
  { href: "/hizmetler", label: "Hizmetler" },
  { href: "/danismanlar", label: "Danışmanlar" },
  { href: "/hakkimizda", label: "Hakkımızda" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteFooter() {
  return (
    <footer className="frame mt-14 rounded-2xl border border-[#d8cab5] bg-[#fffbf4] px-5 py-5 text-[#665c4f]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7347]">PortföySatış</p>
          <p className="mt-1 text-lg font-semibold text-[#1f1a14]">Signature Estates</p>
          <p className="mt-1 text-sm">Premium vitrin, danışman destekli satış akışı.</p>
        </div>

        <nav className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm md:grid-cols-4">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#1f1a14]">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-[#e5dbc9] pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p suppressHydrationWarning>© {new Date().getFullYear()} PortföySatış. Tüm hakları saklıdır.</p>
        <Link
          href="/yetkili-giris"
          className="w-fit rounded-full border border-[#ccb795] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f5b3d] transition hover:bg-[#f3eadc]"
        >
          Yetkili Girişi
        </Link>
      </div>
    </footer>
  );
}
