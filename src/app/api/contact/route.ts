import { NextResponse } from "next/server";

import { createLead, getAdvisorById, getPropertyBySlug } from "@/lib/data-store";
import { sendLeadNotification } from "@/lib/email";

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function sanitizeMessage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const propertySlug = requireString(payload.propertySlug, "İlan bilgisi");
    const property = getPropertyBySlug(propertySlug);

    if (!property) {
      return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    }

    const lead = createLead({
      propertySlug,
      name: requireString(payload.name, "Ad Soyad"),
      email: requireString(payload.email, "E-posta"),
      phone: requireString(payload.phone, "Telefon"),
      message: sanitizeMessage(requireString(payload.message, "Mesaj")),
    });

    const advisor = getAdvisorById(property.advisorId);
    const emailResult = await sendLeadNotification({ lead, property, advisor });

    if (!emailResult.delivered) {
      return NextResponse.json({
        message:
          "Talebiniz alındı. Demo modunda mail ayarı olmadığı için kayıt panelde tutuldu.",
        mode: "demo",
      });
    }

    return NextResponse.json({ message: "Talebiniz başarıyla iletildi. Ekibimiz sizi arayacak." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Talep gönderilemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
