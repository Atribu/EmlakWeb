import Link from "next/link";
import { redirect } from "next/navigation";
import { AdvisorEditor } from "@/components/panel/advisor-editor";
import { AdvisorManagement } from "@/components/panel/advisor-management";
import { AdminNotificationCenter } from "@/components/panel/admin-notification-center";
import { AdminOverviewSection } from "@/components/panel/admin-overview-section";
import { BlogDelete } from "@/components/panel/blog-delete";
import { BlogEditor } from "@/components/panel/blog-editor";
import { BlogForm } from "@/components/panel/blog-form";
import { HomeLocationSpotlightManager } from "@/components/panel/home-location-spotlight-manager";
import { LeadPipelineBoard } from "@/components/panel/lead-pipeline-board";
import { PortfolioDelete } from "@/components/panel/portfolio-delete";
import { PortfolioEditor } from "@/components/panel/portfolio-editor";
import { PortfolioForm } from "@/components/panel/portfolio-form";
import { PortfolioProjectCenter } from "@/components/panel/portfolio-project-center";
import { UserManagement } from "@/components/panel/user-management";
import {
  assignableUserRoles,
  canCreateOrEditPortfolios,
  canDeletePortfolios,
  canManageAdvisors,
  canManageBlogs,
  canManageLeads,
  filterLeadsForActor,
  filterUsersForActor,
} from "@/lib/access-control";
import {
  blogGroupTabs,
  panelTabs,
  portfolioGroupTabs,
  primaryActionForTabs,
  resolvePanelTab,
  visibleTabsForRole,
  type PanelTab,
} from "@/lib/admin-panel-navigation";
import { buildAdminNotifications } from "@/lib/admin-notifications";
import { getCurrentUser } from "@/lib/auth";
import {
  dashboardSummary,
  leadStageSummary,
  listAdvisors,
  listBlogPosts,
  listHomeLocationSpotlights,
  listLeads,
  listPropertyActivityLogs,
  listProperties,
  listUsers,
} from "@/lib/data-store";

import { roleLabel } from "@/lib/format";
import { isPropertyPublished, normalizePropertyPublicationStatus } from "@/lib/property-panel-options";

type AdminOfficePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function initialsForName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
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
  const activeTab = resolvePanelTab(requestedTab, allowedTabs);
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
  const homeLocationSpotlights = listHomeLocationSpotlights();
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
                <AdminOverviewSection
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
              {activeTab === "portfolio-locations" ? (
                <HomeLocationSpotlightManager
                  initialSpotlights={homeLocationSpotlights}
                  canManage={canCreateOrEditPortfolios(currentUser.role)}
                />
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

function TabNavigationIcon({ tab }: { tab: PanelTab }) {
  switch (tab) {
    case "overview":
      return (
        <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
          <path d="M4.5 10.25 10 5.5l5.5 4.75v5A1.25 1.25 0 0 1 14.25 16.5h-8.5A1.25 1.25 0 0 1 4.5 15.25v-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "portfolio-create":
    case "portfolio-locations":
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
