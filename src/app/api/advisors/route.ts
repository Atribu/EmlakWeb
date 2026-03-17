import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { createAdvisor, listAdvisors } from "@/lib/data-store";
import type { CreateAdvisorInput } from "@/lib/types";

function parseString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseCreateInput(payload: unknown): CreateAdvisorInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const body = payload as Record<string, unknown>;

  return {
    name: parseString(body.name, "Ad Soyad"),
    title: parseString(body.title, "Unvan"),
    phone: parseString(body.phone, "Telefon"),
    whatsapp: parseString(body.whatsapp, "WhatsApp"),
    email: parseString(body.email, "E-posta"),
    focusArea: parseString(body.focusArea, "Uzmanlık alanı"),
  };
}

export async function GET() {
  return NextResponse.json({ advisors: listAdvisors() });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ message: "Danışman yönetimi sadece admin yetkisindedir." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const input = parseCreateInput(payload);
    const advisor = createAdvisor(input);

    return NextResponse.json({ advisor }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Danışman oluşturulamadı.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
