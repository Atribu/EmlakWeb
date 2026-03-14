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
  if (role === "admin") return "Admin";
  if (role === "advisor") return "Danışman";
  if (role === "editor") return "İçerik Yükleyici";
  return role;
}
