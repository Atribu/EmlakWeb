import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { deleteAdvisor, getAdvisorById, updateAdvisorById } from "@/lib/data-store";
import type { CreateAdvisorInput } from "@/lib/types";

function parseString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseInput(payload: unknown): CreateAdvisorInput {
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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ advisorId: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ message: "Danışman düzenleme işlemi sadece admin yetkisindedir." }, { status: 403 });
  }

  const { advisorId } = await params;
  const existing = getAdvisorById(advisorId);

  if (!existing) {
    return NextResponse.json({ message: "Danışman bulunamadı." }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const input = parseInput(payload);
    const advisor = updateAdvisorById(advisorId, input);
    return NextResponse.json({ advisor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Danışman güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ advisorId: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (user.role !== "admin") {
    return NextResponse.json({ message: "Danışman silme işlemi sadece admin yetkisindedir." }, { status: 403 });
  }

  const { advisorId } = await params;
  const existing = getAdvisorById(advisorId);

  if (!existing) {
    return NextResponse.json({ message: "Danışman bulunamadı." }, { status: 404 });
  }

  try {
    const advisor = deleteAdvisor(advisorId);
    return NextResponse.json({ advisor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Danışman silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
