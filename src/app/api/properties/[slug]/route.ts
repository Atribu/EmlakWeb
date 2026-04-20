import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios, canDeletePortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { deletePropertyBySlug, getPropertyBySlug, updatePropertyBySlug } from "@/lib/data-store";
import {
  buildGalleryImageFileName,
  deleteManagedPropertyImages,
  resolvePropertyStorageKey,
  savePropertyImageFile,
} from "@/lib/property-image-storage";
import {
  createGalleryImageLabel,
  getFilesFromFormData,
  MAX_GALLERY_IMAGE_COUNT,
} from "@/lib/portfolio-images";
import {
  readPropertyInfoItemsFromFormData,
  readPropertyInfoItemsFromPayload,
} from "@/lib/property-info-items";
import {
  readPropertyTranslationsFromFormData,
  readPropertyTranslationsFromPayload,
} from "@/lib/property-content";
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

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
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

function parseOptionalList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function parseOptionalCommaSeparatedList(value: unknown): string[] {
  if (typeof value !== "string" || !value.trim()) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
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
    advisorId: parseOptionalString(payload.advisorId),
    latitude: parseOptionalNumber(payload.latitude),
    longitude: parseOptionalNumber(payload.longitude),
    coverColor: parseString(payload.coverColor, "Kapak rengi"),
    coverImage: parseString(payload.coverImage, "Kapak görseli"),
    galleryImages: parseList(payload.galleryImages, "Galeri görselleri"),
    highlights: parseOptionalList(payload.highlights),
    features: parseOptionalList(payload.features),
    infoItems: readPropertyInfoItemsFromPayload(payload.infoItems),
    imageLabels:
      parseOptionalList(payload.imageLabels).length > 0
        ? parseOptionalList(payload.imageLabels)
        : parseList(payload.galleryImages, "Galeri görselleri").map((_, index) => createGalleryImageLabel(index)),
    translations: readPropertyTranslationsFromPayload(payload.translations),
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
  const title = parseString(formData.get("title"), "Başlık");

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  let storageKey: string | null = null;
  const getStorageKey = () => {
    storageKey ??= resolvePropertyStorageKey([existing.coverImage, ...existing.galleryImages], title);
    return storageKey;
  };

  const coverFile = formData.get("coverImageFile");
  const coverImage =
    coverFile instanceof File && coverFile.size > 0
      ? await savePropertyImageFile(coverFile, {
          storageKey: getStorageKey(),
          fileName: "cover",
          fieldLabel: "Kapak görseli",
        })
      : existing.coverImage;

  const removedGalleryImages = new Set(
    formData
      .getAll("removeGalleryImages")
      .map((value) => (typeof value === "string" ? value.trim() : ""))
      .filter(Boolean),
  );

  const galleryEntries = galleryEntriesFromProperty(existing).filter((entry) => !removedGalleryImages.has(entry.image));

  if (removedGalleryImages.size > 0) {
    await deleteManagedPropertyImages(Array.from(removedGalleryImages));
  }

  const galleryFiles = getFilesFromFormData(formData, "galleryImageFiles");

  if (galleryEntries.length + galleryFiles.length > MAX_GALLERY_IMAGE_COUNT) {
    throw new Error(`Galeri için en fazla ${MAX_GALLERY_IMAGE_COUNT} görsel yükleyebilirsiniz.`);
  }

  for (const [index, file] of galleryFiles.entries()) {
    const nextIndex = galleryEntries.length + index;
    galleryEntries.push({
      label: createGalleryImageLabel(nextIndex),
      image: await savePropertyImageFile(file, {
        storageKey: getStorageKey(),
        fileName: buildGalleryImageFileName(nextIndex),
        fieldLabel: `${createGalleryImageLabel(nextIndex)} görseli`,
      }),
    });
  }

  const galleryImages = galleryEntries.map((entry) => entry.image);
  const imageLabels = galleryEntries.map((entry) => entry.label);

  if (galleryImages.length === 0) {
    throw new Error("Kapak hariç en az bir galeri görseli bulunmalıdır.");
  }

  if (coverImage !== existing.coverImage) {
    await deleteManagedPropertyImages([existing.coverImage]);
  }

  return {
    title,
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
    advisorId: parseOptionalString(formData.get("advisorId")),
    latitude: parseOptionalNumber(formData.get("latitude")),
    longitude: parseOptionalNumber(formData.get("longitude")),
    coverColor: parseString(formData.get("coverColor"), "Kapak rengi"),
    coverImage,
    galleryImages,
    highlights: parseOptionalCommaSeparatedList(formData.get("highlights")),
    features: parseOptionalCommaSeparatedList(formData.get("features")),
    infoItems: readPropertyInfoItemsFromFormData(formData),
    imageLabels,
    translations: readPropertyTranslationsFromFormData(formData),
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

  if (!user.role || !canCreateOrEditPortfolios(user.role)) {
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!user.role || !canDeletePortfolios(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { slug } = await params;
  const existing = getPropertyBySlug(slug);

  if (!existing) {
    return NextResponse.json({ message: "Portföy bulunamadı." }, { status: 404 });
  }

  try {
    const removed = deletePropertyBySlug(slug);
    await deleteManagedPropertyImages([removed.coverImage, ...removed.galleryImages]);

    return NextResponse.json({
      property: {
        id: removed.id,
        slug: removed.slug,
        listingRef: removed.listingRef,
        title: removed.title,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portföy silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
