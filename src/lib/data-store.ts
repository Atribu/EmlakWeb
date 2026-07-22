import db from "@/lib/db";
import { HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS } from "@/lib/home-location-spotlights";
import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/passwords";
import { assertSafeProductionPassword, isProductionRuntime, isUnsafeDefaultAdminCredential } from "@/lib/security";
import { sanitizePropertyTranslations } from "@/lib/property-content";
import { sanitizePropertyInfoItems } from "@/lib/property-info-items";
import { isPropertyPublished } from "@/lib/property-panel-options";
import { pickSampleAdvisorImageForSeed } from "@/lib/sample-advisor-images";
import { pickSampleImageSet } from "@/lib/sample-images";
import type {
  Advisor,
  BlogPost,
  ContactLead,
  CreateAdvisorInput,
  CreateBlogPostInput,
  CreateHomeLocationSpotlightInput,
  CreateLeadInput,
  CreatePropertyActivityLogInput,
  CreatePropertyInput,
  CreateSellerLeadInput,
  CreateUserInput,
  HomeLocationSpotlight,
  HomeLocationSpotlightLayout,
  HomeLocationSpotlightTranslationFields,
  HomeLocationSpotlightTranslations,
  LeadPriority,
  LeadStage,
  Property,
  PropertyActivityLog,
  PropertyFilter,
  SafeUser,
  SellerLead,
  User,
  UserRole,
} from "@/lib/types";

// ─── helpers ────────────────────────────────────────────────────────────────

const cityNormalizer: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
};

const cityCenterLookup: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Izmir: [38.4237, 27.1428],
  İzmir: [38.4237, 27.1428],
  Ankara: [39.9334, 32.8597],
  Antalya: [36.8969, 30.7133],
  Bursa: [40.1885, 29.061],
};

const validLeadStages: LeadStage[] = [
  "new", "called", "appointment_scheduled", "offer_submitted", "won", "lost",
];

const validLeadPriorities: LeadPriority[] = ["low", "normal", "high"];
const validHomeLocationSpotlightLayouts = HOME_LOCATION_SPOTLIGHT_LAYOUT_OPTIONS.map(
  (option) => option.value,
) as HomeLocationSpotlightLayout[];

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ç|ğ|ı|ö|ş|ü/g, (char) => cityNormalizer[char[0]] ?? char[0])
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function createSlug(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function uniqueSlug(base: string): string {
  const rows = db.prepare("SELECT slug FROM properties WHERE slug = ? OR slug LIKE ?").all(base, `${base}-%`) as { slug: string }[];
  const existing = new Set(rows.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) cursor += 1;
  return `${base}-${cursor}`;
}

function uniqueBlogSlug(base: string): string {
  const rows = db.prepare("SELECT slug FROM blog_posts WHERE slug = ? OR slug LIKE ?").all(base, `${base}-%`) as { slug: string }[];
  const existing = new Set(rows.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) cursor += 1;
  return `${base}-${cursor}`;
}

function uniqueHomeLocationSpotlightSlug(base: string): string {
  const rows = db.prepare("SELECT slug FROM home_location_spotlights WHERE slug = ? OR slug LIKE ?").all(
    base,
    `${base}-%`,
  ) as { slug: string }[];
  const existing = new Set(rows.map((row) => row.slug));
  if (!existing.has(base)) return base;
  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) cursor += 1;
  return `${base}-${cursor}`;
}

function nextListingRef(): string {
  const row = db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number };
  return `PN-${String(row.c + 1).padStart(4, "0")}`;
}

function inferCoordinates(input: CreatePropertyInput, propCount: number): { latitude: number; longitude: number } {
  if (
    typeof input.latitude === "number" && Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" && Number.isFinite(input.longitude)
  ) {
    return { latitude: input.latitude, longitude: input.longitude };
  }
  const center =
    cityCenterLookup[input.city] ??
    cityCenterLookup[input.city.replace("İ", "I")] ??
    cityCenterLookup.İstanbul;
  const offsetIndex = propCount % 7;
  return {
    latitude: Number((center[0] + (offsetIndex - 3) * 0.0052).toFixed(6)),
    longitude: Number((center[1] + (offsetIndex - 3) * 0.0041).toFixed(6)),
  };
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id, name: user.name, role: user.role,
    email: user.email, phone: user.phone, username: user.username,
    advisorId: user.advisorId,
  };
}

function cleanOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function sanitizeHomeLocationSpotlightTranslationFields(
  value: HomeLocationSpotlightTranslationFields | undefined,
): HomeLocationSpotlightTranslationFields | undefined {
  if (!value) {
    return undefined;
  }

  const nextValue: HomeLocationSpotlightTranslationFields = {
    title: cleanOptionalText(value.title),
    subtitle: cleanOptionalText(value.subtitle),
    badge: cleanOptionalText(value.badge),
    blurb: cleanOptionalText(value.blurb),
    statText: cleanOptionalText(value.statText),
  };

  if (!Object.values(nextValue).some(Boolean)) {
    return undefined;
  }

  return nextValue;
}

function sanitizeHomeLocationSpotlightTranslations(
  value: HomeLocationSpotlightTranslations | undefined,
): HomeLocationSpotlightTranslations {
  if (!value) {
    return {};
  }

  const output: HomeLocationSpotlightTranslations = {};

  for (const language of ["EN", "RU", "AR"] as const) {
    const sanitizedFields = sanitizeHomeLocationSpotlightTranslationFields(value[language]);

    if (sanitizedFields) {
      output[language] = sanitizedFields;
    }
  }

  return output;
}

// ─── row mappers ─────────────────────────────────────────────────────────────

function rowToProperty(row: Record<string, unknown>): Property {
  return {
    ...(row as unknown as Property),
    country: cleanOptionalText(row.country as string | undefined) ?? "Türkiye",
    price: Number(row.price),
    priceSourceAmount: row.priceSourceAmount != null ? Number(row.priceSourceAmount) : Number(row.price),
    areaM2: Number(row.areaM2),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    highlights: JSON.parse(row.highlights as string),
    features: JSON.parse(row.features as string),
    infoItems: JSON.parse(row.infoItems as string),
    galleryImages: JSON.parse(row.galleryImages as string),
    imageLabels: JSON.parse(row.imageLabels as string),
    translations: JSON.parse(row.translations as string),
    priceCurrency: (row.priceCurrency as Property["priceCurrency"]) ?? "TRY",
    marketStatus: (row.marketStatus as Property["marketStatus"]) ?? "Hazır",
    publicationStatus: (row.publicationStatus as Property["publicationStatus"]) ?? "Aktif",
    developerCompany: cleanOptionalText(row.developerCompany as string | undefined),
    staffNotes: cleanOptionalText(row.staffNotes as string | undefined),
    customerFeedbackNotes: cleanOptionalText(row.customerFeedbackNotes as string | undefined),
    adminCommissionNotes: cleanOptionalText(row.adminCommissionNotes as string | undefined),
    adminPrivateNotes: cleanOptionalText(row.adminPrivateNotes as string | undefined),
  };
}

function rowToAdvisor(row: Record<string, unknown>): Advisor {
  return row as unknown as Advisor;
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    ...(row as unknown as User),
    advisorId: (row.advisorId as string | null) ?? undefined,
  };
}

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    ...(row as unknown as BlogPost),
    tags: JSON.parse(row.tags as string),
  };
}

function rowToHomeLocationSpotlight(row: Record<string, unknown>): HomeLocationSpotlight {
  return {
    ...(row as unknown as HomeLocationSpotlight),
    statText: cleanOptionalText(row.statText as string | undefined),
    priceAmount: row.priceAmount != null ? Number(row.priceAmount) : undefined,
    priceCurrency: cleanOptionalText(row.priceCurrency as string | undefined) as HomeLocationSpotlight["priceCurrency"],
    layoutVariant: validHomeLocationSpotlightLayouts.includes(row.layoutVariant as HomeLocationSpotlightLayout)
      ? (row.layoutVariant as HomeLocationSpotlightLayout)
      : "wide",
    sortOrder: Number(row.sortOrder),
    isActive: Number(row.isActive) === 1,
    translations: sanitizeHomeLocationSpotlightTranslations(
      JSON.parse((row.translations as string) || "{}") as HomeLocationSpotlightTranslations,
    ),
  };
}

function rowToLead(row: Record<string, unknown>): ContactLead {
  return {
    ...(row as unknown as ContactLead),
    priority: validLeadPriorities.includes(row.priority as LeadPriority)
      ? (row.priority as LeadPriority)
      : "normal",
    preferredDate: (row.preferredDate as string | null) ?? undefined,
    preferredTime: (row.preferredTime as string | null) ?? undefined,
    followUpDate: (row.followUpDate as string | null) ?? undefined,
    appointmentNote: (row.appointmentNote as string | null) ?? undefined,
    assignedAdvisorId: (row.assignedAdvisorId as string | null) ?? undefined,
    pipelineNote: (row.pipelineNote as string | null) ?? undefined,
  };
}

function rowToSellerLead(row: Record<string, unknown>): SellerLead {
  return {
    ...(row as unknown as SellerLead),
    areaM2: row.areaM2 != null ? Number(row.areaM2) : undefined,
  };
}

function rowToPropertyActivityLog(row: Record<string, unknown>): PropertyActivityLog {
  return {
    ...(row as unknown as PropertyActivityLog),
    propertyId: (row.propertyId as string | null) ?? undefined,
    listingRef: (row.listingRef as string | null) ?? undefined,
    actorUserId: (row.actorUserId as string | null) ?? undefined,
    details: JSON.parse((row.details as string) || "[]"),
  };
}

// ─── advisors ────────────────────────────────────────────────────────────────

export function listAdvisors(): Advisor[] {
  return (db.prepare("SELECT * FROM advisors").all() as Record<string, unknown>[]).map(rowToAdvisor);
}

export function getAdvisorById(advisorId: string): Advisor | undefined {
  const row = db.prepare("SELECT * FROM advisors WHERE id = ?").get(advisorId) as Record<string, unknown> | undefined;
  return row ? rowToAdvisor(row) : undefined;
}

export function createAdvisor(input: CreateAdvisorInput): Advisor {
  const name = input.name.trim();
  const title = input.title.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const focusArea = input.focusArea.trim();

  if (!name || !title || !phone || !whatsapp || !email || !focusArea) {
    throw new Error("Danışman alanları eksik.");
  }

  const existing = db.prepare("SELECT id FROM advisors WHERE LOWER(email) = ?").get(email);
  if (existing) throw new Error("Bu e-posta ile kayıtlı bir danışman zaten var.");

  const advisor: Advisor = {
    id: `adv-${crypto.randomUUID()}`,
    name, title, phone, whatsapp, email, focusArea,
    image: input.image || pickSampleAdvisorImageForSeed(email),
  };

  db.prepare(`
    INSERT INTO advisors (id, name, title, phone, whatsapp, email, focusArea, image)
    VALUES (@id, @name, @title, @phone, @whatsapp, @email, @focusArea, @image)
  `).run(advisor);

  return advisor;
}

export function updateAdvisorById(advisorId: string, input: CreateAdvisorInput): Advisor {
  const advisor = getAdvisorById(advisorId);
  if (!advisor) throw new Error("Danışman bulunamadı.");

  const name = input.name.trim();
  const title = input.title.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const focusArea = input.focusArea.trim();

  if (!name || !title || !phone || !whatsapp || !email || !focusArea) {
    throw new Error("Danışman alanları eksik.");
  }

  const conflict = db.prepare("SELECT id FROM advisors WHERE LOWER(email) = ? AND id != ?").get(email, advisorId);
  if (conflict) throw new Error("Bu e-posta başka bir danışmana ait.");

  const image = input.image || advisor.image;
  db.prepare(`
    UPDATE advisors SET name=@name, title=@title, phone=@phone, whatsapp=@whatsapp,
      email=@email, focusArea=@focusArea, image=@image WHERE id=@id
  `).run({ name, title, phone, whatsapp, email, focusArea, image, id: advisorId });

  return { ...advisor, name, title, phone, whatsapp, email, focusArea, image };
}

export function deleteAdvisor(advisorId: string): Advisor {
  const advisor = getAdvisorById(advisorId);
  if (!advisor) throw new Error("Danışman bulunamadı.");

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE advisorId = ?").get(advisorId) as { c: number }).c;
  if (propCount > 0) throw new Error(`Bu danışmana bağlı ${propCount} portföy var. Önce portföyleri başka danışmana taşıyın.`);

  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE advisorId = ?").get(advisorId) as { c: number }).c;
  if (userCount > 0) throw new Error(`Bu danışmana bağlı ${userCount} kullanıcı hesabı var. Önce kullanıcı bağlantısını kaldırın.`);

  db.prepare("DELETE FROM advisors WHERE id = ?").run(advisorId);
  return advisor;
}

// ─── properties ──────────────────────────────────────────────────────────────

export function listProperties(filter: PropertyFilter = {}): Property[] {
  const rows = (db.prepare("SELECT * FROM properties ORDER BY publishedAt DESC").all() as Record<string, unknown>[]).map(rowToProperty);
  const query = filter.query ? normalizeText(filter.query) : "";

  return rows.filter((p) => {
    if (!filter.includeInactive && !isPropertyPublished(p.publicationStatus)) return false;
    if (filter.country && (p.country ?? "Türkiye") !== filter.country) return false;
    if (filter.city && p.city !== filter.city) return false;
    if (filter.type && p.type !== filter.type) return false;
    if (filter.marketStatus && p.marketStatus !== filter.marketStatus) return false;
    if (filter.publicationStatus && p.publicationStatus !== filter.publicationStatus) return false;
    if (typeof filter.minPrice === "number" && p.price < filter.minPrice) return false;
    if (typeof filter.maxPrice === "number" && p.price > filter.maxPrice) return false;
    if (filter.rooms && p.rooms !== filter.rooms) return false;
    if (filter.advisorId && p.advisorId !== filter.advisorId) return false;
    if (!query) return true;

    const haystack = normalizeText([
      p.title, p.country ?? "", p.city, p.district, p.neighborhood, p.listingRef,
      ...(p.infoItems?.map((i) => i.value) ?? []),
      ...(p.translations ? Object.values(p.translations).flatMap((t) => [
        t?.title ?? "", t?.description ?? "",
        ...(t?.highlights ?? []), ...(t?.features ?? []),
      ]) : []),
    ].join(" "));

    return haystack.includes(query);
  });
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return getPropertyBySlugWithOptions(slug);
}

export function getPropertyBySlugWithOptions(slug: string, options: { includeInactive?: boolean } = {}): Property | undefined {
  const row = db.prepare("SELECT * FROM properties WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  const property = row ? rowToProperty(row) : undefined;

  if (!property) {
    return undefined;
  }

  if (!options.includeInactive && !isPropertyPublished(property.publicationStatus)) {
    return undefined;
  }

  return property;
}

export function createProperty(input: CreatePropertyInput, actorId: string): Property {
  void actorId;
  if (input.advisorId && !getAdvisorById(input.advisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const sampleSet = pickSampleImageSet(propCount + 1);
  const baseSlug = createSlug(input.title);
  const location = inferCoordinates(input, propCount);

  const property: Property = {
    ...input,
    country: input.country?.trim() || "Türkiye",
    priceCurrency: input.priceCurrency ?? "TRY",
    priceSourceAmount: input.priceSourceAmount ?? input.price,
    advisorId: input.advisorId?.trim() ?? "",
    marketStatus: input.marketStatus ?? "Hazır",
    publicationStatus: input.publicationStatus ?? "Onay Bekliyor",
    infoItems: sanitizePropertyInfoItems(input.infoItems),
    translations: sanitizePropertyTranslations(input.translations) ?? {},
    developerCompany: cleanOptionalText(input.developerCompany),
    staffNotes: cleanOptionalText(input.staffNotes),
    customerFeedbackNotes: cleanOptionalText(input.customerFeedbackNotes),
    adminCommissionNotes: cleanOptionalText(input.adminCommissionNotes),
    adminPrivateNotes: cleanOptionalText(input.adminPrivateNotes),
    latitude: location.latitude,
    longitude: location.longitude,
    coverImage: input.coverImage || sampleSet.cover,
    galleryImages: input.galleryImages && input.galleryImages.length > 0 ? input.galleryImages : sampleSet.gallery,
    imageLabels: input.imageLabels ?? [],
    id: `prp-${crypto.randomUUID()}`,
    slug: uniqueSlug(baseSlug),
    listingRef: nextListingRef(),
    publishedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO properties
      (id, slug, title, country, city, district, neighborhood, type, price, priceCurrency, priceSourceAmount, rooms, areaM2,
       floor, heating, marketStatus, publicationStatus, listingRef, description, highlights, features, infoItems,
       developerCompany, staffNotes, customerFeedbackNotes, adminCommissionNotes, adminPrivateNotes,
       advisorId, latitude, longitude, coverColor, coverImage, galleryImages,
       imageLabels, translations, publishedAt)
    VALUES
      (@id, @slug, @title, @country, @city, @district, @neighborhood, @type, @price, @priceCurrency, @priceSourceAmount, @rooms, @areaM2,
       @floor, @heating, @marketStatus, @publicationStatus, @listingRef, @description, @highlights, @features, @infoItems,
       @developerCompany, @staffNotes, @customerFeedbackNotes, @adminCommissionNotes, @adminPrivateNotes,
       @advisorId, @latitude, @longitude, @coverColor, @coverImage, @galleryImages,
       @imageLabels, @translations, @publishedAt)
  `).run({
    ...property,
    highlights: JSON.stringify(property.highlights),
    features: JSON.stringify(property.features),
    infoItems: JSON.stringify(property.infoItems),
    galleryImages: JSON.stringify(property.galleryImages),
    imageLabels: JSON.stringify(property.imageLabels),
    translations: JSON.stringify(property.translations),
    developerCompany: property.developerCompany ?? null,
    staffNotes: property.staffNotes ?? null,
    customerFeedbackNotes: property.customerFeedbackNotes ?? null,
    adminCommissionNotes: property.adminCommissionNotes ?? null,
    adminPrivateNotes: property.adminPrivateNotes ?? null,
  });

  return property;
}

export function updatePropertyBySlug(slug: string, input: CreatePropertyInput): Property {
  const property = getPropertyBySlugWithOptions(slug, { includeInactive: true });
  if (!property) throw new Error("Portföy bulunamadı.");

  if (input.advisorId && !getAdvisorById(input.advisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const location = inferCoordinates({
    ...input,
    latitude: input.latitude ?? property.latitude,
    longitude: input.longitude ?? property.longitude,
  }, propCount);

  const updated: Property = {
    ...property,
    title: input.title.trim(),
    country: input.country?.trim() || property.country || "Türkiye",
    city: input.city.trim(),
    district: input.district.trim(),
    neighborhood: input.neighborhood.trim(),
    type: input.type,
    price: input.price,
    priceCurrency: input.priceCurrency ?? property.priceCurrency ?? "TRY",
    priceSourceAmount: input.priceSourceAmount ?? input.price,
    rooms: input.rooms.trim(),
    areaM2: input.areaM2,
    floor: input.floor.trim(),
    heating: input.heating.trim(),
    marketStatus: input.marketStatus ?? property.marketStatus ?? "Hazır",
    publicationStatus: input.publicationStatus ?? property.publicationStatus ?? "Onay Bekliyor",
    description: input.description.trim(),
    highlights: input.highlights,
    features: input.features,
    infoItems: sanitizePropertyInfoItems(input.infoItems),
    developerCompany: cleanOptionalText(input.developerCompany),
    staffNotes: cleanOptionalText(input.staffNotes),
    customerFeedbackNotes: cleanOptionalText(input.customerFeedbackNotes),
    adminCommissionNotes: cleanOptionalText(input.adminCommissionNotes),
    adminPrivateNotes: cleanOptionalText(input.adminPrivateNotes),
    advisorId: input.advisorId?.trim() ?? "",
    latitude: location.latitude,
    longitude: location.longitude,
    coverColor: input.coverColor,
    coverImage: input.coverImage || property.coverImage,
    galleryImages: input.galleryImages.length > 0 ? input.galleryImages : property.galleryImages,
    imageLabels: input.imageLabels.length > 0 ? input.imageLabels : property.imageLabels,
    translations: sanitizePropertyTranslations(input.translations) ?? {},
  };

  db.prepare(`
    UPDATE properties SET
      title=@title, country=@country, city=@city, district=@district, neighborhood=@neighborhood,
      type=@type, price=@price, priceCurrency=@priceCurrency, priceSourceAmount=@priceSourceAmount,
      rooms=@rooms, areaM2=@areaM2, floor=@floor,
      heating=@heating, marketStatus=@marketStatus, publicationStatus=@publicationStatus, description=@description, highlights=@highlights,
      features=@features, infoItems=@infoItems, developerCompany=@developerCompany,
      staffNotes=@staffNotes, customerFeedbackNotes=@customerFeedbackNotes,
      adminCommissionNotes=@adminCommissionNotes, adminPrivateNotes=@adminPrivateNotes, advisorId=@advisorId,
      latitude=@latitude, longitude=@longitude, coverColor=@coverColor,
      coverImage=@coverImage, galleryImages=@galleryImages, imageLabels=@imageLabels,
      translations=@translations
    WHERE slug=@slug
  `).run({
    ...updated,
    highlights: JSON.stringify(updated.highlights),
    features: JSON.stringify(updated.features),
    infoItems: JSON.stringify(updated.infoItems),
    galleryImages: JSON.stringify(updated.galleryImages),
    imageLabels: JSON.stringify(updated.imageLabels),
    translations: JSON.stringify(updated.translations),
    developerCompany: updated.developerCompany ?? null,
    staffNotes: updated.staffNotes ?? null,
    customerFeedbackNotes: updated.customerFeedbackNotes ?? null,
    adminCommissionNotes: updated.adminCommissionNotes ?? null,
    adminPrivateNotes: updated.adminPrivateNotes ?? null,
  });

  return updated;
}

export function updatePropertyOperationalFieldsBySlug(
  slug: string,
  input: { publicationStatus?: Property["publicationStatus"]; advisorId?: string },
): Property {
  const property = getPropertyBySlugWithOptions(slug, { includeInactive: true });
  if (!property) throw new Error("Portföy bulunamadı.");

  if (input.advisorId && !getAdvisorById(input.advisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const updated: Property = {
    ...property,
    publicationStatus: input.publicationStatus ?? property.publicationStatus ?? "Onay Bekliyor",
    advisorId: input.advisorId?.trim() ?? property.advisorId,
  };

  db.prepare(`
    UPDATE properties SET
      publicationStatus=@publicationStatus,
      advisorId=@advisorId
    WHERE slug=@slug
  `).run({
    slug,
    publicationStatus: updated.publicationStatus,
    advisorId: updated.advisorId,
  });

  return updated;
}

export function updatePropertiesOperationalBySlugs(
  slugs: string[],
  input: { publicationStatus?: Property["publicationStatus"]; advisorId?: string },
): Property[] {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    throw new Error("Güncellenecek portföy seçilmedi.");
  }

  return db.transaction((batch: string[]) =>
    batch.map((slug) => updatePropertyOperationalFieldsBySlug(slug, input))
  )(uniqueSlugs);
}

type PropertyNoteUpdateInput = {
  slug: string;
  staffNotes?: string;
  customerFeedbackNotes?: string;
  adminCommissionNotes?: string;
  adminPrivateNotes?: string;
};

export function updatePropertyNotesBySlug(
  slug: string,
  input: Omit<PropertyNoteUpdateInput, "slug">,
): Property {
  const property = getPropertyBySlugWithOptions(slug, { includeInactive: true });
  if (!property) throw new Error("Portföy bulunamadı.");

  const updated: Property = {
    ...property,
    staffNotes: cleanOptionalText(input.staffNotes) ?? property.staffNotes,
    customerFeedbackNotes: cleanOptionalText(input.customerFeedbackNotes) ?? property.customerFeedbackNotes,
    adminCommissionNotes: cleanOptionalText(input.adminCommissionNotes) ?? property.adminCommissionNotes,
    adminPrivateNotes: cleanOptionalText(input.adminPrivateNotes) ?? property.adminPrivateNotes,
  };

  db.prepare(`
    UPDATE properties SET
      staffNotes=@staffNotes,
      customerFeedbackNotes=@customerFeedbackNotes,
      adminCommissionNotes=@adminCommissionNotes,
      adminPrivateNotes=@adminPrivateNotes
    WHERE slug=@slug
  `).run({
    slug,
    staffNotes: updated.staffNotes ?? null,
    customerFeedbackNotes: updated.customerFeedbackNotes ?? null,
    adminCommissionNotes: updated.adminCommissionNotes ?? null,
    adminPrivateNotes: updated.adminPrivateNotes ?? null,
  });

  return updated;
}

export function updatePropertyNotesBySlugs(
  updates: PropertyNoteUpdateInput[],
): Property[] {
  const uniqueUpdates = updates.filter((update, index, current) =>
    Boolean(update.slug) && current.findIndex((item) => item.slug === update.slug) === index,
  );

  if (uniqueUpdates.length === 0) {
    throw new Error("Güncellenecek portföy seçilmedi.");
  }

  return db.transaction((batch: PropertyNoteUpdateInput[]) =>
    batch.map((update) => updatePropertyNotesBySlug(update.slug, update))
  )(uniqueUpdates);
}

export function deletePropertyBySlug(slug: string): Property {
  const property = getPropertyBySlugWithOptions(slug, { includeInactive: true });
  if (!property) throw new Error("Portföy bulunamadı.");
  db.prepare("DELETE FROM properties WHERE slug = ?").run(slug);
  return property;
}

export function deletePropertiesBySlugs(slugs: string[]): Property[] {
  const uniqueSlugs = Array.from(new Set(slugs.filter(Boolean)));

  if (uniqueSlugs.length === 0) {
    throw new Error("Silinecek portföy seçilmedi.");
  }

  return db.transaction((batch: string[]) => batch.map((slug) => deletePropertyBySlug(slug)))(uniqueSlugs);
}

export function createPropertyActivityLog(input: CreatePropertyActivityLogInput): PropertyActivityLog {
  const activityLog: PropertyActivityLog = {
    id: `act-${crypto.randomUUID()}`,
    propertySlug: input.propertySlug.trim(),
    propertyId: input.propertyId?.trim() || undefined,
    listingRef: input.listingRef?.trim() || undefined,
    propertyTitle: input.propertyTitle.trim(),
    actionType: input.actionType,
    actorUserId: input.actorUserId?.trim() || undefined,
    actorName: input.actorName.trim(),
    actorRole: input.actorRole,
    summary: input.summary.trim(),
    details: input.details.map((detail) => detail.trim()).filter(Boolean),
    createdAt: input.createdAt ?? new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO property_activity_logs
      (id, propertySlug, propertyId, listingRef, propertyTitle, actionType, actorUserId, actorName, actorRole, summary, details, createdAt)
    VALUES
      (@id, @propertySlug, @propertyId, @listingRef, @propertyTitle, @actionType, @actorUserId, @actorName, @actorRole, @summary, @details, @createdAt)
  `).run({
    ...activityLog,
    propertyId: activityLog.propertyId ?? null,
    listingRef: activityLog.listingRef ?? null,
    actorUserId: activityLog.actorUserId ?? null,
    details: JSON.stringify(activityLog.details),
  });

  return activityLog;
}

export function listPropertyActivityLogs(filter: { propertySlug?: string; limit?: number } = {}): PropertyActivityLog[] {
  const clauses: string[] = [];
  const values: string[] = [];

  if (filter.propertySlug?.trim()) {
    clauses.push("propertySlug = ?");
    values.push(filter.propertySlug.trim());
  }

  const limit = typeof filter.limit === "number"
    ? Math.max(1, Math.min(500, Math.floor(filter.limit)))
    : undefined;

  let query = "SELECT * FROM property_activity_logs";
  if (clauses.length > 0) {
    query += ` WHERE ${clauses.join(" AND ")}`;
  }
  query += " ORDER BY createdAt DESC";
  if (limit) {
    query += ` LIMIT ${limit}`;
  }

  return (db.prepare(query).all(...values) as Record<string, unknown>[]).map(rowToPropertyActivityLog);
}

export function listCities(): string[] {
  return Array.from(new Set(listProperties().map((property) => property.city))).sort((left, right) =>
    left.localeCompare(right, "tr"),
  );
}

export function listCountries(): string[] {
  return Array.from(new Set(listProperties().map((property) => property.country?.trim() || "Türkiye"))).sort(
    (left, right) => left.localeCompare(right, "tr"),
  );
}

export function listTypes(): string[] {
  return Array.from(new Set(listProperties().map((property) => property.type))).sort((left, right) =>
    left.localeCompare(right, "tr"),
  );
}

export function listRoomOptions(): string[] {
  return Array.from(new Set(listProperties().map((property) => property.rooms))).sort((left, right) =>
    left.localeCompare(right, "tr"),
  );
}

export function countPropertiesReferencingImagePath(imagePath: string): number {
  return listProperties({ includeInactive: true }).filter((property) =>
    property.coverImage === imagePath || property.galleryImages.includes(imagePath),
  ).length;
}

// ─── users ───────────────────────────────────────────────────────────────────

export function authenticateUser(identifier: string, password: string): SafeUser | null {
  if (isProductionRuntime() && isUnsafeDefaultAdminCredential(identifier, password)) {
    return null;
  }

  const normalized = identifier.toLocaleLowerCase("tr");
  const row = db.prepare(`
    SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?
  `).get(normalized, normalized) as Record<string, unknown> | undefined;

  if (!row) {
    return null;
  }

  const user = rowToUser(row);

  if (!verifyPassword(password, user.password)) {
    return null;
  }

  if (!isHashedPassword(user.password)) {
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(hashPassword(password), user.id);
  }

  return toSafeUser(user);
}

export function getUserById(userId: string): SafeUser | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as Record<string, unknown> | undefined;
  return row ? toSafeUser(rowToUser(row)) : null;
}

export function listUsers(): SafeUser[] {
  const roleOrder: Record<string, number> = {
    portal_admin: 0, admin: 1, portfolio_manager: 2, advisor: 2, editor: 3,
  };
  return (db.prepare("SELECT * FROM users").all() as Record<string, unknown>[])
    .map(rowToUser)
    .sort((a, b) => {
      const diff = (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, "tr");
    })
    .map(toSafeUser);
}

export function createUser(input: CreateUserInput): SafeUser {
  const name = input.name.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const phone = input.phone.trim();
  const password = input.password.trim();
  const role = input.role;
  const advisorId = input.advisorId?.trim() || undefined;

  if (!name || !email || !phone || !password || !role) throw new Error("Kullanıcı alanları eksik.");
  if (!["portal_admin", "admin", "portfolio_manager", "advisor", "editor"].includes(role)) throw new Error("Geçersiz kullanıcı rolü.");
  if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalıdır.");
  assertSafeProductionPassword(password, "Kullanıcı şifresi");

  const dup = db.prepare("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?").get(email, email);
  if (dup) throw new Error("Bu e-posta ile kayıtlı bir kullanıcı zaten var.");

  if (advisorId) {
    if (!getAdvisorById(advisorId)) throw new Error("Seçilen danışman bulunamadı.");
  }

  if (role === "advisor") {
    if (!advisorId) throw new Error("Danışman hesabı için bağlı danışman seçmelisiniz.");
    const linked = db.prepare("SELECT id FROM users WHERE role = 'advisor' AND advisorId = ?").get(advisorId);
    if (linked) throw new Error("Bu danışman için zaten bir panel hesabı bulunuyor.");
  }

  const user: User = {
    id: `usr-${crypto.randomUUID()}`,
    name, role: role as UserRole, email, phone,
    username: email, password: hashPassword(password), advisorId,
  };

  db.prepare(`
    INSERT INTO users (id, name, role, email, phone, username, password, advisorId)
    VALUES (@id, @name, @role, @email, @phone, @username, @password, @advisorId)
  `).run({ ...user, advisorId: user.advisorId ?? null });

  return toSafeUser(user);
}

export function deleteUserById(userId: string): SafeUser {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as Record<string, unknown> | undefined;
  if (!row) throw new Error("Kullanıcı bulunamadı.");
  const user = rowToUser(row);

  if (user.role === "portal_admin") {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'portal_admin'").get() as { c: number }).c;
    if (adminCount <= 1) throw new Error("Sistemde en az bir ana yönetici hesabı kalmalıdır.");
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  return toSafeUser(user);
}

// ─── leads ───────────────────────────────────────────────────────────────────

export function createLead(input: CreateLeadInput): ContactLead {
  const stage = input.stage ?? "new";
  if (!validLeadStages.includes(stage)) throw new Error("Geçersiz lead aşaması.");
  const priority = input.priority ?? "normal";
  if (!validLeadPriorities.includes(priority)) throw new Error("Geçersiz lead önceliği.");
  const now = new Date().toISOString();

  const lead: ContactLead = {
    ...input,
    source: input.source ?? "contact_form",
    stage,
    priority,
    id: `lead-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO leads
      (id, propertySlug, name, email, phone, message, stage, source,
       preferredDate, preferredTime, followUpDate, priority, appointmentNote, assignedAdvisorId, pipelineNote, createdAt, updatedAt)
    VALUES
      (@id, @propertySlug, @name, @email, @phone, @message, @stage, @source,
       @preferredDate, @preferredTime, @followUpDate, @priority, @appointmentNote, @assignedAdvisorId, @pipelineNote, @createdAt, @updatedAt)
  `).run({
    ...lead,
    preferredDate: lead.preferredDate ?? null,
    preferredTime: lead.preferredTime ?? null,
    followUpDate: lead.followUpDate ?? null,
    priority: lead.priority ?? "normal",
    appointmentNote: lead.appointmentNote ?? null,
    assignedAdvisorId: lead.assignedAdvisorId ?? null,
    pipelineNote: lead.pipelineNote ?? null,
  });

  return lead;
}

export function listLeads(): ContactLead[] {
  return (db.prepare("SELECT * FROM leads ORDER BY updatedAt DESC").all() as Record<string, unknown>[]).map(rowToLead);
}

export function getLeadById(leadId: string): ContactLead | undefined {
  const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId) as Record<string, unknown> | undefined;
  return row ? rowToLead(row) : undefined;
}

export function updateLeadStage(input: {
  leadId: string;
  stage: LeadStage;
  pipelineNote?: string;
  followUpDate?: string | null;
  priority?: LeadPriority;
  assignedAdvisorId?: string | null;
}): ContactLead {
  if (!validLeadStages.includes(input.stage)) throw new Error("Geçersiz lead aşaması.");
  if (input.priority && !validLeadPriorities.includes(input.priority)) throw new Error("Geçersiz lead önceliği.");
  const lead = getLeadById(input.leadId);
  if (!lead) throw new Error("Lead bulunamadı.");

  const updatedAt = new Date().toISOString();
  const pipelineNote = typeof input.pipelineNote === "string"
    ? (input.pipelineNote.trim() || null)
    : (lead.pipelineNote ?? null);
  const followUpDate = input.followUpDate !== undefined
    ? (typeof input.followUpDate === "string" ? (input.followUpDate.trim() || null) : null)
    : (lead.followUpDate ?? null);
  const priority = input.priority ?? lead.priority ?? "normal";
  const assignedAdvisorId = input.assignedAdvisorId !== undefined
    ? (typeof input.assignedAdvisorId === "string" ? (input.assignedAdvisorId.trim() || null) : null)
    : (lead.assignedAdvisorId ?? null);

  if (assignedAdvisorId && !getAdvisorById(assignedAdvisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  db.prepare(`
    UPDATE leads SET
      stage = @stage,
      pipelineNote = @pipelineNote,
      followUpDate = @followUpDate,
      priority = @priority,
      assignedAdvisorId = @assignedAdvisorId,
      updatedAt = @updatedAt
    WHERE id = @id
  `).run({
    stage: input.stage,
    pipelineNote,
    followUpDate,
    priority,
    assignedAdvisorId,
    updatedAt,
    id: input.leadId,
  });

  return {
    ...lead,
    stage: input.stage,
    pipelineNote: pipelineNote ?? undefined,
    followUpDate: followUpDate ?? undefined,
    priority,
    assignedAdvisorId: assignedAdvisorId ?? undefined,
    updatedAt,
  };
}

export function leadStageSummary() {
  const summary: Record<LeadStage, number> = {
    new: 0, called: 0, appointment_scheduled: 0, offer_submitted: 0, won: 0, lost: 0,
  };
  const rows = db.prepare("SELECT stage, COUNT(*) as c FROM leads GROUP BY stage").all() as { stage: string; c: number }[];
  for (const row of rows) {
    if (validLeadStages.includes(row.stage as LeadStage)) {
      summary[row.stage as LeadStage] = row.c;
    }
  }
  return summary;
}

// ─── seller leads ────────────────────────────────────────────────────────────

export function createSellerLead(input: CreateSellerLeadInput): SellerLead {
  const now = new Date().toISOString();
  const sellerLead: SellerLead = {
    ...input,
    neighborhood: input.neighborhood?.trim() || undefined,
    subType: input.subType?.trim() || undefined,
    rooms: input.rooms?.trim() || undefined,
    buildingAge: input.buildingAge?.trim() || undefined,
    floor: input.floor?.trim() || undefined,
    inCompound: input.inCompound?.trim() || undefined,
    preferredDateTime: input.preferredDateTime?.trim() || undefined,
    id: `seller-lead-${crypto.randomUUID()}`,
    createdAt: now,
  };

  db.prepare(`
    INSERT INTO seller_leads
      (id, name, email, phone, city, district, neighborhood, propertyType, subType,
       areaM2, rooms, buildingAge, floor, inCompound, preferredDateTime, message, createdAt)
    VALUES
      (@id, @name, @email, @phone, @city, @district, @neighborhood, @propertyType, @subType,
       @areaM2, @rooms, @buildingAge, @floor, @inCompound, @preferredDateTime, @message, @createdAt)
  `).run({
    ...sellerLead,
    neighborhood: sellerLead.neighborhood ?? null,
    subType: sellerLead.subType ?? null,
    areaM2: sellerLead.areaM2 ?? null,
    rooms: sellerLead.rooms ?? null,
    buildingAge: sellerLead.buildingAge ?? null,
    floor: sellerLead.floor ?? null,
    inCompound: sellerLead.inCompound ?? null,
    preferredDateTime: sellerLead.preferredDateTime ?? null,
  });

  return sellerLead;
}

export function listSellerLeads(): SellerLead[] {
  return (db.prepare("SELECT * FROM seller_leads ORDER BY createdAt DESC").all() as Record<string, unknown>[]).map(rowToSellerLead);
}

// ─── blog posts ──────────────────────────────────────────────────────────────

export function listBlogPosts(): BlogPost[] {
  return (db.prepare("SELECT * FROM blog_posts ORDER BY publishedAt DESC").all() as Record<string, unknown>[]).map(rowToBlogPost);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const row = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? rowToBlogPost(row) : undefined;
}

export function createBlogPost(input: CreateBlogPostInput): BlogPost {
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((t) => t.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }
  if (tags.length === 0) throw new Error("En az bir etiket girilmelidir.");

  const post: BlogPost = {
    id: `blog-${crypto.randomUUID()}`,
    slug: uniqueBlogSlug(createSlug(title)),
    title, excerpt, content, coverImage, authorName, tags,
    metaTitle, metaDescription,
    publishedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO blog_posts
      (id, slug, title, excerpt, content, coverImage, authorName, tags, metaTitle, metaDescription, publishedAt)
    VALUES
      (@id, @slug, @title, @excerpt, @content, @coverImage, @authorName, @tags, @metaTitle, @metaDescription, @publishedAt)
  `).run({ ...post, tags: JSON.stringify(post.tags) });

  return post;
}

export function updateBlogPostBySlug(slug: string, input: CreateBlogPostInput): BlogPost {
  const post = getBlogPostBySlug(slug);
  if (!post) throw new Error("Blog yazısı bulunamadı.");

  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((t) => t.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }
  if (tags.length === 0) throw new Error("En az bir etiket girilmelidir.");

  db.prepare(`
    UPDATE blog_posts SET title=@title, excerpt=@excerpt, content=@content,
      coverImage=@coverImage, authorName=@authorName, tags=@tags,
      metaTitle=@metaTitle, metaDescription=@metaDescription
    WHERE slug=@slug
  `).run({ title, excerpt, content, coverImage, authorName, tags: JSON.stringify(tags), metaTitle, metaDescription, slug });

  return { ...post, title, excerpt, content, coverImage, authorName, tags, metaTitle, metaDescription };
}

export function deleteBlogPostBySlug(slug: string): BlogPost {
  const post = getBlogPostBySlug(slug);
  if (!post) throw new Error("Blog yazısı bulunamadı.");
  db.prepare("DELETE FROM blog_posts WHERE slug = ?").run(slug);
  return post;
}

// ─── home location spotlights ───────────────────────────────────────────────

export function listHomeLocationSpotlights(options: { activeOnly?: boolean } = {}): HomeLocationSpotlight[] {
  const rows = db.prepare(`
    SELECT * FROM home_location_spotlights
    ${options.activeOnly ? "WHERE isActive = 1" : ""}
    ORDER BY sortOrder ASC, createdAt DESC
  `).all() as Record<string, unknown>[];

  return rows.map(rowToHomeLocationSpotlight);
}

export function getHomeLocationSpotlightById(spotlightId: string): HomeLocationSpotlight | undefined {
  const row = db.prepare("SELECT * FROM home_location_spotlights WHERE id = ?").get(spotlightId) as
    | Record<string, unknown>
    | undefined;

  return row ? rowToHomeLocationSpotlight(row) : undefined;
}

export function createHomeLocationSpotlight(input: CreateHomeLocationSpotlightInput): HomeLocationSpotlight {
  const title = input.title.trim();
  const subtitle = input.subtitle.trim();
  const badge = input.badge.trim();
  const blurb = input.blurb.trim();
  const href = input.href.trim();
  const image = input.image.trim();
  const statText = cleanOptionalText(input.statText);
  const priceAmount = input.priceAmount;

  if (!title || !subtitle || !badge || !blurb || !href || !image) {
    throw new Error("Popüler lokasyon alanları eksik.");
  }

  if (priceAmount !== undefined && (!Number.isFinite(priceAmount) || priceAmount <= 0)) {
    throw new Error("Başlangıç fiyatı geçerli bir sayı olmalıdır.");
  }

  const priceCurrency = priceAmount !== undefined ? input.priceCurrency ?? "TRY" : undefined;
  const layoutVariant = input.layoutVariant && validHomeLocationSpotlightLayouts.includes(input.layoutVariant)
    ? input.layoutVariant
    : "wide";
  const sortOrder = Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder ?? 0) : 0;
  const isActive = input.isActive ?? true;
  const translations = sanitizeHomeLocationSpotlightTranslations(input.translations);
  const now = new Date().toISOString();
  const spotlight: HomeLocationSpotlight = {
    id: `loc-${crypto.randomUUID()}`,
    slug: uniqueHomeLocationSpotlightSlug(createSlug(title)),
    title,
    subtitle,
    badge,
    blurb,
    statText,
    href,
    image,
    priceAmount,
    priceCurrency,
    layoutVariant,
    sortOrder,
    isActive,
    translations,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO home_location_spotlights
      (id, slug, title, subtitle, badge, blurb, statText, href, image, priceAmount, priceCurrency,
       layoutVariant, sortOrder, isActive, translations, createdAt, updatedAt)
    VALUES
      (@id, @slug, @title, @subtitle, @badge, @blurb, @statText, @href, @image, @priceAmount, @priceCurrency,
       @layoutVariant, @sortOrder, @isActive, @translations, @createdAt, @updatedAt)
  `).run({
    ...spotlight,
    statText: spotlight.statText ?? null,
    priceAmount: spotlight.priceAmount ?? null,
    priceCurrency: spotlight.priceCurrency ?? null,
    isActive: spotlight.isActive ? 1 : 0,
    translations: JSON.stringify(spotlight.translations ?? {}),
  });

  return spotlight;
}

export function updateHomeLocationSpotlightById(
  spotlightId: string,
  input: CreateHomeLocationSpotlightInput,
): HomeLocationSpotlight {
  const existing = getHomeLocationSpotlightById(spotlightId);

  if (!existing) {
    throw new Error("Popüler lokasyon kaydı bulunamadı.");
  }

  const title = input.title.trim();
  const subtitle = input.subtitle.trim();
  const badge = input.badge.trim();
  const blurb = input.blurb.trim();
  const href = input.href.trim();
  const image = input.image.trim();
  const statText = cleanOptionalText(input.statText);
  const priceAmount = input.priceAmount;

  if (!title || !subtitle || !badge || !blurb || !href || !image) {
    throw new Error("Popüler lokasyon alanları eksik.");
  }

  if (priceAmount !== undefined && (!Number.isFinite(priceAmount) || priceAmount <= 0)) {
    throw new Error("Başlangıç fiyatı geçerli bir sayı olmalıdır.");
  }

  const layoutVariant = input.layoutVariant && validHomeLocationSpotlightLayouts.includes(input.layoutVariant)
    ? input.layoutVariant
    : existing.layoutVariant;
  const sortOrder = Number.isFinite(input.sortOrder) ? Math.trunc(input.sortOrder ?? 0) : existing.sortOrder;
  const isActive = input.isActive ?? existing.isActive;
  const translations = sanitizeHomeLocationSpotlightTranslations(input.translations);
  const updated: HomeLocationSpotlight = {
    ...existing,
    title,
    subtitle,
    badge,
    blurb,
    statText,
    href,
    image,
    priceAmount,
    priceCurrency: priceAmount !== undefined ? input.priceCurrency ?? "TRY" : undefined,
    layoutVariant,
    sortOrder,
    isActive,
    translations,
    updatedAt: new Date().toISOString(),
  };

  db.prepare(`
    UPDATE home_location_spotlights
    SET title=@title,
        subtitle=@subtitle,
        badge=@badge,
        blurb=@blurb,
        statText=@statText,
        href=@href,
        image=@image,
        priceAmount=@priceAmount,
        priceCurrency=@priceCurrency,
        layoutVariant=@layoutVariant,
        sortOrder=@sortOrder,
        isActive=@isActive,
        translations=@translations,
        updatedAt=@updatedAt
    WHERE id=@id
  `).run({
    ...updated,
    statText: updated.statText ?? null,
    priceAmount: updated.priceAmount ?? null,
    priceCurrency: updated.priceCurrency ?? null,
    isActive: updated.isActive ? 1 : 0,
    translations: JSON.stringify(updated.translations ?? {}),
  });

  return updated;
}

export function deleteHomeLocationSpotlightById(spotlightId: string): HomeLocationSpotlight {
  const existing = getHomeLocationSpotlightById(spotlightId);

  if (!existing) {
    throw new Error("Popüler lokasyon kaydı bulunamadı.");
  }

  db.prepare("DELETE FROM home_location_spotlights WHERE id = ?").run(spotlightId);
  return existing;
}

// ─── dashboard ───────────────────────────────────────────────────────────────

export function dashboardSummary() {
  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const blogCount = (db.prepare("SELECT COUNT(*) as c FROM blog_posts").get() as { c: number }).c;
  const advisorCount = (db.prepare("SELECT COUNT(*) as c FROM advisors").get() as { c: number }).c;
  const leadCount = (db.prepare("SELECT COUNT(*) as c FROM leads").get() as { c: number }).c;
  const cityCount = (db.prepare("SELECT COUNT(DISTINCT city) as c FROM properties").get() as { c: number }).c;
  return { propertyCount: propCount, blogCount, advisorCount, leadCount, cityCount };
}
