import {
  canAccessOverview,
  canCreateOrEditPortfolios,
  canDeletePortfolios,
  canManageAdvisors,
  canManageBlogs,
  canManageLeads,
  canManageUsers,
} from "@/lib/access-control";

export type PanelTab =
  | "overview"
  | "portfolio-create"
  | "portfolio-locations"
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

export type PanelTabMeta = {
  id: PanelTab;
  label: string;
  hint: string;
};

export const portfolioGroupTabs: PanelTab[] = [
  "portfolio-create",
  "portfolio-locations",
  "portfolio-approval",
  "portfolio-projects",
  "portfolio-edit",
  "portfolio-delete",
];

export const blogGroupTabs: PanelTab[] = ["blog-create", "blog-edit", "blog-delete"];

export const panelTabs: PanelTabMeta[] = [
  { id: "overview", label: "Genel Bakış", hint: "Metrikler ve genel görünüm" },
  { id: "portfolio-create", label: "Portföy Ekle", hint: "Yeni ilan oluştur" },
  { id: "portfolio-locations", label: "Popüler Lokasyonlar", hint: "Ana sayfa lokasyon kartlarını yönet" },
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

export function visibleTabsForRole(role: string): PanelTab[] {
  const output: PanelTab[] = [];

  if (canAccessOverview(role)) {
    output.push("overview");
  }

  if (canCreateOrEditPortfolios(role)) {
    output.push("portfolio-create", "portfolio-locations", "portfolio-projects", "portfolio-edit");
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

export function resolvePanelTab(value: string | undefined, allowedTabs: PanelTab[]): PanelTab {
  if (!value) {
    return allowedTabs[0] ?? defaultTab;
  }

  const matched = allowedTabs.find((item) => item === value);
  return matched ?? allowedTabs[0] ?? defaultTab;
}

export function primaryActionForTabs(allowedTabs: PanelTab[]) {
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
