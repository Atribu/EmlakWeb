import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios, canDeletePortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import {
  countPropertiesReferencingImagePath,
  createPropertyActivityLog,
  deletePropertyBySlug,
  getPropertyBySlugWithOptions,
  listAdvisors,
  updatePropertyBySlug,
} from "@/lib/data-store";
import {
  buildPropertyDeletedActivity,
  buildPropertyUpdatedActivity,
  createPropertyActivityActor,
} from "@/lib/property-activity";
import { PROPERTY_MARKET_STATUS_OPTIONS, PROPERTY_PRICE_CURRENCY_OPTIONS, PROPERTY_PUBLICATION_STATUS_OPTIONS, PROPERTY_TYPE_OPTIONS } from "@/lib/property-panel-options";
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
import { getExchangeRateSnapshot } from "@/lib/exchange-rates";
import { type ExchangeRateTable } from "@/lib/exchange-rates-shared";
import { convertPriceToTry } from "@/lib/site-preferences";
import type { CreatePropertyInput, Property, PropertyMarketStatus, PropertyPriceCurrency, PropertyPublicationStatus, PropertyType } from "@/lib/types";

const validTypes = [...PROPERTY_TYPE_OPTIONS] as PropertyType[];
const validPriceCurrencies = PROPERTY_PRICE_CURRENCY_OPTIONS.map((option) => option.code) as PropertyPriceCurrency[];
const validMarketStatuses = [...PROPERTY_MARKET_STATUS_OPTIONS] as PropertyMarketStatus[];
const validPublicationStatuses = [...PROPERTY_PUBLICATION_STATUS_OPTIONS] as PropertyPublicationStatus[];

function normalizeNumericValue(value: unknown) {
  return typeof value === "string" ? value.trim().replace(",", ".") : value;
}

function parseNumber(value: unknown, fieldLabel: string): number {
  const numeric = Number(normalizeNumericValue(value));

  if (!Number.isFinite(numeric) || numeric <= 0) {
    throw new Error(`${fieldLabel} geçerli bir sayı olmalıdır.`);
  }

  return numeric;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  const numeric = Number(normalizeNumericValue(value));
  return Number.isFinite(numeric) ? numeric : undefined;
}

function parseOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function parsePriceCurrency(value: unknown): PropertyPriceCurrency {
  const currency = parseString(value, "Fiyat para birimi") as PropertyPriceCurrency;
  if (!validPriceCurrencies.includes(currency)) {
    throw new Error("Fiyat para birimi geçersiz.");
  }

  return currency;
}

function parseMarketStatus(value: unknown): PropertyMarketStatus {
  const status = parseString(value, "Portföy durumu") as PropertyMarketStatus;
  if (!validMarketStatuses.includes(status)) {
    throw new Error("Portföy durumu geçersiz.");
  }

  return status;
}

function parsePublicationStatus(value: unknown): PropertyPublicationStatus {
  const status = parseString(value, "Yayın durumu") as PropertyPublicationStatus;
  if (!validPublicationStatuses.includes(status)) {
    throw new Error("Yayın durumu geçersiz.");
  }

  return status;
}

function parseOptionalPublicationStatus(value: unknown): PropertyPublicationStatus | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return parsePublicationStatus(value);
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

function applyRoleScopedFields(
  input: CreatePropertyInput,
  actorRole: string,
  existing?: Property,
): CreatePropertyInput {
  const canSeeAdminFields = actorRole === "portal_admin" || actorRole === "admin";

  return {
    ...input,
    country: input.country?.trim() || existing?.country || "Türkiye",
    floor: input.floor?.trim() ?? "",
    publicationStatus: canSeeAdminFields
      ? (input.publicationStatus ?? existing?.publicationStatus ?? "Onay Bekliyor")
      : (existing?.publicationStatus ?? "Onay Bekliyor"),
    adminCommissionNotes: canSeeAdminFields ? input.adminCommissionNotes : existing?.adminCommissionNotes,
    adminPrivateNotes: canSeeAdminFields ? input.adminPrivateNotes : existing?.adminPrivateNotes,
  };
}

function parseInput(value: unknown, exchangeRates: ExchangeRateTable): CreatePropertyInput {
  if (!value || typeof value !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const payload = value as Record<string, unknown>;
  const type = parseString(payload.type, "Portföy tipi") as PropertyType;
  const priceCurrency = parsePriceCurrency(payload.priceCurrency);
  const priceSourceAmount = parseNumber(payload.price, "Fiyat");

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  return {
    title: parseString(payload.title, "Başlık"),
    country: parseOptionalString(payload.country) ?? "Türkiye",
    city: parseString(payload.city, "Şehir"),
    district: parseString(payload.district, "İlçe"),
    neighborhood: parseString(payload.neighborhood, "Mahalle"),
    type,
    price: convertPriceToTry(priceSourceAmount, priceCurrency, exchangeRates),
    priceCurrency,
    priceSourceAmount,
    rooms: parseString(payload.rooms, "Oda bilgisi"),
    areaM2: parseNumber(payload.areaM2, "Metrekare"),
    floor: parseOptionalString(payload.floor) ?? "",
    heating: parseString(payload.heating, "Isıtma"),
    marketStatus: parseMarketStatus(payload.marketStatus),
    publicationStatus: parseOptionalPublicationStatus(payload.publicationStatus),
    description: parseString(payload.description, "Açıklama"),
    developerCompany: parseOptionalString(payload.developerCompany),
    staffNotes: parseOptionalString(payload.staffNotes),
    customerFeedbackNotes: parseOptionalString(payload.customerFeedbackNotes),
    adminCommissionNotes: parseOptionalString(payload.adminCommissionNotes),
    adminPrivateNotes: parseOptionalString(payload.adminPrivateNotes),
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

type ParsedUpdateRequest = {
  input: CreatePropertyInput;
  orphanedImages: string[];
};

function galleryEntriesFromProperty(property: Property): GalleryEntry[] {
  return property.galleryImages.map((image, index) => ({
    label: property.imageLabels[index] ?? `Görsel ${index + 1}`,
    image,
  }));
}

async function parseFormDataInput(
  formData: FormData,
  existing: Property,
  exchangeRates: ExchangeRateTable,
): Promise<ParsedUpdateRequest> {
  const type = parseString(formData.get("type"), "Portföy tipi") as PropertyType;
  const title = parseString(formData.get("title"), "Başlık");
  const priceCurrency = parsePriceCurrency(formData.get("priceCurrency"));
  const priceSourceAmount = parseNumber(formData.get("price"), "Fiyat");

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  let storageKey: string | null = null;
  const getStorageKey = () => {
    storageKey ??= resolvePropertyStorageKey([existing.coverImage, ...existing.galleryImages], title);
    return storageKey;
  };

  const coverFile = formData.get("coverImageFile");
  const orphanedImages: string[] = [];
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
  orphanedImages.push(...Array.from(removedGalleryImages));

  const galleryOrder = formData
    .getAll("galleryOrder")
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);

  if (galleryOrder.length > 0) {
    const orderMap = new Map(galleryOrder.map((image, index) => [image, index]));
    galleryEntries.sort((left, right) => {
      const leftIndex = orderMap.get(left.image) ?? Number.MAX_SAFE_INTEGER;
      const rightIndex = orderMap.get(right.image) ?? Number.MAX_SAFE_INTEGER;

      return leftIndex - rightIndex;
    });
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
    orphanedImages.push(existing.coverImage);
  }

  return {
    orphanedImages,
    input: {
      title,
      country: parseOptionalString(formData.get("country")) ?? existing.country ?? "Türkiye",
      city: parseString(formData.get("city"), "Şehir"),
      district: parseString(formData.get("district"), "İlçe"),
      neighborhood: parseString(formData.get("neighborhood"), "Mahalle"),
      type,
      price: convertPriceToTry(priceSourceAmount, priceCurrency, exchangeRates),
      priceCurrency,
      priceSourceAmount,
      rooms: parseString(formData.get("rooms"), "Oda bilgisi"),
      areaM2: parseNumber(formData.get("areaM2"), "Metrekare"),
    floor: parseOptionalString(formData.get("floor")) ?? "",
    heating: parseString(formData.get("heating"), "Isıtma"),
    marketStatus: parseMarketStatus(formData.get("marketStatus")),
    publicationStatus: parseOptionalPublicationStatus(formData.get("publicationStatus")),
      description: parseString(formData.get("description"), "Açıklama"),
      developerCompany: parseOptionalString(formData.get("developerCompany")),
      staffNotes: parseOptionalString(formData.get("staffNotes")),
      customerFeedbackNotes: parseOptionalString(formData.get("customerFeedbackNotes")),
      adminCommissionNotes: parseOptionalString(formData.get("adminCommissionNotes")),
      adminPrivateNotes: parseOptionalString(formData.get("adminPrivateNotes")),
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
    },
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
  const existing = getPropertyBySlugWithOptions(slug, { includeInactive: true });

  if (!existing) {
    return NextResponse.json({ message: "Portföy bulunamadı." }, { status: 404 });
  }

  try {
    const contentType = request.headers.get("content-type") ?? "";
    const exchangeRates = (await getExchangeRateSnapshot()).rates;
    const parsed = contentType.includes("multipart/form-data")
      ? await parseFormDataInput(await request.formData(), existing, exchangeRates)
      : { input: parseInput(await request.json(), exchangeRates), orphanedImages: [] };
    const scopedInput = applyRoleScopedFields(parsed.input, user.role, existing);
    const property = updatePropertyBySlug(slug, scopedInput);
    const actor = createPropertyActivityActor(user);
    const advisorMap = new Map(listAdvisors().map((advisor) => [advisor.id, advisor.name]));

    createPropertyActivityLog(
      buildPropertyUpdatedActivity(existing, property, actor, {
        previousAdvisorName: advisorMap.get(existing.advisorId),
        nextAdvisorName: advisorMap.get(property.advisorId),
      }),
    );

    const unusedImages = parsed.orphanedImages.filter((imagePath) => countPropertiesReferencingImagePath(imagePath) === 0);
    if (unusedImages.length > 0) {
      await deleteManagedPropertyImages(unusedImages);
    }

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
  const existing = getPropertyBySlugWithOptions(slug, { includeInactive: true });

  if (!existing) {
    return NextResponse.json({ message: "Portföy bulunamadı." }, { status: 404 });
  }

  try {
    const removed = deletePropertyBySlug(slug);
    const actor = createPropertyActivityActor(user);
    const advisorMap = new Map(listAdvisors().map((advisor) => [advisor.id, advisor.name]));

    createPropertyActivityLog(
      buildPropertyDeletedActivity(removed, actor, {
        advisorName: advisorMap.get(removed.advisorId),
      }),
    );

    const removableImages = [removed.coverImage, ...removed.galleryImages].filter(
      (imagePath) => countPropertiesReferencingImagePath(imagePath) === 0,
    );
    if (removableImages.length > 0) {
      await deleteManagedPropertyImages(removableImages);
    }

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
