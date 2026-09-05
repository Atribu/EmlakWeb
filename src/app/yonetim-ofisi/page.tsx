import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdvisorEditor } from "@/components/panel/advisor-editor";
import { AdvisorManagement } from "@/components/panel/advisor-management";
import { AdminNotificationCenter } from "@/components/panel/admin-notification-center";
import { AdminOverviewSection } from "@/components/panel/admin-overview-section";
import { AdminSidebar } from "@/components/panel/admin-sidebar";
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

import { isPropertyPublished, normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("Yönetim Ofisi | RODINA Invest Co.");

type AdminOfficePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

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
          <div className="grid min-h-screen xl:grid-cols-[272px_minmax(0,1fr)]">
            <AdminSidebar
              activeTab={activeTab}
              overviewTab={overviewTab}
              portfolioTabs={visiblePortfolioTabs}
              blogTabs={visibleBlogTabs}
              standaloneTabs={secondaryStandaloneTabs}
              pendingApprovalCount={pendingApprovalCount}
              currentUser={{ name: currentUser.name, role: currentUser.role }}
            />

            <section className="admin-workspace admin-content min-w-0">
              <header className="admin-topbar">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="admin-page-kicker">RODINA Operasyon</span>
                      <span className="admin-page-context">{activeTabMeta.label}</span>
                    </div>
                    <h1 className="admin-page-title">{toolbarTitle}</h1>
                    <p className="admin-page-subtitle">{toolbarSubtitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="admin-system-status">
                      <span className="admin-system-status-dot" />
                      Sistem aktif
                    </div>

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
