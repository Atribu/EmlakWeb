import type { Advisor, ContactLead, Property, SellerLead } from "@/lib/types";

type SendLeadParams = {
  lead: ContactLead;
  property: Property;
  advisor?: Advisor;
};

export type EmailDispatchResult = {
  delivered: boolean;
  reason?: string;
};

export async function sendLeadNotification({
  lead,
  property,
  advisor,
}: SendLeadParams): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Emlak Demo <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.info("[lead-demo] Mail env yok, lead bellekte tutuldu.", {
      lead,
      property: property.listingRef,
    });
    return { delivered: false, reason: "missing-env" };
  }

  const text = [
    `Yeni ilan talebi geldi: ${property.title} (${property.listingRef})`,
    `Kaynak: ${lead.source === "appointment_form" ? "Randevu Formu" : "İletişim Formu"}`,
    `Aşama: ${lead.stage}`,
    `Ad Soyad: ${lead.name}`,
    `E-posta: ${lead.email}`,
    `Telefon: ${lead.phone}`,
    `Mesaj: ${lead.message}`,
    `Randevu: ${
      lead.preferredDate && lead.preferredTime
        ? `${lead.preferredDate} ${lead.preferredTime}`
        : "Belirtilmedi"
    }`,
    `Ziyaret Tipi: ${lead.appointmentNote ?? "Belirtilmedi"}`,
    `Danışman: ${advisor ? `${advisor.name} (${advisor.phone})` : "Atanmadı"}`,
    `Tarih: ${new Date(lead.createdAt).toLocaleString("tr-TR")}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Yeni Lead • ${property.listingRef}`,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[lead-email-error]", body);
    return { delivered: false, reason: "provider-error" };
  }

  return { delivered: true };
}

export async function sendSellerLeadNotification(lead: SellerLead): Promise<EmailDispatchResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL ?? "Emlak Demo <onboarding@resend.dev>";

  if (!apiKey || !to) {
    console.info("[seller-lead-demo] Mail env yok, satıcı talebi bellekte tutuldu.", { lead });
    return { delivered: false, reason: "missing-env" };
  }

  const text = [
    "Yeni emlak sat talebi geldi",
    `Ad Soyad: ${lead.name}`,
    `E-posta: ${lead.email}`,
    `Telefon: ${lead.phone}`,
    `Şehir / İlçe: ${lead.city} / ${lead.district}`,
    `Mahalle: ${lead.neighborhood ?? "Belirtilmedi"}`,
    `Mülk Tipi: ${lead.propertyType}`,
    `Alt Tip: ${lead.subType ?? "Belirtilmedi"}`,
    `Brüt m²: ${lead.areaM2 ? `${lead.areaM2} m²` : "Belirtilmedi"}`,
    `Oda Sayısı: ${lead.rooms ?? "Belirtilmedi"}`,
    `Bina Yaşı: ${lead.buildingAge ?? "Belirtilmedi"}`,
    `Kat: ${lead.floor ?? "Belirtilmedi"}`,
    `Site İçinde: ${lead.inCompound ?? "Belirtilmedi"}`,
    `Uygun Görüşme Saati: ${lead.preferredDateTime ?? "Belirtilmedi"}`,
    `Mesaj: ${lead.message}`,
    `Tarih: ${new Date(lead.createdAt).toLocaleString("tr-TR")}`,
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Yeni Satıcı Talebi • ${lead.city}/${lead.district}`,
      text,
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error("[seller-lead-email-error]", body);
    return { delivered: false, reason: "provider-error" };
  }

  return { delivered: true };
}
