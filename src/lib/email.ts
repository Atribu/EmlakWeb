import type { Advisor, ContactLead, Property } from "@/lib/types";

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
    `Ad Soyad: ${lead.name}`,
    `E-posta: ${lead.email}`,
    `Telefon: ${lead.phone}`,
    `Mesaj: ${lead.message}`,
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
