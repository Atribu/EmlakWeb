import type { ReactNode } from "react";
import Link from "next/link";

import { listBlogPosts, listProperties, listPropertyActivityLogs } from "@/lib/data-store";
import { formatDateTimeTR, roleLabel } from "@/lib/format";
import {
  propertyActivityActionBadgeClass,
  propertyActivityActionLabel,
} from "@/lib/property-activity";
import { normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { summarizePropertyQuality } from "@/lib/property-quality";
import type { LeadStage } from "@/lib/types";

type AdminOverviewSectionProps = {
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

export function AdminOverviewSection({
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
}: AdminOverviewSectionProps) {
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
        </div>
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
