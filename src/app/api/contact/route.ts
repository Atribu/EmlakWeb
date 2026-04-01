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

function sanitizeMessage(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export async function POST(request: Request) {
  try {
    const language = readSitePreferencesFromCookieHeader(request.headers.get("cookie")).language;
    const copy =
      language === "EN"
        ? {
            labels: { property: "Listing information", name: "Full name", email: "Email", phone: "Phone", message: "Message" },
            required: "is required.",
            notFound: "Listing not found.",
            demo: "Your inquiry was received. Mail delivery is disabled in demo mode, so the record was saved in the panel.",
            success: "Your inquiry was sent successfully. Our team will contact you shortly.",
            fallback: "The inquiry could not be sent.",
          }
        : language === "RU"
          ? {
              labels: { property: "Информация об объекте", name: "Имя и фамилия", email: "Эл. почта", phone: "Телефон", message: "Сообщение" },
              required: "обязательно.",
              notFound: "Объект не найден.",
              demo: "Ваш запрос получен. В демо-режиме отправка почты отключена, поэтому запись сохранена в панели.",
              success: "Ваш запрос успешно отправлен. Наша команда скоро свяжется с вами.",
              fallback: "Не удалось отправить запрос.",
            }
          : language === "AR"
            ? {
                labels: { property: "معلومات العقار", name: "الاسم الكامل", email: "البريد الإلكتروني", phone: "الهاتف", message: "الرسالة" },
                required: "مطلوب.",
                notFound: "لم يتم العثور على العقار.",
                demo: "تم استلام طلبك. في وضع العرض التجريبي تم حفظه في اللوحة لأن إعداد البريد غير متوفر.",
                success: "تم إرسال طلبك بنجاح. سيتواصل معك فريقنا قريبًا.",
                fallback: "تعذر إرسال الطلب.",
              }
            : {
                labels: { property: "İlan bilgisi", name: "Ad Soyad", email: "E-posta", phone: "Telefon", message: "Mesaj" },
                required: "zorunludur.",
                notFound: "İlan bulunamadı.",
                demo: "Talebiniz alındı. Demo modunda mail ayarı olmadığı için kayıt panelde tutuldu.",
                success: "Talebiniz başarıyla iletildi. Ekibimiz sizi arayacak.",
                fallback: "Talep gönderilemedi.",
              };

    const payload = (await request.json()) as Record<string, unknown>;

    const propertySlug = requireString(payload.propertySlug, copy.labels.property, copy.required);
    const property = getPropertyBySlug(propertySlug);

    if (!property) {
      return NextResponse.json({ message: copy.notFound }, { status: 404 });
    }

    const lead = createLead({
      propertySlug,
      name: requireString(payload.name, copy.labels.name, copy.required),
      email: requireString(payload.email, copy.labels.email, copy.required),
      phone: requireString(payload.phone, copy.labels.phone, copy.required),
      message: sanitizeMessage(requireString(payload.message, copy.labels.message, copy.required)),
      source: "contact_form",
      assignedAdvisorId: property.advisorId,
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
        ? "The inquiry could not be sent."
        : language === "RU"
          ? "Не удалось отправить запрос."
          : language === "AR"
            ? "تعذر إرسال الطلب."
            : "Talep gönderilemedi.";
    const message = error instanceof Error ? error.message : fallback;
    return NextResponse.json({ message }, { status: 400 });
  }
}
