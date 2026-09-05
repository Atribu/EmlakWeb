"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { BrandLogoMark } from "@/components/brand-logo-mark";
import type { PanelTab, PanelTabMeta } from "@/lib/admin-panel-navigation";
import { roleLabel } from "@/lib/format";

type AdminSidebarProps = {
  activeTab: PanelTab;
  overviewTab?: PanelTabMeta;
  portfolioTabs: PanelTabMeta[];
  blogTabs: PanelTabMeta[];
  standaloneTabs: PanelTabMeta[];
  pendingApprovalCount: number;
  currentUser: {
    name: string;
    role: string;
  };
};

function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");
}

function SidebarHeader({ onClose }: { onClose?: () => void }) {
  return (
    <div className="admin-sidebar-brand">
      <div className="flex min-w-0 items-center gap-3">
        <BrandLogoMark className="admin-brand-symbol h-11 w-11 rounded-xl" />
        <div className="min-w-0">
          <p className="admin-brand-name">RODINA</p>
          <p className="admin-brand-caption">Yönetim Merkezi</p>
        </div>
      </div>

      {onClose ? (
        <button type="button" onClick={onClose} className="admin-drawer-close" aria-label="Panel menüsünü kapat">
          <CloseIcon />
        </button>
      ) : null}
    </div>
  );
}

function GroupNavigation({
  label,
  tabs,
  activeTab,
  icon,
  pendingApprovalCount,
  onNavigate,
}: {
  label: string;
  tabs: PanelTabMeta[];
  activeTab: PanelTab;
  icon: "portfolio" | "blog";
  pendingApprovalCount: number;
  onNavigate?: () => void;
}) {
  const hasActiveTab = tabs.some((tab) => tab.id === activeTab);

  return (
    <details className="admin-nav-group" open={hasActiveTab}>
      <summary className="admin-nav-summary">
        <div className="flex min-w-0 items-center gap-3">
          <span className="admin-nav-icon">
            {icon === "portfolio" ? <PortfolioGroupIcon /> : <BlogGroupIcon />}
          </span>
          <span className="truncate text-[0.82rem] font-semibold">{label}</span>
        </div>
        <span className="admin-nav-chevron">
          <ChevronDownIcon />
        </span>
      </summary>

      <div className="admin-nav-children">
        {tabs.map((tab) => {
          const badgeCount = tab.id === "portfolio-approval" ? pendingApprovalCount : 0;

          return (
            <Link
              key={tab.id}
              href={`/yonetim-ofisi?tab=${tab.id}`}
              onClick={onNavigate}
              data-active={tab.id === activeTab}
              aria-current={tab.id === activeTab ? "page" : undefined}
              className="admin-nav-child-link"
            >
              <span className="admin-nav-child-dot" />
              <span className="flex min-w-0 flex-1 items-center justify-between gap-3">
                <span className="truncate text-[0.79rem] font-medium">{tab.label}</span>
                {badgeCount > 0 ? (
                  <span className="admin-nav-badge">{badgeCount > 99 ? "99+" : badgeCount}</span>
                ) : null}
              </span>
            </Link>
          );
        })}
      </div>
    </details>
  );
}

function StandaloneNavigation({
  tab,
  activeTab,
  onNavigate,
}: {
  tab: PanelTabMeta;
  activeTab: PanelTab;
  onNavigate?: () => void;
}) {
  const isActive = tab.id === activeTab;

  return (
    <Link
      href={`/yonetim-ofisi?tab=${tab.id}`}
      onClick={onNavigate}
      data-active={isActive}
      aria-current={isActive ? "page" : undefined}
      className="admin-nav-link"
    >
      <span className="admin-nav-icon">
        <TabNavigationIcon tab={tab.id} />
      </span>
      <span className="truncate text-[0.82rem] font-semibold">{tab.label}</span>
    </Link>
  );
}

function SidebarContent({
  activeTab,
  overviewTab,
  portfolioTabs,
  blogTabs,
  standaloneTabs,
  pendingApprovalCount,
  currentUser,
  onNavigate,
  onClose,
}: AdminSidebarProps & { onNavigate?: () => void; onClose?: () => void }) {
  return (
    <>
      <SidebarHeader onClose={onClose} />

      <nav className="admin-sidebar-navigation">
        <p className="admin-nav-section-label">Çalışma Alanı</p>

        <div className="mt-2 grid gap-1.5">
          {overviewTab ? (
            <StandaloneNavigation tab={overviewTab} activeTab={activeTab} onNavigate={onNavigate} />
          ) : null}

          {portfolioTabs.length > 0 ? (
            <GroupNavigation
              label="Portföyler"
              tabs={portfolioTabs}
              activeTab={activeTab}
              icon="portfolio"
              pendingApprovalCount={pendingApprovalCount}
              onNavigate={onNavigate}
            />
          ) : null}

          {blogTabs.length > 0 ? (
            <GroupNavigation
              label="Bloglar"
              tabs={blogTabs}
              activeTab={activeTab}
              icon="blog"
              pendingApprovalCount={pendingApprovalCount}
              onNavigate={onNavigate}
            />
          ) : null}

          {standaloneTabs.map((tab) => (
            <StandaloneNavigation key={tab.id} tab={tab} activeTab={activeTab} onNavigate={onNavigate} />
          ))}
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <div className="flex items-center gap-3">
          <div className="admin-user-avatar">{initialsForName(currentUser.name)}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[0.82rem] font-semibold text-white">{currentUser.name}</p>
            <p className="mt-0.5 truncate text-[0.7rem] text-[#8fa0b8]">{roleLabel(currentUser.role)}</p>
          </div>
          <span className="admin-online-dot" title="Oturum aktif" />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link href="/" onClick={onNavigate} className="admin-sidebar-action">
            Siteye Dön
          </Link>
          <form action="/api/auth/logout" method="post">
            <button type="submit" className="admin-sidebar-action w-full">
              Çıkış
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export function AdminSidebar(props: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  return (
    <>
      <header className="admin-mobile-bar grid xl:hidden">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className="admin-mobile-menu-button"
          aria-label="Panel menüsünü aç"
          aria-expanded={isMobileOpen}
          aria-controls="admin-mobile-navigation"
        >
          <MenuIcon />
        </button>

        <div className="flex min-w-0 items-center justify-center gap-2.5">
          <BrandLogoMark className="admin-mobile-brand-symbol h-9 w-9 rounded-lg" />
          <div className="min-w-0">
            <p className="truncate text-[0.68rem] font-extrabold tracking-[0.16em] text-[#172033]">RODINA</p>
            <p className="truncate text-[0.62rem] text-[#738096]">{props.overviewTab?.id === props.activeTab ? "Genel Bakış" : "Yönetim Paneli"}</p>
          </div>
        </div>

        <div className="admin-mobile-avatar">{initialsForName(props.currentUser.name)}</div>
      </header>

      <button
        type="button"
        className="admin-drawer-backdrop xl:hidden"
        data-open={isMobileOpen}
        onClick={() => setIsMobileOpen(false)}
        aria-label="Panel menüsünü kapat"
        tabIndex={isMobileOpen ? 0 : -1}
      />

      <aside
        id="admin-mobile-navigation"
        className="admin-sidebar admin-mobile-drawer xl:hidden"
        data-open={isMobileOpen}
        aria-hidden={!isMobileOpen}
      >
        <SidebarContent
          {...props}
          onNavigate={() => setIsMobileOpen(false)}
          onClose={() => setIsMobileOpen(false)}
        />
      </aside>

      <aside className="admin-sidebar admin-desktop-sidebar hidden xl:flex">
        <SidebarContent {...props} />
      </aside>
    </>
  );
}

function PortfolioGroupIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
      <path d="M3.75 6.75A1.75 1.75 0 0 1 5.5 5h2.6c.35 0 .68.14.92.38l1.1 1.12c.24.24.57.37.9.37h3.48a1.75 1.75 0 0 1 1.75 1.75v5.88a1.75 1.75 0 0 1-1.75 1.75h-9A1.75 1.75 0 0 1 3.75 14.5V6.75Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
    </svg>
  );
}

function BlogGroupIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
      <path d="M5.25 4.75h7.5A1.75 1.75 0 0 1 14.5 6.5v9a.75.75 0 0 1-1.18.61L10 13.75l-3.32 2.36a.75.75 0 0 1-1.18-.61v-9a1.75 1.75 0 0 1 1.75-1.75Z" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M7.5 8h5M7.5 10.75h3.75" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden>
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M3.75 5.5h12.5M3.75 10h8.5M3.75 14.5h12.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="m5.25 5.25 9.5 9.5M14.75 5.25l-9.5 9.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function TabNavigationIcon({ tab }: { tab: PanelTab }) {
  switch (tab) {
    case "overview":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
          <rect x="3.75" y="3.75" width="5.25" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="3.75" width="5.25" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="3.75" y="11" width="5.25" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
          <rect x="11" y="11" width="5.25" height="5.25" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "advisor-manage":
    case "advisor-edit":
    case "user-manage":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
          <path d="M7.25 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM13.25 9.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" stroke="currentColor" strokeWidth="1.5" />
          <path d="M3.75 15.5a3.5 3.5 0 0 1 7 0M11.25 15.5a2.25 2.25 0 0 1 4.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
          <path d="M4.25 14.75V10M8.1 14.75V6.25M11.9 14.75V8.5M15.75 14.75V4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M3.5 16h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-[1.05rem] w-[1.05rem]" aria-hidden>
          <circle cx="10" cy="10" r="5.25" stroke="currentColor" strokeWidth="1.5" />
          <path d="M7.5 10h5M10 7.5v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
  }
}
