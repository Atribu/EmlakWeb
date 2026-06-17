import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { BrandLogo } from "@/components/brand-logo";
import { AdvisorEditor } from "@/components/panel/advisor-editor";
import { AdvisorManagement } from "@/components/panel/advisor-management";
import { BlogDelete } from "@/components/panel/blog-delete";
import { BlogEditor } from "@/components/panel/blog-editor";
import { BlogForm } from "@/components/panel/blog-form";
import { LeadPipelineBoard } from "@/components/panel/lead-pipeline-board";
import { PortfolioDelete } from "@/components/panel/portfolio-delete";
import { PortfolioEditor } from "@/components/panel/portfolio-editor";
import { PortfolioForm } from "@/components/panel/portfolio-form";
import { UserManagement } from "@/components/panel/user-management";
import { SiteHeader } from "@/components/site-header";
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
import { getCurrentUser } from "@/lib/auth";
import {
  dashboardSummary,
  leadStageSummary,
  listAdvisors,
  listBlogPosts,
  listLeads,
  listProperties,
  listUsers,
} from "@/lib/data-store";
import { formatDateTR, formatPrice, leadStageLabel, roleLabel } from "@/lib/format";
import type { LeadStage } from "@/lib/types";

type PanelTab =
  | "overview"
  | "portfolio-create"
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

type PanelTabConfig = {
  id: PanelTab;
  label: string;
  hint: string;
  group: "Kontrol" | "Portföy" | "İçerik" | "Ekip" | "CRM";
};

const panelTabs: PanelTabConfig[] = [
  { id: "overview", label: "Genel Bakış", hint: "Operasyon özeti ve performans", group: "Kontrol" },
  { id: "portfolio-create", label: "Portföy Yükle", hint: "Yeni ilan oluştur", group: "Portföy" },
  { id: "portfolio-edit", label: "Portföy Düzenle", hint: "Mevcut ilanı güncelle", group: "Portföy" },
  { id: "portfolio-delete", label: "Portföy Sil", hint: "Yayındaki ilanı kaldır", group: "Portföy" },
  { id: "blog-create", label: "Blog Ekle", hint: "SEO içerik yayınla", group: "İçerik" },
  { id: "blog-edit", label: "Blog Düzenle", hint: "Yayınlanan yazıyı güncelle", group: "İçerik" },
  { id: "blog-delete", label: "Blog Sil", hint: "Yayındaki yazıyı kaldır", group: "İçerik" },
  { id: "advisor-manage", label: "Danışman Ekle/Sil", hint: "Kayıt yönetimi", group: "Ekip" },
  { id: "advisor-edit", label: "Danışman Düzenle", hint: "Bilgileri güncelle", group: "Ekip" },
  { id: "user-manage", label: "Kullanıcı Yönetimi", hint: "Hesap ve rol oluştur", group: "Ekip" },
  { id: "leads", label: "CRM Lead Pipeline", hint: "Aşama takibi", group: "CRM" },
];

const defaultTab: PanelTab = "overview";

function visibleTabsForRole(role: string): PanelTab[] {
  const output: PanelTab[] = [];

  if (canAccessOverview(role)) {
    output.push("overview");
  }

  if (canCreateOrEditPortfolios(role)) {
    output.push("portfolio-create", "portfolio-edit");
  }

  if (canDeletePortfolios(role)) {
    output.push("portfolio-delete");
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

export default async function AdminOfficePage({ searchParams }: AdminOfficePageProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/yetkili-giris?next=/yonetim-ofisi");
  }

  const resolvedSearchParams = await searchParams;
  const requestedTabRaw = resolvedSearchParams.tab;
  const requestedTab = Array.isArray(requestedTabRaw) ? requestedTabRaw[0] : requestedTabRaw;
  const allowedTabs = visibleTabsForRole(currentUser.role);
  const activeTab = resolveTab(requestedTab, allowedTabs);
  const visibleTabs = panelTabs.filter((tab) => allowedTabs.includes(tab.id));
  const activeTabConfig = visibleTabs.find((tab) => tab.id === activeTab) ?? visibleTabs[0] ?? panelTabs[0];
  const visibleTabGroups = Array.from(new Set(visibleTabs.map((tab) => tab.group)));

  const advisors = listAdvisors();
  const properties = listProperties();
  const allUsers = listUsers();
  const users = filterUsersForActor(currentUser, allUsers);
  const summary = dashboardSummary();
  const blogPosts = listBlogPosts();
  const allLeads = listLeads();
  const leads = filterLeadsForActor(currentUser, allLeads);
  const stageSummary = leadStageSummary();
  const appointmentLeadCount = allLeads.filter((lead) => lead.source === "appointment_form").length;
  const advisorStats = advisors.map((advisor) => ({
    ...advisor,
    propertyCount: properties.filter((property) => property.advisorId === advisor.id).length,
    linkedUserCount: allUsers.filter((user) => user.advisorId === advisor.id).length,
  }));
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  const totalPortfolioValue = properties.reduce((total, property) => total + property.price, 0);

  return (
    <div className="admin-workspace min-h-screen">
      <SiteHeader initialUser={currentUser} />

      <main className="mx-auto w-full max-w-[1500px] px-4 pb-14 pt-5 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-lg border border-[rgba(102,165,87,0.26)] bg-[var(--brand-night-blue)] text-white shadow-[0_28px_70px_-52px_rgba(29,38,68,0.95)]">
          <div className="grid gap-6 px-5 py-6 sm:px-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:px-8 lg:py-7">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <BrandLogo inverse className="text-[1.7rem] sm:text-[2rem]" />
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[#dcedd7]">
                  Yönetim Paneli
                </span>
              </div>
              <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Operasyon, portföy ve CRM kontrol merkezi.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[#dce8d8]">
                Hoş geldin {currentUser.name}. {roleLabel(currentUser.role)} yetkisiyle Econi Invest içeriklerini,
                portföylerini ve müşteri akışını tek ekrandan yönetiyorsun.
              </p>
            </div>

            <div className="grid min-w-[min(100%,520px)] gap-3 sm:grid-cols-2">
              <PanelMetric label="Aktif portföy" value={String(summary.propertyCount)} helper={formatPrice(totalPortfolioValue)} />
              <PanelMetric label="Lead akışı" value={String(summary.leadCount)} helper={`${stageSummary.new} yeni kayıt`} />
              <PanelMetric label="İçerik" value={String(summary.blogCount)} helper="SEO yayınları" />
              <PanelMetric label="Ekip" value={String(summary.advisorCount)} helper={`${users.length} panel kullanıcısı`} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-white/10 bg-[#151d35] px-5 py-3 sm:px-7 lg:px-8">
            <PanelActionLink href="/portfoyler" label="Yayındaki portföyler" />
            {allowedTabs.includes("portfolio-create") ? (
              <PanelActionLink href="/yonetim-ofisi?tab=portfolio-create" label="Yeni portföy" />
            ) : null}
            {allowedTabs.includes("leads") ? <PanelActionLink href="/yonetim-ofisi?tab=leads" label="CRM pipeline" /> : null}
            <PanelActionLink href="/" label="Canlı site" />
          </div>
        </section>

        <div className="mt-5 grid gap-5 xl:grid-cols-[310px_minmax(0,1fr)]">
          <aside className="h-fit rounded-lg border border-[var(--line-strong)] bg-white p-4 shadow-[0_24px_54px_-44px_rgba(29,38,68,0.42)] xl:sticky xl:top-24">
            <div className="rounded-lg border border-[rgba(102,165,87,0.18)] bg-[#f7faf5] p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[var(--brand-night-blue)] text-sm font-bold text-white">
                  {getInitials(currentUser.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--brand-ink)]">{currentUser.name}</p>
                  <p className="truncate text-xs text-[var(--ink-600)]">{currentUser.email}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full border border-[rgba(102,165,87,0.28)] bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--brand-accent-strong)]">
                  {roleLabel(currentUser.role)}
                </span>
                <span className="rounded-full border border-[var(--line)] bg-white px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-600)]">
                  {visibleTabs.length} modül
                </span>
              </div>
            </div>

            <nav className="mt-4 space-y-5">
              {visibleTabGroups.map((group) => (
                <div key={group}>
                  <p className="mb-2 px-1 text-[0.66rem] font-bold uppercase tracking-[0.2em] text-[var(--ink-500)]">
                    {group}
                  </p>
                  <div className="space-y-1.5">
                    {visibleTabs
                      .filter((tab) => tab.group === group)
                      .map((tab) => {
                        const isActive = tab.id === activeTab;
                        return (
                          <Link
                            key={tab.id}
                            href={`/yonetim-ofisi?tab=${tab.id}`}
                            className={`group flex items-center gap-3 rounded-lg border px-3 py-2.5 transition ${
                              isActive
                                ? "border-[var(--brand-night-blue)] bg-[var(--brand-night-blue)] text-white shadow-[0_18px_34px_-28px_rgba(29,38,68,0.95)]"
                                : "border-transparent bg-white text-[var(--ink-700)] hover:border-[var(--line-strong)] hover:bg-[#f7faf5]"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${
                                isActive
                                  ? "border-white/15 bg-white/10 text-[var(--brand-green)]"
                                  : "border-[var(--line)] bg-[#f7faf5] text-[var(--brand-night-blue)] group-hover:border-[rgba(102,165,87,0.32)]"
                              }`}
                            >
                              <PanelTabIcon id={tab.id} />
                            </span>
                            <span className="min-w-0">
                              <span className="block truncate text-sm font-bold">{tab.label}</span>
                              <span className={`block truncate text-xs ${isActive ? "text-[#dce8d8]" : "text-[var(--ink-500)]"}`}>
                                {tab.hint}
                              </span>
                            </span>
                          </Link>
                        );
                      })}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <section className="min-w-0">
            <div className="mb-4 rounded-lg border border-[var(--line-strong)] bg-white px-5 py-4 shadow-[0_22px_46px_-40px_rgba(29,38,68,0.35)]">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-strong)]">
                    {activeTabConfig.group}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-[var(--brand-ink)]">{activeTabConfig.label}</h2>
                  <p className="mt-1 text-sm text-[var(--ink-600)]">{activeTabConfig.hint}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[var(--line)] bg-[#f7faf5] px-3 py-1.5 text-xs font-bold text-[var(--ink-700)]">
                    Yetki: {roleLabel(currentUser.role)}
                  </span>
                  <span className="rounded-full border border-[rgba(102,165,87,0.28)] bg-[#eef5ec] px-3 py-1.5 text-xs font-bold text-[var(--brand-accent-strong)]">
                    Econi Invest
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {activeTab === "overview" ? (
                <OverviewSection
                  summary={summary}
                  stageSummary={stageSummary}
                  appointmentLeadCount={appointmentLeadCount}
                  users={users}
                  properties={properties}
                  blogPosts={blogPosts}
                  advisorMap={advisorMap}
                />
              ) : null}

              {activeTab === "portfolio-create" ? <PortfolioForm advisors={advisors} /> : null}
              {activeTab === "portfolio-edit" ? <PortfolioEditor initialProperties={properties} advisors={advisors} /> : null}
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
                <BlogDelete
                  initialPosts={blogPosts}
                  canManage={canManageBlogs(currentUser.role)}
                />
              ) : null}
              {activeTab === "advisor-manage" ? (
                <AdvisorManagement
                  initialAdvisors={advisorStats}
                  canManage={canManageAdvisors(currentUser.role)}
                />
              ) : null}
              {activeTab === "advisor-edit" ? (
                <AdvisorEditor
                  initialAdvisors={advisors}
                  canManage={canManageAdvisors(currentUser.role)}
                />
              ) : null}
              {activeTab === "leads" ? (
                canManageLeads(currentUser.role) ? (
                  <LeadPipelineBoard initialLeads={leads} properties={properties} currentUser={currentUser} advisors={advisors} />
                ) : (
                  <section className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-sm font-medium text-amber-900">
                    CRM Pipeline sadece portal admin, admin ve danışman rolünde kullanılabilir.
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
            </div>
          </section>
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
  users: Array<{ id: string; name: string; email: string; role: string }>;
  properties: ReturnType<typeof listProperties>;
  blogPosts: ReturnType<typeof listBlogPosts>;
  advisorMap: Map<string, { name: string }>;
};

function OverviewSection({
  summary,
  stageSummary,
  appointmentLeadCount,
  users,
  properties,
  blogPosts,
  advisorMap,
}: OverviewSectionProps) {
  const totalPortfolioValue = properties.reduce((total, property) => total + property.price, 0);
  const leadStages: LeadStage[] = ["new", "called", "appointment_scheduled", "offer_submitted", "won", "lost"];
  const maxStageCount = Math.max(1, ...leadStages.map((stage) => stageSummary[stage]));

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PanelStatCard
          label="Portföy Değeri"
          value={formatPrice(totalPortfolioValue)}
          helper={`${summary.propertyCount} aktif portföy / ${summary.cityCount} şehir`}
          tone="night"
        />
        <PanelStatCard
          label="Lead Hacmi"
          value={String(summary.leadCount)}
          helper={`${stageSummary.new} yeni, ${appointmentLeadCount} randevu talebi`}
          tone="green"
        />
        <PanelStatCard
          label="Yayın Akışı"
          value={String(summary.blogCount)}
          helper="Blog ve SEO içerikleri"
          tone="paper"
        />
        <PanelStatCard
          label="Saha Ekibi"
          value={String(summary.advisorCount)}
          helper={`${users.length} yetkili panel kullanıcısı`}
          tone="paper"
        />
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
        <article className="rounded-lg border border-[var(--line-strong)] bg-white p-5 shadow-[0_22px_46px_-40px_rgba(29,38,68,0.34)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-strong)]">
                CRM Pipeline
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-[var(--brand-ink)]">Lead Aşama Dağılımı</h3>
            </div>
            <span className="rounded-full border border-[rgba(102,165,87,0.26)] bg-[#eef5ec] px-3 py-1 text-xs font-bold text-[var(--brand-accent-strong)]">
              {summary.leadCount} toplam lead
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {leadStages.map((stage) => {
              const count = stageSummary[stage];
              const width = `${(count / maxStageCount) * 100}%`;

              return (
                <div key={stage}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                    <span className="font-semibold text-[var(--ink-700)]">{leadStageLabel(stage)}</span>
                    <span className="font-bold text-[var(--brand-ink)]">{count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-[#edf3ea]">
                    <div className="h-full rounded-full bg-[var(--brand-green)]" style={{ width }} />
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-lg border border-[var(--line-strong)] bg-white p-5 shadow-[0_22px_46px_-40px_rgba(29,38,68,0.34)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-strong)]">
                Yetki Matrisi
              </p>
              <h3 className="mt-1 text-xl font-bold tracking-tight text-[var(--brand-ink)]">Panel Kullanıcıları</h3>
            </div>
            <span className="rounded-full border border-[var(--line)] bg-[#f7faf5] px-3 py-1 text-xs font-bold text-[var(--ink-600)]">
              {users.length} hesap
            </span>
          </div>

          <div className="mt-5 divide-y divide-[var(--line)]">
            {users.slice(0, 6).map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[var(--brand-ink)]">{user.name}</p>
                  <p className="truncate text-xs text-[var(--ink-500)]">{user.email}</p>
                </div>
                <span className="shrink-0 rounded-full border border-[rgba(102,165,87,0.22)] bg-[#f7faf5] px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[var(--ink-700)]">
                  {roleLabel(user.role)}
                </span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-5 2xl:grid-cols-2">
        <PanelTableShell title="Son Portföyler" eyebrow="Envanter" href="/portfoyler" cta="Portföylere git">
          <table className="min-w-full text-left text-sm text-[var(--ink-700)]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-500)]">
                <th className="py-3 pr-4">Kod</th>
                <th className="py-3 pr-4">Başlık</th>
                <th className="py-3 pr-4">Değer</th>
                <th className="py-3 pr-4">Danışman</th>
                <th className="py-3 pr-4">Durum</th>
              </tr>
            </thead>
            <tbody>
              {properties.slice(0, 8).map((property) => (
                <tr key={property.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="py-3 pr-4 font-bold text-[var(--brand-ink)]">{property.listingRef}</td>
                  <td className="max-w-[280px] py-3 pr-4">
                    <Link href={`/ilan/${property.slug}`} className="line-clamp-1 font-semibold hover:text-[var(--brand-accent-strong)]">
                      {property.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4 font-semibold">{formatPrice(property.price)}</td>
                  <td className="py-3 pr-4">{advisorMap.get(property.advisorId)?.name ?? "-"}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-[#eef5ec] px-2.5 py-1 text-xs font-bold text-[var(--brand-accent-strong)]">
                      Yayında
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelTableShell>

        <PanelTableShell title="Son Blog Yazıları" eyebrow="İçerik" href="/blog" cta="Blog sayfasına git">
          <table className="min-w-full text-left text-sm text-[var(--ink-700)]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[var(--ink-500)]">
                <th className="py-3 pr-4">Başlık</th>
                <th className="py-3 pr-4">Yazar</th>
                <th className="py-3 pr-4">Tarih</th>
                <th className="py-3 pr-4">SEO</th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.slice(0, 8).map((post) => (
                <tr key={post.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="max-w-[320px] py-3 pr-4">
                    <Link href={`/blog/${post.slug}`} className="line-clamp-1 font-bold text-[var(--brand-ink)] hover:text-[var(--brand-accent-strong)]">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-3 pr-4">{post.authorName}</td>
                  <td className="py-3 pr-4">{formatDateTR(post.publishedAt)}</td>
                  <td className="py-3 pr-4">
                    <span className="rounded-full bg-[#eef5ec] px-2.5 py-1 text-xs font-bold text-[var(--brand-accent-strong)]">
                      Meta Hazır
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelTableShell>
      </section>
    </div>
  );
}

type PanelMetricProps = {
  label: string;
  value: string;
  helper: string;
};

function PanelMetric({ label, value, helper }: PanelMetricProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/10 p-4">
      <p className="text-[0.65rem] font-bold uppercase tracking-[0.18em] text-[#cce4c5]">{label}</p>
      <p className="mt-2 text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 truncate text-xs text-[#dce8d8]">{helper}</p>
    </div>
  );
}

function PanelActionLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#eff8ec] transition hover:border-[rgba(102,165,87,0.55)] hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

type PanelStatCardProps = {
  label: string;
  value: string;
  helper: string;
  tone: "night" | "green" | "paper";
};

function PanelStatCard({ label, value, helper, tone }: PanelStatCardProps) {
  const toneClass =
    tone === "night"
      ? "border-[var(--brand-night-blue)] bg-[var(--brand-night-blue)] text-white"
      : tone === "green"
        ? "border-[rgba(102,165,87,0.36)] bg-[#eef5ec] text-[var(--brand-ink)]"
        : "border-[var(--line-strong)] bg-white text-[var(--brand-ink)]";
  const helperClass = tone === "night" ? "text-[#dce8d8]" : "text-[var(--ink-600)]";

  return (
    <div className={`rounded-lg border p-5 shadow-[0_22px_46px_-42px_rgba(29,38,68,0.5)] ${toneClass}`}>
      <p className="text-[0.66rem] font-bold uppercase tracking-[0.2em] opacity-75">{label}</p>
      <p className="mt-3 break-words text-2xl font-bold tracking-tight">{value}</p>
      <p className={`mt-2 text-sm ${helperClass}`}>{helper}</p>
    </div>
  );
}

function PanelTableShell({
  title,
  eyebrow,
  href,
  cta,
  children,
}: {
  title: string;
  eyebrow: string;
  href: string;
  cta: string;
  children: ReactNode;
}) {
  return (
    <article className="overflow-hidden rounded-lg border border-[var(--line-strong)] bg-white shadow-[0_22px_46px_-40px_rgba(29,38,68,0.34)]">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[var(--brand-accent-strong)]">{eyebrow}</p>
          <h3 className="mt-1 text-xl font-bold tracking-tight text-[var(--brand-ink)]">{title}</h3>
        </div>
        <Link href={href} className="text-sm font-bold text-[var(--brand-night-blue)] underline decoration-[var(--brand-green)] underline-offset-4">
          {cta}
        </Link>
      </div>
      <div className="overflow-x-auto px-5 pb-3">{children}</div>
    </article>
  );
}

function PanelTabIcon({ id }: { id: PanelTab }) {
  if (id === "overview") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 19V5" />
        <path d="M4 19h16" />
        <path d="m8 15 3-4 3 2 4-6" />
      </svg>
    );
  }

  if (id.startsWith("portfolio")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m3 11 9-7 9 7" />
        <path d="M5 10v10h14V10" />
        <path d="M9 20v-6h6v6" />
      </svg>
    );
  }

  if (id.startsWith("blog")) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M6 3h9l3 3v15H6z" />
        <path d="M14 3v4h4" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    );
  }

  if (id === "leads") {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M5 6h6" />
        <path d="M5 12h10" />
        <path d="M5 18h14" />
        <path d="M17 5v4" />
        <path d="M13 11v4" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 11a4 4 0 1 0-8 0" />
      <path d="M4 21a8 8 0 0 1 16 0" />
      <path d="M17 4a3 3 0 0 1 0 6" />
      <path d="M21 21a6 6 0 0 0-4-5.7" />
    </svg>
  );
}

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR") ?? "")
    .join("");

  return initials || "EI";
}
