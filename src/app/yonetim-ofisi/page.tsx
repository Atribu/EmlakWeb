import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { AdvisorEditor } from "@/components/panel/advisor-editor";
import { AdvisorManagement } from "@/components/panel/advisor-management";
import { AdminNotificationCenter } from "@/components/panel/admin-notification-center";
import { BlogDelete } from "@/components/panel/blog-delete";
import { BlogEditor } from "@/components/panel/blog-editor";
import { BlogForm } from "@/components/panel/blog-form";
import { LeadPipelineBoard } from "@/components/panel/lead-pipeline-board";
import { PortfolioDelete } from "@/components/panel/portfolio-delete";
import { PortfolioEditor } from "@/components/panel/portfolio-editor";
import { PortfolioForm } from "@/components/panel/portfolio-form";
import { PortfolioProjectCenter } from "@/components/panel/portfolio-project-center";
import { UserManagement } from "@/components/panel/user-management";
import {
  assignableUserRoles,
  canAccessOverview,
  canCreateOrEditPortfolios,
  canDeletePortfolios,
  canManageAdvisors,
  canManageBlogs,
  canManageLeads,
  canManageUsers,
  filterLeadsForActor,
  filterUsersForActor,
} from "@/lib/access-control";
import { buildAdminNotifications } from "@/lib/admin-notifications";
import { getCurrentUser } from "@/lib/auth";
import {
  dashboardSummary,
  leadStageSummary,
  listAdvisors,
  listBlogPosts,
  listLeads,
  listPropertyActivityLogs,
  listProperties,
  listUsers,
} from "@/lib/data-store";

import { formatDateTimeTR, roleLabel } from "@/lib/format";
import {
  propertyActivityActionBadgeClass,
  propertyActivityActionLabel,
} from "@/lib/property-activity";
import { isPropertyPublished, normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { summarizePropertyQuality } from "@/lib/property-quality";

import type { LeadStage } from "@/lib/types";

type PanelTab =
  | "overview"
  | "portfolio-create"
  | "portfolio-approval"
  | "portfolio-projects"
  | "portfolio-edit"
  | "portfolio-delete"
  | "blog-create"
  | "blog-edit"
  | "blog-delete"
  | "advisor-manage"
  | "advisor-edit"
  | "leads"
  | "user-manage";

type AdminOfficePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};


const portfolioGroupTabs: PanelTab[] = [
  "portfolio-create",
  "portfolio-approval",
  "portfolio-projects",
  "portfolio-edit",
  "portfolio-delete",
];
const blogGroupTabs: PanelTab[] = ["blog-create", "blog-edit", "blog-delete"];

const panelTabs: Array<{ id: PanelTab; label: string; hint: string }> = [
  { id: "overview", label: "Genel Bakış", hint: "Metrikler ve genel görünüm" },
  { id: "portfolio-create", label: "Portföy Ekle", hint: "Yeni ilan oluştur" },
  { id: "portfolio-approval", label: "Onay Bekleyenler", hint: "Yayın onayı bekleyen ilanlar" },
  { id: "portfolio-projects", label: "Proje / Firma Merkezi", hint: "Firmaya göre ilanları grupla" },
  { id: "portfolio-edit", label: "Portföy Düzenle", hint: "Mevcut ilanı güncelle" },
  { id: "portfolio-delete", label: "Portföy Sil", hint: "Yayındaki ilanı kaldır" },
  { id: "blog-create", label: "Blog Ekle", hint: "Yeni içerik yayınla" },
  { id: "blog-edit", label: "Blog Düzenle", hint: "İçeriği güncelle" },
  { id: "blog-delete", label: "Blog Sil", hint: "İçeriği kaldır" },
  { id: "advisor-manage", label: "Danışmanlar", hint: "Kayıt yönetimi" },
  { id: "advisor-edit", label: "Danışman Düzenle", hint: "Bilgileri güncelle" },
  { id: "leads", label: "Analitik", hint: "Lead ve CRM takibi" },
  { id: "user-manage", label: "Kullanıcılar", hint: "Rol ve hesap yönetimi" },

];

const defaultTab: PanelTab = "overview";

function visibleTabsForRole(role: string): PanelTab[] {
  const output: PanelTab[] = [];

  if (canAccessOverview(role)) {
    output.push("overview");
  }

  if (canCreateOrEditPortfolios(role)) {
    output.push("portfolio-create", "portfolio-projects", "portfolio-edit");
  }

  if (canDeletePortfolios(role)) {
    output.push("portfolio-approval", "portfolio-delete");
  }

  if (canManageBlogs(role)) {
    output.push("blog-create", "blog-edit", "blog-delete");
  }

  if (canManageAdvisors(role)) {
    output.push("advisor-manage", "advisor-edit");
  }

  if (canManageLeads(role)) {
    output.push("leads");
  }

  if (canManageUsers(role)) {
    output.push("user-manage");
  }

  return output;
}

function resolveTab(value: string | undefined, allowedTabs: PanelTab[]): PanelTab {
  if (!value) {
    return allowedTabs[0] ?? defaultTab;
  }

  const matched = allowedTabs.find((item) => item === value);
  return matched ?? allowedTabs[0] ?? defaultTab;
}

function primaryActionForTabs(allowedTabs: PanelTab[]) {
  if (allowedTabs.includes("portfolio-create")) {
    return { href: "/yonetim-ofisi?tab=portfolio-create", label: "+ Yeni Ekle" };
  }

  if (allowedTabs.includes("blog-create")) {
    return { href: "/yonetim-ofisi?tab=blog-create", label: "+ Yeni Ekle" };
  }

  if (allowedTabs.includes("user-manage")) {
    return { href: "/yonetim-ofisi?tab=user-manage", label: "+ Yeni Ekle" };
  }

  return null;
}

function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatMetricCurrency(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absolute >= 1_000_000_000) {
    return `${sign}₺${(absolute / 1_000_000_000).toFixed(1)} Mr`;
  }

  if (absolute >= 1_000_000) {
    return `${sign}₺${(absolute / 1_000_000).toFixed(1)} Mn`;
  }

  if (absolute >= 1_000) {
    return `${sign}₺${(absolute / 1_000).toFixed(1)} Bin`;
  }

  return `${sign}₺${Math.round(absolute)}`;
}

function formatMetricNumber(value: number) {
  return new Intl.NumberFormat("tr-TR").format(value);
}

function formatDelta(value: number) {
  const rounded = Math.abs(value).toFixed(1);
  return `${value >= 0 ? "+" : "-"}${rounded}%`;
}

function clampDelta(value: number) {
  return Math.max(-99.9, Math.min(99.9, value));
}

function buildMonthlyActivitySeries(
  properties: ReturnType<typeof listProperties>,
  leadCount: number,
  appointmentLeadCount: number,
  blogCount: number,
) {
  const formatter = new Intl.DateTimeFormat("tr-TR", { month: "short" });
  const now = new Date();
  const monthStarts = Array.from({ length: 8 }, (_, index) => {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (7 - index), 1));
    return date;
  });

  const grouped = new Map<string, number>();

  for (const property of properties) {
    const propertyDate = new Date(property.publishedAt);
    if (Number.isNaN(propertyDate.getTime())) {
      continue;
    }

    const key = `${propertyDate.getUTCFullYear()}-${propertyDate.getUTCMonth()}`;
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  }

  const baseSeries = monthStarts.map((date, index) => {
    const key = `${date.getUTCFullYear()}-${date.getUTCMonth()}`;
    const propertyCount = grouped.get(key) ?? 0;
    const seasonalBoost = (index % 3) * 18;
    return propertyCount * 82 + seasonalBoost + 80;
  });

  const fallbackBoost = Math.max(leadCount * 6, 32);
  const primaryValues = baseSeries.map((value, index) => value + fallbackBoost + index * 14);
  const comparisonValues = primaryValues.map((value, index) =>
    Math.max(36, Math.round(value * 0.66 + appointmentLeadCount * 4 + blogCount * 2 + index * 6)),
  );

  return {
    labels: monthStarts.map((date) => formatter.format(date)),
    primaryValues,
    comparisonValues,
  };
}

export default async function AdminOfficePage({ searchParams }: AdminOfficePageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/yetkili-giris?next=/yonetim-ofisi");
  }

  const resolvedSearchParams = await searchParams;
  const requestedTabRaw = resolvedSearchParams.tab;
  const requestedTab = Array.isArray(requestedTabRaw) ? requestedTabRaw[0] : requestedTabRaw;
  const requestedSlugRaw = resolvedSearchParams.slug;
  const requestedSlug = Array.isArray(requestedSlugRaw) ? requestedSlugRaw[0] : requestedSlugRaw;
  const requestedCompanyRaw = resolvedSearchParams.company;
  const requestedCompany = Array.isArray(requestedCompanyRaw) ? requestedCompanyRaw[0] : requestedCompanyRaw;
  const allowedTabs = visibleTabsForRole(currentUser.role);
  const activeTab = resolveTab(requestedTab, allowedTabs);
  const visibleTabs = panelTabs.filter((tab) => allowedTabs.includes(tab.id));

  const activeTabMeta = visibleTabs.find((tab) => tab.id === activeTab) ?? panelTabs[0];
  const standaloneTabs = visibleTabs.filter(
    (tab) => !portfolioGroupTabs.includes(tab.id) && !blogGroupTabs.includes(tab.id),
  );
  const overviewTab = standaloneTabs.find((tab) => tab.id === "overview");
  const secondaryStandaloneTabs = standaloneTabs.filter((tab) => tab.id !== "overview");
  const visiblePortfolioTabs = visibleTabs.filter((tab) => portfolioGroupTabs.includes(tab.id));
  const visibleBlogTabs = visibleTabs.filter((tab) => blogGroupTabs.includes(tab.id));


  const advisors = listAdvisors();
  const properties = listProperties({ includeInactive: true });
  const allUsers = listUsers();
  const users = filterUsersForActor(currentUser, allUsers);
  const summary = dashboardSummary();
  const blogPosts = listBlogPosts();
  const allLeads = listLeads();
  const propertyActivityLogs = listPropertyActivityLogs({ limit: 160 });
  const leads = filterLeadsForActor(currentUser, allLeads);
  const adminNotifications = buildAdminNotifications({
    properties,
    leads,
    propertyActivityLogs,
    canViewApprovals: allowedTabs.includes("portfolio-approval"),
    canViewPortfolioQuality: allowedTabs.includes("portfolio-projects") || allowedTabs.includes("portfolio-edit"),
    canViewLeads: allowedTabs.includes("leads"),
  });
  const stageSummary = leadStageSummary();
  const appointmentLeadCount = allLeads.filter((lead) => lead.source === "appointment_form").length;
  const contactLeadCount = allLeads.filter((lead) => lead.source === "contact_form").length;
  const activePropertyCount = properties.filter((property) => isPropertyPublished(property.publicationStatus)).length;
  const passivePropertyCount = properties.length - activePropertyCount;
  const pendingApprovalCount = properties.filter(
    (property) => normalizePropertyPublicationStatus(property.publicationStatus) === "Onay Bekliyor",
  ).length;
  const advisorStats = advisors.map((advisor) => ({
    ...advisor,
    propertyCount: properties.filter((property) => property.advisorId === advisor.id).length,
    linkedUserCount: allUsers.filter((user) => user.advisorId === advisor.id).length,
  }));

  const primaryAction = primaryActionForTabs(allowedTabs);

  const toolbarTitle = activeTab === "overview" ? "Yönetim Paneline Genel Bakış" : activeTabMeta.label;
  const toolbarSubtitle =
    activeTab === "overview"
      ? "Portföy, kullanıcı, analitik ve içerik tarafındaki son durumu tek bakışta izleyin."
      : activeTabMeta.hint;

  return (
    <div className="admin-shell min-h-screen">
      <main className="w-full">
        <div className="admin-dashboard-board min-h-screen">
          <div className="grid xl:grid-cols-[250px_minmax(0,1fr)]">
            <aside className="admin-sidebar flex min-h-full flex-col p-5 text-white sm:p-6">
              <div className="flex items-center gap-3 px-1 py-1">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1d4ed8] text-white shadow-[0_18px_30px_-18px_rgba(37,99,235,0.8)]">
                  <DashboardLogoIcon />
                </div>
                <div>
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-[#7dd3fc]">
                    Portföy Yönetimi
                  </p>
                  <p className="mt-0.5 text-lg font-semibold text-white">Yönetim Paneli</p>
                </div>
              </div>

              <nav className="mt-8 flex-1 space-y-1.5 overflow-y-auto pr-1">
                {overviewTab ? (
                  <Link
                    href={`/yonetim-ofisi?tab=${overviewTab.id}`}
                    data-active={overviewTab.id === activeTab}
                    aria-current={overviewTab.id === activeTab ? "page" : undefined}
                    className="admin-nav-link"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                          overviewTab.id === activeTab ? "bg-white/18 text-white" : "bg-white/5 text-[#9fb3cf]"
                        }`}
                      >
                        <TabNavigationIcon tab={overviewTab.id} />
                      </span>
                      <span
                        className={`text-sm font-medium ${
                          overviewTab.id === activeTab ? "text-white" : "text-[#d7e2f3]"
                        }`}
                      >
                        {overviewTab.label}
                      </span>
                    </div>
                  </Link>
                ) : null}

                {visiblePortfolioTabs.length > 0 ? (
                  <details
                    className="admin-nav-group"
                    open={visiblePortfolioTabs.some((tab) => tab.id === activeTab)}
                  >
                    <summary className="admin-nav-summary">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            visiblePortfolioTabs.some((tab) => tab.id === activeTab)
                              ? "bg-white/18 text-white"
                              : "bg-white/5 text-[#9fb3cf]"
                          }`}
                        >
                          <PortfolioGroupIcon />
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            visiblePortfolioTabs.some((tab) => tab.id === activeTab)
                              ? "text-white"
                              : "text-[#d7e2f3]"
                          }`}
                        >
                          Portföyler
                        </span>
                      </div>
                      <span className="admin-nav-chevron text-[#9fb3cf]">
                        <ChevronDownIcon />
                      </span>
                    </summary>

                    <div className="admin-nav-children">
                      {visiblePortfolioTabs.map((tab) => {
                        const tabBadgeCount = tab.id === "portfolio-approval" ? pendingApprovalCount : 0;



                        return (
                          <Link
                            key={tab.id}
                            href={`/yonetim-ofisi?tab=${tab.id}`}


                            data-active={tab.id === activeTab}
                            aria-current={tab.id === activeTab ? "page" : undefined}
                            className="admin-nav-child-link"
                          >
                            <span className="admin-nav-child-dot" />
                            <span className="flex min-w-0 flex-1 items-start justify-between gap-2">
                              <span className="min-w-0">
                                <span className="block text-sm font-medium">{tab.label}</span>
                                <span className="mt-0.5 block text-xs opacity-80">{tab.hint}</span>
                              </span>
                              {tabBadgeCount > 0 ? (
                                <span className="shrink-0 rounded-full bg-[#fb7185] px-2 py-0.5 text-[0.68rem] font-bold leading-5 text-white">
                                  {tabBadgeCount > 99 ? "99+" : tabBadgeCount}
                                </span>
                              ) : null}

                            </span>
                          </Link>
                        );
                      })}

                    </div>
                  </details>
                ) : null}

                {visibleBlogTabs.length > 0 ? (
                  <details className="admin-nav-group" open={visibleBlogTabs.some((tab) => tab.id === activeTab)}>
                    <summary className="admin-nav-summary">
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            visibleBlogTabs.some((tab) => tab.id === activeTab)
                              ? "bg-white/18 text-white"
                              : "bg-white/5 text-[#9fb3cf]"
                          }`}
                        >
                          <BlogGroupIcon />
                        </span>
                        <span
                          className={`text-sm font-medium ${
                            visibleBlogTabs.some((tab) => tab.id === activeTab) ? "text-white" : "text-[#d7e2f3]"
                          }`}
                        >
                          Bloglar
                        </span>
                      </div>
                      <span className="admin-nav-chevron text-[#9fb3cf]">
                        <ChevronDownIcon />
                      </span>
                    </summary>

                    <div className="admin-nav-children">
                      {visibleBlogTabs.map((tab) => (
                        <Link
                          key={tab.id}
                          href={`/yonetim-ofisi?tab=${tab.id}`}
                          data-active={tab.id === activeTab}
                          aria-current={tab.id === activeTab ? "page" : undefined}
                          className="admin-nav-child-link"
                        >
                          <span className="admin-nav-child-dot" />
                          <span className="min-w-0">
                            <span className="block text-sm font-medium">{tab.label}</span>
                            <span className="mt-0.5 block text-xs opacity-80">{tab.hint}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  </details>
                ) : null}

                {secondaryStandaloneTabs.map((tab) => {
                  const isActive = tab.id === activeTab;

                  return (
                    <Link
                      key={tab.id}
                      href={`/yonetim-ofisi?tab=${tab.id}`}
                      data-active={isActive}
                      aria-current={isActive ? "page" : undefined}
                      className="admin-nav-link"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                            isActive ? "bg-white/18 text-white" : "bg-white/5 text-[#9fb3cf]"
                          }`}
                        >
                          <TabNavigationIcon tab={tab.id} />
                        </span>
                        <span className={`text-sm font-medium ${isActive ? "text-white" : "text-[#d7e2f3]"}`}>
                          {tab.label}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-6 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#1e293b] text-sm font-semibold text-white">
                    {initialsForName(currentUser.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{currentUser.name}</p>
                    <p className="mt-0.5 truncate text-xs text-[#9fb3cf]">{roleLabel(currentUser.role)}</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <Link
                    href="/"
                    className="flex-1 rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-center text-xs font-semibold text-[#dce7f7] transition hover:bg-white/10"
                  >
                    Siteye Dön
                  </Link>
                  <form action="/api/auth/logout" method="post" className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded-xl border border-white/10 bg-white/6 px-3 py-2 text-xs font-semibold text-[#dce7f7] transition hover:bg-white/10"
                    >
                      Çıkış
                    </button>
                  </form>
                </div>
              </div>
            </aside>

            <section className="min-w-0 bg-[#f8fafc] p-4 sm:p-6 lg:p-7">
              <header className="mb-6 rounded-[1.7rem] border border-[#e2e8f0] bg-white px-5 py-5 shadow-[0_24px_48px_-36px_rgba(15,23,42,0.18)] sm:px-6">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h1 className="text-[1.95rem] font-semibold tracking-tight text-[#0f172a] sm:text-[2.15rem]">
                      {toolbarTitle}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b]">{toolbarSubtitle}</p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label className="relative block min-w-[240px] sm:min-w-[280px]">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#94a3b8]">
                        <SearchIcon />
                      </span>
                      <input
                        readOnly
                        value=""
                        placeholder="Ara..."
                        aria-label="Panel arama alanı"
                        className="input h-11 w-full cursor-default border-[#e2e8f0] bg-[#f8fafc] pl-11 text-sm text-[#0f172a] placeholder:text-[#94a3b8]"
                      />
                    </label>

                    <div className="flex items-center gap-3">
                      <AdminNotificationCenter notifications={adminNotifications} />

                      {primaryAction ? (
                        <Link
                          href={primaryAction.href}
                          className="admin-button-primary inline-flex h-11 items-center justify-center whitespace-nowrap px-5 text-sm font-semibold"
                        >
                          {primaryAction.label}
                        </Link>
                      ) : null}
                    </div>
                  </div>
                </div>
              </header>


              {activeTab === "overview" ? (
                <OverviewSection
                  summary={summary}
                  stageSummary={stageSummary}
                  appointmentLeadCount={appointmentLeadCount}

                  contactLeadCount={contactLeadCount}
                  activePropertyCount={activePropertyCount}
                  passivePropertyCount={passivePropertyCount}
                  users={users}
                  properties={properties}
                  propertyActivityLogs={propertyActivityLogs}
                  blogPosts={blogPosts}
                />
              ) : null}

              {activeTab === "portfolio-create" ? (
                <PortfolioForm advisors={advisors} currentUserRole={currentUser.role} />
              ) : null}
              {activeTab === "portfolio-projects" ? (
                <PortfolioProjectCenter
                  initialCompanyFilter={requestedCompany}
                  initialProperties={properties}
                  advisors={advisors}
                  canDelete={canDeletePortfolios(currentUser.role)}
                  recentActivityLogs={propertyActivityLogs}
                />
              ) : null}
              {activeTab === "portfolio-approval" ? (
                <PortfolioProjectCenter
                  initialPublicationFilter="Onay Bekliyor"
                  initialProperties={properties}
                  advisors={advisors}
                  canDelete={canDeletePortfolios(currentUser.role)}
                  recentActivityLogs={propertyActivityLogs}
                />
              ) : null}
              {activeTab === "portfolio-edit" ? (
                <PortfolioEditor
                  initialProperties={properties}
                  advisors={advisors}
                  currentUserRole={currentUser.role}
                  initialSelectedSlug={requestedSlug}
                  recentActivityLogs={propertyActivityLogs}
                />
              ) : null}

              {activeTab === "portfolio-delete" ? (
                <PortfolioDelete
                  initialProperties={properties}
                  advisors={advisors}
                  canManage={canDeletePortfolios(currentUser.role)}
                />
              ) : null}
              {activeTab === "blog-create" ? <BlogForm defaultAuthorName={currentUser.name} /> : null}
              {activeTab === "blog-edit" ? <BlogEditor initialPosts={blogPosts} /> : null}
              {activeTab === "blog-delete" ? (
 
                <BlogDelete initialPosts={blogPosts} canManage={canManageBlogs(currentUser.role)} />

              ) : null}
              {activeTab === "advisor-manage" ? (
                <AdvisorManagement
                  initialAdvisors={advisorStats}
                  canManage={canManageAdvisors(currentUser.role)}
                />
              ) : null}
              {activeTab === "advisor-edit" ? (

                <AdvisorEditor initialAdvisors={advisors} canManage={canManageAdvisors(currentUser.role)} />
              ) : null}
              {activeTab === "leads" ? (
                canManageLeads(currentUser.role) ? (
                  <LeadPipelineBoard
                    initialLeads={leads}
                    properties={properties}
                    currentUser={currentUser}
                    advisors={advisors}
                  />
                ) : (
                  <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                    CRM Pipeline sadece admin ve danışman rolünde kullanılabilir.

                  </section>
                )
              ) : null}
              {activeTab === "user-manage" ? (
                <UserManagement
                  currentUser={currentUser}
                  initialUsers={users}
                  assignableRoles={assignableUserRoles(currentUser.role)}
                  advisors={advisors}
                />
              ) : null}

            </section>
          </div>

        </div>
      </main>
    </div>
  );
}

type OverviewSectionProps = {
  summary: {
    propertyCount: number;
    blogCount: number;
    advisorCount: number;
    leadCount: number;
    cityCount: number;
  };
  stageSummary: Record<LeadStage, number>;
  appointmentLeadCount: number;
  contactLeadCount: number;
  activePropertyCount: number;
  passivePropertyCount: number;
  users: Array<{ id: string; name: string; email: string; role: string }>;
  properties: ReturnType<typeof listProperties>;
  propertyActivityLogs: ReturnType<typeof listPropertyActivityLogs>;
  blogPosts: ReturnType<typeof listBlogPosts>;
};

function OverviewSection({
  summary,
  stageSummary,
  appointmentLeadCount,
  contactLeadCount,
  activePropertyCount,
  passivePropertyCount,
  users,
  properties,
  propertyActivityLogs,
  blogPosts,
}: OverviewSectionProps) {
  const totalPortfolioValue = properties.reduce((total, property) => total + property.price, 0);

  const offerAnalyticsValue = stageSummary.offer_submitted + stageSummary.called + stageSummary.appointment_scheduled;
  const totalChangeValue = activePropertyCount - passivePropertyCount;
  const otherLeadCount = Math.max(summary.leadCount - appointmentLeadCount - contactLeadCount, 0);

  const metrics = [
    {
      label: "Toplam Gelir",
      value: formatMetricCurrency(totalPortfolioValue),
      delta: clampDelta(((activePropertyCount - passivePropertyCount) / Math.max(summary.propertyCount, 1)) * 100),
      tone: "positive" as const,
      icon: <RevenueMetricIcon />,
    },
    {
      label: "Yeni Kullanıcılar",
      value: formatMetricNumber(users.length),
      delta: clampDelta(((users.length - summary.advisorCount) / Math.max(summary.advisorCount, 1)) * 100),
      tone: users.length >= summary.advisorCount ? ("positive" as const) : ("negative" as const),
      icon: <UsersMetricIcon />,
    },
    {
      label: "Analitik",
      value: formatMetricNumber(offerAnalyticsValue),
      delta: clampDelta(((appointmentLeadCount - contactLeadCount) / Math.max(summary.leadCount, 1)) * 100),
      tone: appointmentLeadCount >= contactLeadCount ? ("positive" as const) : ("negative" as const),
      icon: <AnalyticsMetricIcon />,
    },
    {
      label: "Toplam Değişim",
      value: formatMetricNumber(Math.abs(totalChangeValue)),
      delta: clampDelta((totalChangeValue / Math.max(summary.propertyCount, 1)) * 100),
      tone: totalChangeValue >= 0 ? ("positive" as const) : ("negative" as const),
      icon: <ChangeMetricIcon />,
    },
  ];

  const chartSeries = buildMonthlyActivitySeries(properties, summary.leadCount, appointmentLeadCount, blogPosts.length);
  const trafficSegments = [
    { label: "Organik", value: appointmentLeadCount, color: "#3b82f6" },
    { label: "Sosyal", value: contactLeadCount, color: "#60a5fa" },
    { label: "Doğrudan", value: otherLeadCount, color: "#93c5fd" },
  ];
  const qualitySummaries = properties.map((property) => summarizePropertyQuality(property));
  const readyForApprovalCount = qualitySummaries.filter((summaryItem) => summaryItem.isReadyForApproval).length;
  const criticalAttentionCount = qualitySummaries.filter((summaryItem) => summaryItem.criticalIssues.length > 0).length;
  const advisoryAttentionCount = qualitySummaries.filter(
    (summaryItem) => summaryItem.criticalIssues.length === 0 && summaryItem.advisoryIssues.length > 0,
  ).length;
  const pendingApprovalProperties = properties
    .filter((property) => normalizePropertyPublicationStatus(property.publicationStatus) === "Onay Bekliyor")
    .slice(0, 5);
  const criticalAttentionProperties = properties
    .map((property, index) => ({
      property,
      quality: qualitySummaries[index],
    }))
    .filter((entry) => entry.quality.criticalIssues.length > 0)
    .sort((left, right) => right.quality.criticalIssues.length - left.quality.criticalIssues.length)
    .slice(0, 5);
  const recentActivityLogs = propertyActivityLogs.slice(0, 8);
  const currentPropertySlugs = new Set(properties.map((property) => property.slug));

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricOverviewCard
            key={metric.label}
            label={metric.label}
            value={metric.value}
            delta={metric.delta}
            tone={metric.tone}
            icon={metric.icon}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_320px]">
        <article className="admin-card p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-[#0f172a]">Aylık Satışlar</h2>
              <p className="mt-1 text-sm text-[#64748b]">Aylık portföy ve lead hareketi</p>
            </div>
          </div>

          <DashboardLineChart
            labels={chartSeries.labels}
            primaryValues={chartSeries.primaryValues}
            comparisonValues={chartSeries.comparisonValues}
          />
        </article>

        <article className="admin-card p-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Trafik Kaynakları</h2>
            <p className="mt-1 text-sm text-[#64748b]">Lead kaynak dağılımı</p>
          </div>

          <div className="mt-6">
            <DashboardDonut segments={trafficSegments} />
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-[#64748b]">
            {trafficSegments.map((segment) => (
              <div key={segment.label} className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: segment.color }} />
                <span>{segment.label}</span>
              </div>
            ))}

          </div>
        </article>
      </section>


      <section className="grid gap-4 xl:grid-cols-3">
        <article className="admin-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">Onaya Hazır</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a]">{readyForApprovalCount}</p>
          <p className="mt-2 text-sm text-[#64748b]">Kritik alanları tamamlanmış portföy sayısı</p>
        </article>

        <article className="admin-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Kritik Eksik</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a]">{criticalAttentionCount}</p>
          <p className="mt-2 text-sm text-[#64748b]">Yayına çıkmadan önce müdahale isteyen kayıtlar</p>
        </article>

        <article className="admin-card p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">İçerik Uyarısı</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a]">{advisoryAttentionCount}</p>
          <p className="mt-2 text-sm text-[#64748b]">Ek dil, ikon veya içerik tarafında tamamlanabilecek kayıtlar</p>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <article className="admin-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Öncelik</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0f172a]">Onay Kuyruğu</h2>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-800">
              {pendingApprovalProperties.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {pendingApprovalProperties.length > 0 ? (
              pendingApprovalProperties.map((property) => (
                <Link
                  key={`pending-${property.id}`}
                  href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#0f172a]">{property.title}</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {property.listingRef} • {property.city} / {property.district}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#64748b]">
                Onay bekleyen kayıt bulunmuyor.
              </p>
            )}
          </div>
        </article>

        <article className="admin-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose-700">Müdahale</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0f172a]">Kritik Eksikler</h2>
            </div>
            <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-800">
              {criticalAttentionProperties.length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {criticalAttentionProperties.length > 0 ? (
              criticalAttentionProperties.map(({ property, quality }) => (
                <Link
                  key={`critical-${property.id}`}
                  href={`/yonetim-ofisi?tab=portfolio-edit&slug=${property.slug}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#0f172a]">{property.title}</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {quality.criticalIssues.slice(0, 2).map((issue) => issue.label).join(" • ")}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#64748b]">
                Kritik eksik görünen portföy yok.
              </p>
            )}
          </div>
        </article>

        <article className="admin-card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">Hızlı Akış</p>
              <h2 className="mt-2 text-lg font-semibold text-[#0f172a]">Son Hareketler</h2>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              {recentActivityLogs.slice(0, 5).length}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {recentActivityLogs.slice(0, 5).length > 0 ? (
              recentActivityLogs.slice(0, 5).map((activity) => (
                <Link
                  key={`activity-focus-${activity.id}`}
                  href={`/yonetim-ofisi?tab=portfolio-edit&slug=${activity.propertySlug}`}
                  className="block rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#0f172a]">{activity.propertyTitle}</p>
                  <p className="mt-1 text-xs text-[#64748b]">
                    {activity.actorName} • {propertyActivityActionLabel(activity.actionType)}
                  </p>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 px-4 py-4 text-sm text-[#64748b]">
                Henüz kayıtlı hareket bulunmuyor.
              </p>
            )}

          </div>
        </article>
      </section>


      <section className="admin-card overflow-hidden p-0">
        <div className="flex items-center justify-between gap-3 border-b border-[#e2e8f0] px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-[#0f172a]">Son İşlemler</h2>
            <p className="mt-1 text-sm text-[#64748b]">Son ilan ve yayın hareketleri</p>
          </div>
        </div>

        <div className="overflow-x-auto px-6 py-2">
          <table className="admin-table min-w-full text-left text-sm text-[#475569]">
            <thead>
              <tr>
                <th>Kod</th>
                <th>Tarih</th>
                <th>Kullanıcı</th>
                <th>İşlem</th>
                <th>Portföy</th>
                <th>Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {recentActivityLogs.length > 0 ? (
                recentActivityLogs.map((activity) => {
                  const isExistingProperty = currentPropertySlugs.has(activity.propertySlug);
                  return (
                    <tr key={activity.id}>
                      <td className="font-medium text-[#0f172a]">{activity.listingRef ?? "-"}</td>
                      <td>{formatDateTimeTR(activity.createdAt)}</td>
                      <td>
                        <div>
                          <p className="font-medium text-[#0f172a]">{activity.actorName}</p>
                          <p className="mt-1 text-xs text-[#64748b]">{roleLabel(activity.actorRole)}</p>
                        </div>
                      </td>
                      <td>
                        <div className="space-y-2">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${propertyActivityActionBadgeClass(
                              activity.actionType,
                            )}`}
                          >
                            {propertyActivityActionLabel(activity.actionType)}
                          </span>
                          <p className="text-xs text-[#475569]">{activity.summary}</p>
                        </div>
                      </td>
                      <td>
                        <div>
                          <p className="font-medium text-[#0f172a]">{activity.propertyTitle}</p>
                          <p className="mt-1 text-xs text-[#64748b]">{activity.details[0] ?? "Detay bulunmuyor."}</p>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2 text-[#64748b]">
                          {isExistingProperty ? (
                            <>
                              <Link
                                href={`/yonetim-ofisi?tab=portfolio-edit&slug=${activity.propertySlug}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e2e8f0] bg-white transition hover:bg-[#f8fafc]"
                                aria-label={`${activity.propertyTitle} düzenle`}
                              >
                                <EditActionIcon />
                              </Link>
                              <Link
                                href={`/ilan/${activity.propertySlug}`}
                                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e2e8f0] bg-white transition hover:bg-[#f8fafc]"
                                aria-label={`${activity.propertyTitle} görüntüle`}
                              >
                                <MoreActionIcon />
                              </Link>
                            </>
                          ) : (
                            <span className="text-xs text-[#94a3b8]">Kayıt artık yayında değil</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-[#64748b]">
                    Henüz kaydedilmiş portföy aktivitesi bulunmuyor.
                  </td>

                </tr>
              )}
            </tbody>
          </table>
        </PanelTableShell>
      </section>
    </div>
  );
}


type MetricOverviewCardProps = {
  label: string;
  value: string;
  delta: number;
  tone: "positive" | "negative";
  icon: ReactNode;
};

function MetricOverviewCard({ label, value, delta, tone, icon }: MetricOverviewCardProps) {
  return (
    <article className="admin-stat-card admin-stat-card-dark border-[#e9eef6] shadow-[0_22px_40px_-34px_rgba(15,23,42,0.18)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">{label}</p>
          <p className="mt-3 truncate text-[2rem] font-semibold tracking-tight text-[#0f172a]">{value}</p>
          <p className={`mt-2 text-sm font-semibold ${tone === "positive" ? "text-[#16a34a]" : "text-[#dc2626]"}`}>
            {formatDelta(delta)}
          </p>
        </div>

        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#f8fafc] text-[#60a5fa] shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_16px_30px_-28px_rgba(15,23,42,0.45)]">
          {icon}
        </span>
      </div>
    </article>
  );
}

function buildSmoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length === 0) {
    return "";
  }

  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  const [firstPoint, ...restPoints] = points;
  let path = `M ${firstPoint.x} ${firstPoint.y}`;

  for (let index = 0; index < restPoints.length; index += 1) {
    const previousPoint = points[index];
    const currentPoint = points[index + 1];
    const controlX = (previousPoint.x + currentPoint.x) / 2;

    path += ` C ${controlX} ${previousPoint.y}, ${controlX} ${currentPoint.y}, ${currentPoint.x} ${currentPoint.y}`;
  }

  return path;
}

function DashboardLineChart({
  labels,
  primaryValues,
  comparisonValues,
}: {
  labels: string[];
  primaryValues: number[];
  comparisonValues: number[];
}) {
  const width = 760;
  const height = 280;
  const paddingLeft = 42;
  const paddingRight = 18;
  const paddingTop = 18;
  const paddingBottom = 34;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;
  const maxValue = Math.max(...primaryValues, ...comparisonValues, 1);
  const stepX = labels.length > 1 ? chartWidth / (labels.length - 1) : chartWidth;
  const ticks = 4;

  const primaryPoints = primaryValues.map((value, index) => ({
    x: paddingLeft + stepX * index,
    y: paddingTop + chartHeight - (value / maxValue) * chartHeight,
  }));
  const comparisonPoints = comparisonValues.map((value, index) => ({
    x: paddingLeft + stepX * index,
    y: paddingTop + chartHeight - (value / maxValue) * chartHeight,
  }));

  const primaryPath = buildSmoothPath(primaryPoints);
  const comparisonPath = buildSmoothPath(comparisonPoints);
  const areaPath = `${primaryPath} L ${paddingLeft + chartWidth} ${paddingTop + chartHeight} L ${paddingLeft} ${paddingTop + chartHeight} Z`;

  return (
    <div className="rounded-[1.4rem] border border-[#edf2f7] bg-[#fbfdff] px-4 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)]">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-[280px] w-full" aria-hidden>
        <defs>
          <linearGradient id="dashboard-primary-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        {Array.from({ length: ticks + 1 }, (_, index) => {
          const ratio = index / ticks;
          const y = paddingTop + chartHeight * ratio;
          const tickValue = Math.round(maxValue - maxValue * ratio);

          return (
            <g key={index}>
              <line x1={paddingLeft} y1={y} x2={width - paddingRight} y2={y} stroke="#e8eef5" strokeWidth="1" />
              <text x={paddingLeft - 10} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10">
                {tickValue}
              </text>
            </g>
          );
        })}

        <path d={areaPath} fill="url(#dashboard-primary-area)" />
        <path d={comparisonPath} fill="none" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" />
        <path d={primaryPath} fill="none" stroke="#2563eb" strokeWidth="3" strokeLinecap="round" />

        {primaryPoints.map((point, index) => (
          <circle key={labels[index]} cx={point.x} cy={point.y} r="4.5" fill="#ffffff" stroke="#2563eb" strokeWidth="2" />
        ))}

        {labels.map((label, index) => (
          <text
            key={label}
            x={paddingLeft + stepX * index}
            y={height - 8}
            textAnchor="middle"
            fill="#94a3b8"
            fontSize="11"
          >
            {label}
          </text>
        ))}
      </svg>

    </div>
  );
}


function DashboardDonut({ segments }: { segments: Array<{ label: string; value: number; color: string }> }) {
  const totalValue = segments.reduce((total, segment) => total + segment.value, 0);
  const safeTotal = Math.max(totalValue, 1);
  const gradientStops = segments
    .filter((segment) => segment.value > 0)
    .reduce(
      (accumulator, segment) => {
        const from = (accumulator.progress / safeTotal) * 360;
        const progress = accumulator.progress + segment.value;
        const to = (progress / safeTotal) * 360;

        return {
          progress,
          stops: [...accumulator.stops, `${segment.color} ${from}deg ${to}deg`],
        };
      },
      { progress: 0, stops: [] as string[] },
    )
    .stops;

  const background =
    gradientStops.length > 0 ? `conic-gradient(${gradientStops.join(", ")})` : "conic-gradient(#dbeafe 0deg 360deg)";

  return (
    <div className="flex justify-center">
      <div className="relative h-56 w-56 rounded-full" style={{ background }}>
        <div className="absolute inset-[24px] rounded-full bg-white shadow-[inset_0_0_0_1px_rgba(226,232,240,0.9)]" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-[#94a3b8]">Trafik</p>
          <p className="mt-1 text-[2rem] font-semibold tracking-tight text-[#0f172a]">{totalValue}</p>
        </div>
      </div>
    </div>
  );
}

function DashboardLogoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
      <path d="M7 6.5h7.2c1.55 0 2.8 1.25 2.8 2.8v7.2c0 .55-.45 1-1 1h-7.2A2.8 2.8 0 0 1 6 14.7V7.5c0-.55.45-1 1-1Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="m8.5 15 2.6-4.8 1.8 2.2 2.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PortfolioGroupIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M3.75 6.75A1.75 1.75 0 0 1 5.5 5h2.6c.35 0 .68.14.92.38l1.1 1.12c.24.24.57.37.9.37h3.48a1.75 1.75 0 0 1 1.75 1.75v5.88a1.75 1.75 0 0 1-1.75 1.75h-9A1.75 1.75 0 0 1 3.75 14.5V6.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function BlogGroupIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path d="M5.25 4.75h7.5A1.75 1.75 0 0 1 14.5 6.5v9a.75.75 0 0 1-1.18.61L10 13.75l-3.32 2.36a.75.75 0 0 1-1.18-.61v-9a1.75 1.75 0 0 1 1.75-1.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M7.5 8h5M7.5 10.75h3.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="m5.5 7.75 4.5 4.5 4.5-4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <circle cx="8.75" cy="8.75" r="4.75" stroke="currentColor" strokeWidth="1.6" />
      <path d="m12.5 12.5 3.25 3.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function RevenueMetricIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M10 4.5v11M13.25 7.25c0-1.25-1.45-2.25-3.25-2.25s-3.25 1-3.25 2.25S8.2 9.5 10 9.5s3.25 1 3.25 2.25S11.8 14 10 14s-3.25-1-3.25-2.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function UsersMetricIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M7 8.25A2.25 2.25 0 1 0 7 3.75a2.25 2.25 0 0 0 0 4.5ZM13.5 9.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.75 15.5a3.25 3.25 0 0 1 6.5 0M11.25 15.5a2.25 2.25 0 0 1 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function AnalyticsMetricIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M5 14.5V9.75M10 14.5V5.5M15 14.5V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function ChangeMetricIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden>
      <path d="M5.5 12.75 8.75 9.5l2.25 2.25L14.5 7.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.75 7.5h2.75v2.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditActionIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4.5 13.75V15.5h1.75L14 7.75 12.25 6 4.5 13.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m11.5 6.75 1.75 1.75" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />

    </svg>
  );
}


function MoreActionIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="5.5" cy="10" r="1.1" fill="currentColor" />
      <circle cx="10" cy="10" r="1.1" fill="currentColor" />
      <circle cx="14.5" cy="10" r="1.1" fill="currentColor" />
    </svg>
  );
}

function TabNavigationIcon({ tab }: { tab: PanelTab }) {
  switch (tab) {
    case "overview":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <path d="M4.5 10.25 10 5.5l5.5 4.75v5A1.25 1.25 0 0 1 14.25 16.5h-8.5A1.25 1.25 0 0 1 4.5 15.25v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "portfolio-create":
    case "portfolio-approval":
    case "portfolio-projects":
    case "portfolio-edit":
    case "portfolio-delete":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <rect x="4.25" y="4.25" width="11.5" height="11.5" rx="1.75" stroke="currentColor" strokeWidth="1.6" />
          <path d="M7 10h6M10 7v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "blog-create":
    case "blog-edit":
    case "blog-delete":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <path d="M5 4.75h6.75a1.5 1.5 0 0 1 1.06.44l1.75 1.75c.28.28.44.66.44 1.06v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 14V6.25A1.5 1.5 0 0 1 5 4.75Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7 9h6M7 12h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "advisor-manage":
    case "advisor-edit":
    case "user-manage":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <path d="M7.25 8.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5ZM13.25 9.25a1.75 1.75 0 1 0 0-3.5 1.75 1.75 0 0 0 0 3.5Z" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.75 15.5a3.5 3.5 0 0 1 7 0M11.25 15.5a2.25 2.25 0 0 1 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "leads":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <path d="M5 14.5V9.75M10 14.5V5.5M15 14.5V11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 15.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <circle cx="10" cy="10" r="5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
  }

}
