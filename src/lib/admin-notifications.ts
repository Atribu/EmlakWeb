import { normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import { summarizePropertyQuality } from "@/lib/property-quality";
import type { ContactLead, Property, PropertyActivityLog } from "@/lib/types";

export type AdminNotificationTone = "urgent" | "warning" | "info" | "success";

export type AdminNotification = {
  id: string;
  title: string;
  description: string;
  href: string;
  count: number;
  tone: AdminNotificationTone;
  meta?: string;
};

type BuildAdminNotificationsInput = {
  properties: Property[];
  leads: ContactLead[];
  propertyActivityLogs: PropertyActivityLog[];
  canViewApprovals: boolean;
  canViewPortfolioQuality: boolean;
  canViewLeads: boolean;
};

const closedLeadStages = new Set(["won", "lost"]);

function todayInIstanbul() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "Europe/Istanbul",
    year: "numeric",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function isOpenLead(lead: ContactLead) {
  return !closedLeadStages.has(lead.stage);
}

export function buildAdminNotifications({
  properties,
  leads,
  propertyActivityLogs,
  canViewApprovals,
  canViewPortfolioQuality,
  canViewLeads,
}: BuildAdminNotificationsInput): AdminNotification[] {
  const notifications: AdminNotification[] = [];
  const pendingApprovalProperties = properties.filter(
    (property) => normalizePropertyPublicationStatus(property.publicationStatus) === "Onay Bekliyor",
  );

  if (canViewApprovals && pendingApprovalProperties.length > 0) {
    const pendingSlugs = new Set(pendingApprovalProperties.map((property) => property.slug));
    const latestPendingActivity = propertyActivityLogs.find((activity) => pendingSlugs.has(activity.propertySlug));
    const readyCount = pendingApprovalProperties.filter(
      (property) => summarizePropertyQuality(property).isReadyForApproval,
    ).length;

    notifications.push({
      id: "pending-approvals",
      title: "Onay bekleyen portföyler",
      description: `${pendingApprovalProperties.length} portföy yayın onayı bekliyor.`,
      href: "/yonetim-ofisi?tab=portfolio-approval",
      count: pendingApprovalProperties.length,
      tone: "urgent",
      meta:
        readyCount > 0
          ? `${readyCount} kayıt kritik eksiksiz görünüyor.`
          : latestPendingActivity
            ? `Son kayıt: ${latestPendingActivity.propertyTitle}`
            : undefined,
    });
  }

  if (canViewPortfolioQuality) {
    const qualitySummaries = properties.map((property) => ({
      property,
      quality: summarizePropertyQuality(property),
    }));
    const criticalCount = qualitySummaries.filter(({ quality }) => quality.criticalIssues.length > 0).length;
    const advisoryCount = qualitySummaries.filter(
      ({ quality }) => quality.criticalIssues.length === 0 && quality.advisoryIssues.length > 0,
    ).length;

    if (criticalCount > 0) {
      notifications.push({
        id: "critical-quality",
        title: "Yayına engel eksikler",
        description: `${criticalCount} portföy kritik bilgi veya görsel eksikliği taşıyor.`,
        href: "/yonetim-ofisi?tab=portfolio-projects",
        count: criticalCount,
        tone: "warning",
        meta: "Portföy kalite kontrolünü gözden geçirin.",
      });
    } else if (advisoryCount > 0) {
      notifications.push({
        id: "advisory-quality",
        title: "İçerik iyileştirmeleri",
        description: `${advisoryCount} portföyde çeviri veya içerik geliştirmesi öneriliyor.`,
        href: "/yonetim-ofisi?tab=portfolio-projects",
        count: advisoryCount,
        tone: "info",
        meta: "Yayına engel değil, kaliteyi artırır.",
      });
    }
  }

  if (canViewLeads) {
    const today = todayInIstanbul();
    const dueFollowUps = leads.filter((lead) => isOpenLead(lead) && lead.followUpDate && lead.followUpDate <= today);
    const newLeads = leads.filter((lead) => lead.stage === "new");
    const highPriorityLeads = leads.filter((lead) => isOpenLead(lead) && lead.priority === "high");

    if (dueFollowUps.length > 0) {
      notifications.push({
        id: "due-follow-ups",
        title: "Takip tarihi gelen leadler",
        description: `${dueFollowUps.length} lead için bugün veya geçmiş tarihli takip var.`,
        href: "/yonetim-ofisi?tab=leads",
        count: dueFollowUps.length,
        tone: "urgent",
        meta: highPriorityLeads.length > 0 ? `${highPriorityLeads.length} yüksek öncelikli lead açık.` : undefined,
      });
    } else if (newLeads.length > 0) {
      notifications.push({
        id: "new-leads",
        title: "Yeni leadler",
        description: `${newLeads.length} lead ilk temas bekliyor.`,
        href: "/yonetim-ofisi?tab=leads",
        count: newLeads.length,
        tone: "info",
        meta: "CRM pipeline üzerinden atama ve takip yapabilirsiniz.",
      });
    }
  }

  if (notifications.length === 0 && canViewPortfolioQuality) {
    notifications.push({
      id: "all-clear",
      title: "Bekleyen kritik iş yok",
      description: "Onay, kalite ve CRM tarafında acil aksiyon görünmüyor.",
      href: "/yonetim-ofisi?tab=overview",
      count: 0,
      tone: "success",
      meta: "Panel düzenli görünüyor.",
    });
  }

  return notifications;
}

export function adminNotificationTotal(notifications: AdminNotification[]) {
  return notifications.reduce((total, notification) => total + notification.count, 0);
}
