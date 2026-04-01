import { NextResponse } from "next/server";

import { createLead, getAdvisorById, getPropertyBySlug } from "@/lib/data-store";
import { sendLeadNotification } from "@/lib/email";
import { readSitePreferencesFromCookieHeader } from "@/lib/site-preferences";

function requireString(value: unknown, label: string, requiredSuffix: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} ${requiredSuffix}`);
  }

  return value.trim();
}

function validateDate(value: string, message: string): string {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) {
    throw new Error(message);
  }

  return value;
}

function validateTime(value: string, message: string): string {
  if (!/^\d{2}:\d{2}$/.test(value)) {
    throw new Error(message);
  }

  return value;
}

export async function POST(request: Request) {
  try {
    const language = readSitePreferencesFromCookieHeader(request.headers.get("cookie")).language;
    const copy =
      language === "EN"
        ? {
            labels: { property: "Listing information", date: "Appointment date", time: "Appointment time", name: "Full name", email: "Email", phone: "Phone", message: "Message", visitType: "Visit type" },
            required: "is required.",
            invalidDate: "The appointment date is invalid.",
            invalidTime: "The appointment time is invalid.",
            notFound: "Listing not found.",
            demo: "Your appointment request was received. Mail delivery is disabled in demo mode, so the record was saved in the panel.",
            success: "Your appointment request was received. Our team will contact you to confirm availability.",
            fallback: "The appointment request could not be sent.",
          }
        : language === "RU"
          ? {
              labels: { property: "Информация об объекте", date: "Дата визита", time: "Время визита", name: "Имя и фамилия", email: "Эл. почта", phone: "Телефон", message: "Сообщение", visitType: "Тип визита" },
              required: "обязательно.",
              invalidDate: "Некорректная дата встречи.",
              invalidTime: "Некорректное время встречи.",
              notFound: "Объект не найден.",
              demo: "Ваша заявка на встречу получена. В демо-режиме запись сохранена в панели, так как почта отключена.",
              success: "Ваша заявка на встречу получена. Наша команда свяжется с вами для подтверждения.",
              fallback: "Не удалось отправить заявку на встречу.",
            }
          : language === "AR"
            ? {
                labels: { property: "معلومات العقار", date: "تاريخ الموعد", time: "وقت الموعد", name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف", message: "الرسالة", visitType: "نوع الزيارة" },
                required: "مطلوب.",
                invalidDate: "تاريخ الموعد غير صالح.",
                invalidTime: "وقت الموعد غير صالح.",
                notFound: "لم يتم العثور على العقار.",
                demo: "تم استلام طلب الموعد. في وضع العرض التجريبي تم حفظه في اللوحة لأن البريد غير مفعّل.",
                success: "تم استلام طلب الموعد. سيتواصل معك فريقنا لتأكيد التوفر.",
                fallback: "تعذر إرسال طلب الموعد.",
              }
            : {
                labels: { property: "İlan bilgisi", date: "Randevu tarihi", time: "Randevu saati", name: "Ad Soyad", email: "E-posta", phone: "Telefon", message: "Mesaj", visitType: "Ziyaret tipi" },
                required: "zorunludur.",
                invalidDate: "Randevu tarihi geçersiz.",
                invalidTime: "Randevu saati geçersiz.",
                notFound: "İlan bulunamadı.",
                demo: "Randevu talebiniz alındı. Demo modunda mail ayarı olmadığı için kayıt panelde tutuldu.",
                success: "Randevu talebiniz alındı. Ekibimiz uygunluk için size dönüş yapacak.",
                fallback: "Randevu gönderilemedi.",
              };

    const payload = (await request.json()) as Record<string, unknown>;

    const propertySlug = requireString(payload.propertySlug, copy.labels.property, copy.required);
    const property = getPropertyBySlug(propertySlug);

    if (!property) {
      return NextResponse.json({ message: copy.notFound }, { status: 404 });
    }

    const preferredDate = validateDate(
      requireString(payload.preferredDate, copy.labels.date, copy.required),
      copy.invalidDate,
    );
    const preferredTime = validateTime(
      requireString(payload.preferredTime, copy.labels.time, copy.required),
      copy.invalidTime,
    );

    const lead = createLead({
      propertySlug,
      name: requireString(payload.name, copy.labels.name, copy.required),
      email: requireString(payload.email, copy.labels.email, copy.required),
      phone: requireString(payload.phone, copy.labels.phone, copy.required),
      message: requireString(payload.message, copy.labels.message, copy.required),
      source: "appointment_form",
      assignedAdvisorId: property.advisorId,
      preferredDate,
      preferredTime,
      appointmentNote: requireString(payload.visitType, copy.labels.visitType, copy.required),
    });

    const advisor = getAdvisorById(property.advisorId);
    const emailResult = await sendLeadNotification({ lead, property, advisor });

    if (!emailResult.delivered) {
      return NextResponse.json({
        message: copy.demo,
        mode: "demo",
      });
    }

    return NextResponse.json({ message: copy.success });
  } catch (error) {
    const language = readSitePreferencesFromCookieHeader(request.headers.get("cookie")).language;
    const fallback =
      language === "EN"
        ? "The appointment request could not be sent."
        : language === "RU"
          ? "Не удалось отправить заявку на встречу."
          : language === "AR"
            ? "تعذر إرسال طلب الموعد."
            : "Randevu gönderilemedi.";
    const message = error instanceof Error ? error.message : fallback;
    return NextResponse.json({ message }, { status: 400 });
  }
}
