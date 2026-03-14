import Link from "next/link";
import { redirect } from "next/navigation";

import { PortfolioForm } from "@/components/panel/portfolio-form";
import { SiteHeader } from "@/components/site-header";
import {
  dashboardSummary,
  listAdvisors,
  listLeads,
  listProperties,
  listUsers,
} from "@/lib/data-store";
import { roleLabel } from "@/lib/format";
import { getCurrentUser } from "@/lib/auth";

export default async function PanelPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/giris?next=/panel");
  }

  const advisors = listAdvisors();
  const properties = listProperties();
  const users = listUsers();
  const summary = dashboardSummary();
  const leads = listLeads();

  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pb-12 pt-6 sm:px-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Yönetim Paneli</h1>
          <p className="mt-2 text-sm text-slate-600">
            Hoş geldin {currentUser.name}. Rolün: <strong>{roleLabel(currentUser.role)}</strong>
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard label="Portföy" value={String(summary.propertyCount)} />
            <StatCard label="Danışman" value={String(summary.advisorCount)} />
            <StatCard label="Lead" value={String(summary.leadCount)} />
            <StatCard label="Şehir" value={String(summary.cityCount)} />
          </div>
        </section>

        <PortfolioForm advisors={advisors} />

        <section className="grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Hazır Danışman Listesi</h2>
            <p className="mt-2 text-sm text-slate-600">Portföy yüklerken bu listeden manuel seçim yapılır.</p>

            <ul className="mt-4 space-y-3">
              {advisors.map((advisor) => (
                <li key={advisor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{advisor.name}</p>
                  <p className="text-sm text-slate-600">{advisor.title}</p>
                  <p className="text-sm text-slate-500">{advisor.focusArea}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Kullanıcı Rolleri</h2>
            <p className="mt-2 text-sm text-slate-600">Admin, danışman ve içerik yükleyici demo hesapları aktiftir.</p>

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
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Son Portföyler</h2>
            <Link href="/" className="text-sm font-semibold text-slate-700 underline">
              Tüm ilanları gör
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
        </section>

        {currentUser.role === "admin" ? (
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">Lead Gözlemi (Demo)</h2>
            <p className="mt-2 text-sm text-slate-600">Formdan gelen kayıtlar bellekte tutulur.</p>
            <ul className="mt-4 space-y-3">
              {leads.length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
                  Henüz lead yok.
                </li>
              ) : (
                leads.slice(0, 6).map((lead) => (
                  <li key={lead.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
                    <p className="font-semibold text-slate-900">{lead.name}</p>
                    <p className="text-slate-600">{lead.phone} • {lead.email}</p>
                    <p className="mt-1 text-slate-500">{lead.message}</p>
                  </li>
                ))
              )}
            </ul>
          </section>
        ) : null}
      </main>
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
