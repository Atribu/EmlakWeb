import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getUserFromRequest } from "@/lib/auth";
import { getPropertyBySlug, updatePropertyBySlug } from "@/lib/data-store";
import {
  getFilesFromFormData,
  isLabelForRoom,
  MAX_IMAGES_PER_ROOM,
  PORTFOLIO_ROOM_FIELDS,
  makeRoomImageLabel,
  readWebpAsDataUrl,
} from "@/lib/portfolio-images";
import type { CreatePropertyInput, Property, PropertyType } from "@/lib/types";

const validTypes: PropertyType[] = ["Daire", "Villa", "Rezidans", "Arsa", "Ofis"];

function parseNumber(value: unknown, fieldLabel: string): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${fieldLabel} geçerli bir sayı olmalıdır.`);
  }

  return numeric;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseString(value: unknown, fieldLabel: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldLabel} zorunludur.`);
  }

  return value.trim();
}

function parseList(value: unknown, fieldLabel: string): string[] {
  if (!Array.isArray(value) || value.length === 0) {
    throw new Error(`${fieldLabel} en az bir değer içermelidir.`);
  }

  const output = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (output.length === 0) {
    throw new Error(`${fieldLabel} en az bir değer içermelidir.`);
  }

  return output;
}

function parseCommaSeparatedList(value: unknown, fieldLabel: string): string[] {
  if (typeof value !== "string") {
    throw new Error(`${fieldLabel} en az bir değer içermelidir.`);
  }

  const output = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (output.length === 0) {
    throw new Error(`${fieldLabel} en az bir değer içermelidir.`);
  }

  return output;
}

function parseInput(value: unknown): CreatePropertyInput {
  if (!value || typeof value !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const payload = value as Record<string, unknown>;
  const type = parseString(payload.type, "Portföy tipi") as PropertyType;

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  return {
    title: parseString(payload.title, "Başlık"),
    city: parseString(payload.city, "Şehir"),
    district: parseString(payload.district, "İlçe"),
    neighborhood: parseString(payload.neighborhood, "Mahalle"),
    type,
    price: parseNumber(payload.price, "Fiyat"),
    rooms: parseString(payload.rooms, "Oda bilgisi"),
    areaM2: parseNumber(payload.areaM2, "Metrekare"),
    floor: parseString(payload.floor, "Kat bilgisi"),
    heating: parseString(payload.heating, "Isıtma"),
    description: parseString(payload.description, "Açıklama"),
    advisorId: parseString(payload.advisorId, "Danışman"),
    latitude: parseOptionalNumber(payload.latitude),
    longitude: parseOptionalNumber(payload.longitude),
    coverColor: parseString(payload.coverColor, "Kapak rengi"),
    coverImage: parseString(payload.coverImage, "Kapak görseli"),
    galleryImages: parseList(payload.galleryImages, "Galeri görselleri"),
    highlights: parseList(payload.highlights, "Öne çıkanlar"),
    features: parseList(payload.features, "Özellikler"),
    imageLabels: parseList(payload.imageLabels, "Görsel etiketleri"),
  };
}

type GalleryEntry = {
  label: string;
  image: string;
};

function galleryEntriesFromProperty(property: Property): GalleryEntry[] {
  return property.galleryImages.map((image, index) => ({
    label: property.imageLabels[index] ?? `Görsel ${index + 1}`,
    image,
  }));
}

async function parseFormDataInput(formData: FormData, existing: Property): Promise<CreatePropertyInput> {
  const type = parseString(formData.get("type"), "Portföy tipi") as PropertyType;

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  const coverFile = formData.get("coverImageFile");
  const coverImage =
    coverFile instanceof File && coverFile.size > 0
      ? await readWebpAsDataUrl(coverFile, "Kapak görseli")
      : existing.coverImage;

  let galleryEntries = galleryEntriesFromProperty(existing);

  for (const field of PORTFOLIO_ROOM_FIELDS) {
    const files = getFilesFromFormData(formData, field.name);

    if (files.length === 0) {
      continue;
    }

    if (files.length > MAX_IMAGES_PER_ROOM) {
      throw new Error(`${field.label} için en fazla ${MAX_IMAGES_PER_ROOM} görsel yükleyebilirsiniz.`);
    }

    const nextEntries = galleryEntries.filter((entry) => !isLabelForRoom(entry.label, field.label));

    for (const [index, file] of files.entries()) {
      const label = makeRoomImageLabel(field, index, files.length);
      nextEntries.push({
        label,
        image: await readWebpAsDataUrl(file, `${label} görseli`),
      });
    }

    galleryEntries = nextEntries;
  }

  const galleryImages = galleryEntries.map((entry) => entry.image);
  const imageLabels = galleryEntries.map((entry) => entry.label);

  if (galleryImages.length === 0) {
    throw new Error("En az bir oda görseli bulunmalıdır.");
  }

  return {
    title: parseString(formData.get("title"), "Başlık"),
    city: parseString(formData.get("city"), "Şehir"),
    district: parseString(formData.get("district"), "İlçe"),
    neighborhood: parseString(formData.get("neighborhood"), "Mahalle"),
    type,
    price: parseNumber(formData.get("price"), "Fiyat"),
    rooms: parseString(formData.get("rooms"), "Oda bilgisi"),
    areaM2: parseNumber(formData.get("areaM2"), "Metrekare"),
    floor: parseString(formData.get("floor"), "Kat bilgisi"),
    heating: parseString(formData.get("heating"), "Isıtma"),
    description: parseString(formData.get("description"), "Açıklama"),
    advisorId: parseString(formData.get("advisorId"), "Danışman"),
    latitude: parseOptionalNumber(formData.get("latitude")),
    longitude: parseOptionalNumber(formData.get("longitude")),
    coverColor: parseString(formData.get("coverColor"), "Kapak rengi"),
    coverImage,
    galleryImages,
    highlights: parseCommaSeparatedList(formData.get("highlights"), "Öne çıkanlar"),
    features: parseCommaSeparatedList(formData.get("features"), "Özellikler"),
    imageLabels,
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!user.role || !["admin", "advisor", "editor"].includes(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { slug } = await params;
  const existing = getPropertyBySlug(slug);

  if (!existing) {
    return NextResponse.json({ message: "Portföy bulunamadı." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const input = contentType.includes("multipart/form-data")
      ? await parseFormDataInput(await request.formData(), existing)
      : parseInput(await request.json());
    const property = updatePropertyBySlug(slug, input);

    return NextResponse.json({ property });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portföy güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
