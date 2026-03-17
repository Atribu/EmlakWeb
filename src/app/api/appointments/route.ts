import { NextResponse } from "next/server";

import { createLead, getAdvisorById, getPropertyBySlug } from "@/lib/data-store";
import { sendLeadNotification } from "@/lib/email";

function requireString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function validateDate(value: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error("Randevu tarihi geçersiz.");
  }

  return value;
}

function validateTime(value: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error("Randevu saati geçersiz.");
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;

    const propertySlug = requireString(payload.propertySlug, "İlan bilgisi");
    const property = getPropertyBySlug(propertySlug);

    if (!property) {
      return NextResponse.json({ message: "İlan bulunamadı." }, { status: 404 });
    }

    const preferredDate = validateDate(requireString(payload.preferredDate, "Randevu tarihi"));
    const preferredTime = validateTime(requireString(payload.preferredTime, "Randevu saati"));

    const lead = createLead({
      propertySlug,
      name: requireString(payload.name, "Ad Soyad"),
      email: requireString(payload.email, "E-posta"),
      phone: requireString(payload.phone, "Telefon"),
      message: requireString(payload.message, "Mesaj"),
      source: "appointment_form",
      assignedAdvisorId: property.advisorId,
      preferredDate,
      preferredTime,
      appointmentNote: requireString(payload.visitType, "Ziyaret tipi"),
    });

    const advisor = getAdvisorById(property.advisorId);
    const emailResult = await sendLeadNotification({ lead, property, advisor });

    if (!emailResult.delivered) {
      return NextResponse.json({
        message:
          "Randevu talebiniz alındı. Demo modunda mail ayarı olmadığı için kayıt panelde tutuldu.",
        mode: "demo",
      });
    }

    return NextResponse.json({
      message: "Randevu talebiniz alındı. Ekibimiz uygunluk için size dönüş yapacak.",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Randevu gönderilemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
