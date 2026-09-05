import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { createProperty, createPropertyActivityLog, listAdvisors, listProperties } from "@/lib/data-store";
import { buildPropertyCreatedActivity, createPropertyActivityActor } from "@/lib/property-activity";
import { PROPERTY_MARKET_STATUS_OPTIONS, PROPERTY_PRICE_CURRENCY_OPTIONS, PROPERTY_TYPE_OPTIONS } from "@/lib/property-panel-options";
import {
  buildGalleryImageFileName,
  createPropertyImageStorageKey,
  savePropertyImageFile,
} from "@/lib/property-image-storage";
import {
  createGalleryImageLabel,
  getFilesFromFormData,
  MAX_GALLERY_IMAGE_COUNT,
  validateTotalUploadSize,
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
import type { ExchangeRateTable } from "@/lib/exchange-rates-shared";
import { convertPriceToTry, normalizeSiteCurrency, readSitePreferencesFromCookieHeader } from "@/lib/site-preferences";
import { filterPropertiesByDisplayPrice } from "@/lib/property-pricing";
import type { CreatePropertyInput, PropertyMarketStatus, PropertyPriceCurrency, PropertyType } from "@/lib/types";

const validTypes = [...PROPERTY_TYPE_OPTIONS] as PropertyType[];
const validPriceCurrencies = PROPERTY_PRICE_CURRENCY_OPTIONS.map((option) => option.code) as PropertyPriceCurrency[];
const validMarketStatuses = [...PROPERTY_MARKET_STATUS_OPTIONS] as PropertyMarketStatus[];

type ParsedCreateRequest = {
  input: CreatePropertyInput;
  roomSelections: string[];
};

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

function parseRoomSelections(value: unknown, fallbackLabel = "Oda bilgisi"): string[] {
  if (Array.isArray(value)) {
    const rooms = value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);

    if (rooms.length > 0) {
      return Array.from(new Set(rooms));
    }
  }

  const singleValue = parseOptionalString(value);
  if (singleValue) {
    return [singleValue];
  }

  throw new Error(`${fallbackLabel} zorunludur.`);
}

function resolveVariantTitle(baseTitle: string, sourceRoom: string, nextRoom: string, selectionCount: number): string {
  const normalizedTitle = baseTitle.trim();

  if (selectionCount <= 1) {
    return normalizedTitle;
  }

  if (sourceRoom && normalizedTitle.includes(sourceRoom)) {
    return normalizedTitle.replace(sourceRoom, nextRoom);
  }

  if (normalizedTitle.endsWith(`- ${nextRoom}`) || normalizedTitle.endsWith(nextRoom)) {
    return normalizedTitle;
  }

  return `${normalizedTitle} - ${nextRoom}`;
}

function createVariantInput(input: CreatePropertyInput, roomSelections: string[], room: string): CreatePropertyInput {
  return {
    ...input,
    rooms: room,
    title: resolveVariantTitle(input.title, input.rooms, room, roomSelections.length),
  };
}

function applyRoleScopedFields(
  input: CreatePropertyInput,
  actorRole: string,
): CreatePropertyInput {
  const canSeeAdminFields = actorRole === "portal_admin" || actorRole === "admin";

  return {
    ...input,
    country: input.country?.trim() || "Türkiye",
    floor: input.floor?.trim() ?? "",
    publicationStatus: "Onay Bekliyor",
    adminCommissionNotes: canSeeAdminFields ? input.adminCommissionNotes : undefined,
    adminPrivateNotes: canSeeAdminFields ? input.adminPrivateNotes : undefined,
  };
}

function parseCreateInput(value: unknown, exchangeRates: ExchangeRateTable): ParsedCreateRequest {
  if (!value || typeof value !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const payload = value as Record<string, unknown>;
  const type = parseString(payload.type, "Portföy tipi") as PropertyType;
  const roomSelections = parseRoomSelections(payload.roomSelections ?? payload.rooms, "Oda bilgisi");
  const priceCurrency = parsePriceCurrency(payload.priceCurrency);
  const priceSourceAmount = parseNumber(payload.price, "Fiyat");

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  return {
    roomSelections,
    input: {
      title: parseString(payload.title, "Başlık"),
      country: parseOptionalString(payload.country) ?? "Türkiye",
      city: parseString(payload.city, "Şehir"),
      district: parseString(payload.district, "İlçe"),
      neighborhood: parseString(payload.neighborhood, "Mahalle"),
      type,
      price: convertPriceToTry(priceSourceAmount, priceCurrency, exchangeRates),
      priceCurrency,
      priceSourceAmount,
      rooms: roomSelections[0],
      areaM2: parseNumber(payload.areaM2, "Metrekare"),
      floor: parseOptionalString(payload.floor) ?? "",
      heating: parseString(payload.heating, "Isıtma"),
      marketStatus: parseMarketStatus(payload.marketStatus),
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
    },
  };
}

async function parseCreateFormData(formData: FormData, exchangeRates: ExchangeRateTable): Promise<ParsedCreateRequest> {
  const type = parseString(formData.get("type"), "Portföy tipi") as PropertyType;
  const title = parseString(formData.get("title"), "Başlık");
  const roomSelections = parseRoomSelections(formData.getAll("roomSelections"), "Oda bilgisi");
  const priceCurrency = parsePriceCurrency(formData.get("priceCurrency"));
  const priceSourceAmount = parseNumber(formData.get("price"), "Fiyat");

  if (!validTypes.includes(type)) {
    throw new Error("Portföy tipi geçersiz.");
  }

  const coverFile = formData.get("coverImageFile");
  if (!(coverFile instanceof File) || coverFile.size === 0) {
    throw new Error("Kapak görseli zorunludur.");
  }

  const storageKey = createPropertyImageStorageKey(title);
  const coverImage = await savePropertyImageFile(coverFile, {
    storageKey,
    fileName: "cover",
    fieldLabel: "Kapak görseli",
  });

  const galleryFiles = getFilesFromFormData(formData, "galleryImageFiles");
  validateTotalUploadSize([coverFile, ...galleryFiles]);

  if (galleryFiles.length === 0) {
    throw new Error("Kapak hariç en az bir galeri görseli yükleyin.");
  }

  if (galleryFiles.length > MAX_GALLERY_IMAGE_COUNT) {
    throw new Error(`Galeri için en fazla ${MAX_GALLERY_IMAGE_COUNT} görsel yükleyebilirsiniz.`);
  }

  const galleryImages: string[] = [];
  const imageLabels: string[] = [];

  for (const [index, file] of galleryFiles.entries()) {
    const label = createGalleryImageLabel(index);
    galleryImages.push(
      await savePropertyImageFile(file, {
        storageKey,
        fileName: buildGalleryImageFileName(index),
        fieldLabel: `${label} görseli`,
      }),
    );
    imageLabels.push(label);
  }

  if (galleryImages.length === 0) {
    throw new Error("Kapak hariç en az bir galeri görseli yükleyin.");
  }

  return {
    roomSelections,
    input: {
      title,
      country: parseOptionalString(formData.get("country")) ?? "Türkiye",
      city: parseString(formData.get("city"), "Şehir"),
      district: parseString(formData.get("district"), "İlçe"),
      neighborhood: parseString(formData.get("neighborhood"), "Mahalle"),
      type,
      price: convertPriceToTry(priceSourceAmount, priceCurrency, exchangeRates),
      priceCurrency,
      priceSourceAmount,
      rooms: roomSelections[0],
      areaM2: parseNumber(formData.get("areaM2"), "Metrekare"),
      floor: parseOptionalString(formData.get("floor")) ?? "",
      heating: parseString(formData.get("heating"), "Isıtma"),
      marketStatus: parseMarketStatus(formData.get("marketStatus")),
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

export async function GET(request: NextRequest) {
  const url = request.nextUrl;
  const query = url.searchParams.get("q") ?? undefined;
  const country = url.searchParams.get("country") ?? undefined;
  const city = url.searchParams.get("city") ?? undefined;
  const type = url.searchParams.get("type") ?? undefined;
  const rooms = url.searchParams.get("rooms") ?? undefined;
  const selectedCurrency = normalizeSiteCurrency(
    url.searchParams.get("currency")
      ?? readSitePreferencesFromCookieHeader(request.headers.get("cookie")).currency,
  );
  const exchangeRates = (await getExchangeRateSnapshot()).rates;

  const minPriceRaw = url.searchParams.get("minPrice");
  const maxPriceRaw = url.searchParams.get("maxPrice");

  const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

  const matchingProperties = listProperties({
    query,
    country,
    city,
    type,
    rooms,
  });
  const properties = filterPropertiesByDisplayPrice(matchingProperties, {
    currency: selectedCurrency,
    exchangeRates,
    minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
    maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
  });

  return NextResponse.json({ properties });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!user.role || !canCreateOrEditPortfolios(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  try {
    const exchangeRates = (await getExchangeRateSnapshot()).rates;
    const contentType = request.headers.get("content-type") ?? "";
    const parsed = contentType.includes("multipart/form-data")
      ? await parseCreateFormData(await request.formData(), exchangeRates)
      : parseCreateInput(await request.json(), exchangeRates);
    const scopedInput = applyRoleScopedFields(parsed.input, user.role);
    const actor = createPropertyActivityActor(user);
    const advisorMap = new Map(listAdvisors().map((advisor) => [advisor.id, advisor.name]));
    const properties = parsed.roomSelections.map((room) =>
      createProperty(createVariantInput(scopedInput, parsed.roomSelections, room), user.id),
    );

    properties.forEach((property) => {
      createPropertyActivityLog(
        buildPropertyCreatedActivity(property, actor, {
          advisorName: advisorMap.get(property.advisorId),
        }),
      );
    });

    return NextResponse.json({
      properties,
      property: properties[0],
      count: properties.length,
    }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portföy eklenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
