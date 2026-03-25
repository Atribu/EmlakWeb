import Link from "next/link";
import { redirect } from "next/navigation";

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
import { roleLabel } from "@/lib/format";
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

const panelTabs: Array<{ id: PanelTab; label: string; hint: string }> = [
  { id: "overview", label: "Genel Bakış", hint: "Özet ve hızlı tablolar" },
  { id: "portfolio-create", label: "Portföy Yükle", hint: "Yeni ilan oluştur" },
  { id: "portfolio-edit", label: "Portföy Düzenle", hint: "Mevcut ilanı güncelle" },
  { id: "portfolio-delete", label: "Portföy Sil", hint: "Yayındaki ilanı kaldır" },
  { id: "blog-create", label: "Blog Ekle", hint: "SEO içerik yayınla" },
  { id: "blog-edit", label: "Blog Düzenle", hint: "Yayınlanan yazıyı güncelle" },
  { id: "blog-delete", label: "Blog Sil", hint: "Yayındaki yazıyı kaldır" },
  { id: "advisor-manage", label: "Danışman Ekle/Sil", hint: "Kayıt yönetimi" },
  { id: "advisor-edit", label: "Danışman Düzenle", hint: "Bilgileri güncelle" },
  { id: "leads", label: "CRM Lead Pipeline", hint: "Aşama takibi" },
  { id: "user-manage", label: "Kullanıcı Yönetimi", hint: "Hesap ve rol oluştur" },
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

  const advisors = listAdvisors();
  const properties = listProperties();
  const allUsers = listUsers();
  const users = filterUsersForActor(currentUser, allUsers);
  const summary = dashboardSummary();
  const blogPosts = listBlogPosts();
  const leads = listLeads();
  const stageSummary = leadStageSummary();
  const appointmentLeadCount = leads.filter((lead) => lead.source === "appointment_form").length;
  const advisorStats = advisors.map((advisor) => ({
    ...advisor,
    propertyCount: properties.filter((property) => property.advisorId === advisor.id).length,
    linkedUserCount: allUsers.filter((user) => user.advisorId === advisor.id).length,
  }));
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="mx-auto w-full max-w-[1320px] px-4 pb-12 pt-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Yönetim Ofisi</h1>
            <p className="mt-2 text-sm text-slate-600">
              Hoş geldin {currentUser.name}. Rolün: <strong>{roleLabel(currentUser.role)}</strong>
            </p>

            <nav className="mt-5 space-y-2">
              {visibleTabs.map((tab) => {
                const isActive = tab.id === activeTab;
                return (
                  <Link
                    key={tab.id}
                    href={`/yonetim-ofisi?tab=${tab.id}`}
                    className={`block rounded-xl border px-3 py-2.5 transition ${
                      isActive
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                    }`}
                  >
                    <p className="text-sm font-semibold">{tab.label}</p>
                    <p className={`text-xs ${isActive ? "text-slate-200" : "text-slate-500"}`}>{tab.hint}</p>
                  </Link>
                );
              })}
            </nav>
          </aside>

          <section className="min-w-0">
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
                <LeadPipelineBoard initialLeads={leads} properties={properties} />
              ) : (
                <section className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
                  CRM Pipeline sadece portal admin ve admin rolünde kullanılabilir.
                </section>
              )
            ) : null}
            {activeTab === "user-manage" ? (
              <UserManagement
                currentUser={currentUser}
                initialUsers={users}
                assignableRoles={assignableUserRoles(currentUser.role)}
              />
            ) : null}
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
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Genel Bakış</h2>
        <p className="mt-2 text-sm text-slate-600">Panel metrikleri ve operasyon özeti.</p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <StatCard label="Portföy" value={String(summary.propertyCount)} />
          <StatCard label="Danışman" value={String(summary.advisorCount)} />
          <StatCard label="Blog" value={String(summary.blogCount)} />
          <StatCard label="Lead" value={String(summary.leadCount)} />
          <StatCard label="Şehir" value={String(summary.cityCount)} />
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <StatCard label="Yeni Lead" value={String(stageSummary.new)} />
          <StatCard label="Randevu Talebi" value={String(appointmentLeadCount)} />
          <StatCard label="Teklif Aşaması" value={String(stageSummary.offer_submitted)} />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">Kullanıcı Rolleri</h3>
          <p className="mt-2 text-sm text-slate-600">Portal admin, admin, portföy ve içerik hesapları.</p>

          <ul className="mt-4 space-y-3">
            {users.map((user) => (
              <li key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-600">{user.email}</p>
                <p className="text-sm text-slate-500">Rol: {roleLabel(user.role)}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-slate-900">Son Portföyler</h3>
            <Link href="/portfoyler" className="text-sm font-semibold text-slate-700 underline">
              Portföylere git
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                  <th className="py-2 pr-3">Kod</th>
                  <th className="py-2 pr-3">Başlık</th>
                  <th className="py-2 pr-3">Danışman</th>
                  <th className="py-2 pr-3">Durum</th>
                </tr>
              </thead>
              <tbody>
                {properties.slice(0, 8).map((property) => (
                  <tr key={property.id} className="border-b border-slate-100">
                    <td className="py-2 pr-3 font-semibold">{property.listingRef}</td>
                    <td className="py-2 pr-3">
                      <Link href={`/ilan/${property.slug}`} className="hover:underline">
                        {property.title}
                      </Link>
                    </td>
                    <td className="py-2 pr-3">{advisorMap.get(property.advisorId)?.name ?? "-"}</td>
                    <td className="py-2 pr-3 text-emerald-700">Yayında</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">Son Blog Yazıları</h3>
          <Link href="/blog" className="text-sm font-semibold text-slate-700 underline">
            Blog sayfasına git
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-700">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-[0.16em] text-slate-400">
                <th className="py-2 pr-3">Başlık</th>
                <th className="py-2 pr-3">Yazar</th>
                <th className="py-2 pr-3">Tarih</th>
                <th className="py-2 pr-3">SEO</th>
              </tr>
            </thead>
            <tbody>
              {blogPosts.slice(0, 8).map((post) => (
                <tr key={post.id} className="border-b border-slate-100">
                  <td className="py-2 pr-3">
                    <Link href={`/blog/${post.slug}`} className="font-semibold hover:underline">
                      {post.title}
                    </Link>
                  </td>
                  <td className="py-2 pr-3">{post.authorName}</td>
                  <td className="py-2 pr-3">{new Date(post.publishedAt).toLocaleDateString("tr-TR")}</td>
                  <td className="py-2 pr-3 text-emerald-700">Meta Hazır</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
};

function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
