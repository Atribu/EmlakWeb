const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export function formatPrice(value: number): string {
  return currencyFormatter.format(value);
}

export function formatPhoneForHref(value: string): string {
  return value.replace(/\s+/g, "").replace(/[()]/g, "");
}

export function roleLabel(role: string): string {
  if (role === "portal_admin") return "Portal Admin";
  if (role === "admin") return "Admin";
  if (role === "portfolio_manager") return "Portföy Yetkilisi";
  if (role === "advisor") return "Danışman";
  if (role === "editor") return "İçerik Yükleyici";
  return role;
}

export function formatDateTR(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();

  return `${day}.${month}.${year}`;
}

export function leadStageLabel(stage: string): string {
  if (stage === "new") return "Yeni";
  if (stage === "called") return "Arandı";
  if (stage === "appointment_scheduled") return "Randevu";
  if (stage === "offer_submitted") return "Teklif";
  if (stage === "won") return "Kazanıldı";
  if (stage === "lost") return "Kaybedildi";
  return stage;
}

export function leadSourceLabel(source: string): string {
  if (source === "contact_form") return "İletişim Formu";
  if (source === "appointment_form") return "Randevu Formu";
  return source;
}
