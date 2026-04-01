import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canManageAdvisors } from "@/lib/access-control";
import {
  deleteManagedAdvisorImage,
  resolveAdvisorStorageKey,
  saveAdvisorImageFile,
} from "@/lib/advisor-image-storage";
import { getUserFromRequest } from "@/lib/auth";
import { deleteAdvisor, getAdvisorById, updateAdvisorById } from "@/lib/data-store";
import type { Advisor, CreateAdvisorInput } from "@/lib/types";

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
    image: typeof body.image === "string" ? body.image.trim() : "",
  };
}

async function parseFormDataInput(formData: FormData, existing: Advisor): Promise<CreateAdvisorInput> {
  const name = parseString(formData.get("name"), "Ad Soyad");
  const imageFile = formData.get("imageFile");
  let image = existing.image;

  if (imageFile instanceof File && imageFile.size > 0) {
    const nextImage = await saveAdvisorImageFile(imageFile, {
      storageKey: resolveAdvisorStorageKey(existing.image, name),
      fieldLabel: "Danışman görseli",
    });

    if (nextImage !== existing.image) {
      await deleteManagedAdvisorImage(existing.image);
    }

    image = nextImage;
  }

  return {
    name,
    title: parseString(formData.get("title"), "Unvan"),
    phone: parseString(formData.get("phone"), "Telefon"),
    whatsapp: parseString(formData.get("whatsapp"), "WhatsApp"),
    email: parseString(formData.get("email"), "E-posta"),
    focusArea: parseString(formData.get("focusArea"), "Uzmanlık alanı"),
    image,
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

  if (!canManageAdvisors(user.role)) {
    return NextResponse.json(
      { message: "Danışman düzenleme işlemi sadece portal admin ve admin yetkisindedir." },
      { status: 403 },
    );
  }

  const { advisorId } = await params;
  const existing = getAdvisorById(advisorId);

  if (!existing) {
    return NextResponse.json({ message: "Danışman bulunamadı." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const input = contentType.includes("multipart/form-data")
      ? await parseFormDataInput(await request.formData(), existing)
      : parseInput(await request.json());
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

  if (!canManageAdvisors(user.role)) {
    return NextResponse.json(
      { message: "Danışman silme işlemi sadece portal admin ve admin yetkisindedir." },
      { status: 403 },
    );
  }

  const { advisorId } = await params;
  const existing = getAdvisorById(advisorId);

  if (!existing) {
    return NextResponse.json({ message: "Danışman bulunamadı." }, { status: 404 });
  }

  try {
    const advisor = deleteAdvisor(advisorId);
    await deleteManagedAdvisorImage(advisor.image);
    return NextResponse.json({ advisor });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Danışman silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
