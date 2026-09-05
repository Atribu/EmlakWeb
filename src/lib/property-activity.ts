import { formatPrice, roleLabel } from "@/lib/format";
import { normalizePropertyPublicationStatus } from "@/lib/property-panel-options";
import type {
  CreatePropertyActivityLogInput,
  Property,
  PropertyActivityAction,
  SafeUser,
} from "@/lib/types";

type PropertyActivityActor = Pick<CreatePropertyActivityLogInput, "actorUserId" | "actorName" | "actorRole">;

type PropertyActivityOptions = {
  advisorName?: string;
  previousAdvisorName?: string;
  nextAdvisorName?: string;
};

function baseLogInput(
  property: Pick<Property, "slug" | "id" | "listingRef" | "title">,
  actionType: PropertyActivityAction,
  actor: PropertyActivityActor,
  summary: string,
  details: string[],
): CreatePropertyActivityLogInput {
  return {
    propertySlug: property.slug,
    propertyId: property.id,
    listingRef: property.listingRef,
    propertyTitle: property.title,
    actionType,
    actorUserId: actor.actorUserId,
    actorName: actor.actorName,
    actorRole: actor.actorRole,
    summary,
    details,
  };
}

function cleanText(value: string | undefined, fallback = "Belirtilmedi") {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

function formatPropertyPrice(property: Property) {
  const currency = property.priceCurrency ?? "TRY";
  const amount = property.priceSourceAmount ?? property.price;
  return formatPrice(amount, currency, {
    sourceCurrency: currency,
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
  });
}

function formatPropertyLocation(property: Property) {
  return [property.country?.trim() || "Türkiye", property.city, property.district, property.neighborhood]
    .filter(Boolean)
    .join(" / ");
}

function formatAdvisorName(value: string | undefined) {
  return cleanText(value, "Danışman yok");
}

function areStringArraysEqual(left: string[], right: string[]) {
  return JSON.stringify(left) === JSON.stringify(right);
}

function areObjectsEqual(left: unknown, right: unknown) {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function createPropertyActivityActor(user: Pick<SafeUser, "id" | "name" | "role"> | null | undefined): PropertyActivityActor {
  return {
    actorUserId: user?.id,
    actorName: cleanText(user?.name, "Sistem"),
    actorRole: user?.role ?? "system",
  };
}

export function propertyActivityActionLabel(actionType: PropertyActivityAction) {
  if (actionType === "created") return "Oluşturuldu";
  if (actionType === "updated") return "Güncellendi";
  if (actionType === "publication_status_changed") return "Durum";
  if (actionType === "advisor_changed") return "Danışman";
  if (actionType === "note_added") return "Not";
  if (actionType === "duplicated") return "Kopyalandı";
  if (actionType === "deleted") return "Silindi";
  return actionType;
}

export function propertyActivityActionBadgeClass(actionType: PropertyActivityAction) {
  if (actionType === "created") return "bg-emerald-100 text-emerald-800";
  if (actionType === "updated") return "bg-slate-100 text-slate-700";
  if (actionType === "publication_status_changed") return "bg-sky-100 text-sky-800";
  if (actionType === "advisor_changed") return "bg-cyan-100 text-cyan-800";
  if (actionType === "note_added") return "bg-amber-100 text-amber-800";
  if (actionType === "duplicated") return "bg-violet-100 text-violet-800";
  if (actionType === "deleted") return "bg-rose-100 text-rose-800";
  return "bg-slate-100 text-slate-700";
}

export function propertyActivityActorRoleLabel(role: string) {
  return roleLabel(role);
}

export function buildPropertyCreatedActivity(
  property: Property,
  actor: PropertyActivityActor,
  options: PropertyActivityOptions = {},
) {
  const details = [
    `Fiyat: ${formatPropertyPrice(property)}`,
    `Konum: ${formatPropertyLocation(property)}`,
    `Durum: ${normalizePropertyPublicationStatus(property.publicationStatus)}`,
    `Danışman: ${formatAdvisorName(options.advisorName)}`,
  ];

  if (property.developerCompany?.trim()) {
    details.push(`Firma: ${property.developerCompany.trim()}`);
  }

  return baseLogInput(property, "created", actor, "Yeni portföy oluşturuldu", details);
}

export function buildPropertyDuplicatedActivity(
  source: Property,
  property: Property,
  actor: PropertyActivityActor,
  options: PropertyActivityOptions = {},
) {
  const details = [
    `Kaynak: ${source.listingRef} - ${source.title}`,
    `Oda tipi: ${property.rooms}`,
    `Durum: ${normalizePropertyPublicationStatus(property.publicationStatus)}`,
    `Danışman: ${formatAdvisorName(options.advisorName)}`,
  ];

  return baseLogInput(property, "duplicated", actor, "Portföy kopyalanarak oluşturuldu", details);
}

export function buildPropertyDeletedActivity(
  property: Property,
  actor: PropertyActivityActor,
  options: PropertyActivityOptions = {},
) {
  const details = [
    `Son durum: ${normalizePropertyPublicationStatus(property.publicationStatus)}`,
    `Fiyat: ${formatPropertyPrice(property)}`,
    `Danışman: ${formatAdvisorName(options.advisorName)}`,
  ];

  if (property.developerCompany?.trim()) {
    details.push(`Firma: ${property.developerCompany.trim()}`);
  }

  return baseLogInput(property, "deleted", actor, "Portföy silindi", details);
}

export function buildPropertyStatusChangedActivity(
  previous: Property,
  next: Property,
  actor: PropertyActivityActor,
) {
  return baseLogInput(next, "publication_status_changed", actor, "Yayın durumu güncellendi", [
    `Eski durum: ${normalizePropertyPublicationStatus(previous.publicationStatus)}`,
    `Yeni durum: ${normalizePropertyPublicationStatus(next.publicationStatus)}`,
  ]);
}

export function buildPropertyAdvisorChangedActivity(
  previous: Property,
  next: Property,
  actor: PropertyActivityActor,
  options: PropertyActivityOptions = {},
) {
  return baseLogInput(next, "advisor_changed", actor, "Danışman ataması güncellendi", [
    `Eski danışman: ${formatAdvisorName(options.previousAdvisorName)}`,
    `Yeni danışman: ${formatAdvisorName(options.nextAdvisorName)}`,
  ]);
}

export function buildPropertyNoteAddedActivity(
  property: Property,
  actor: PropertyActivityActor,
  noteFieldLabel: string,
  notePreview: string,
) {
  return baseLogInput(property, "note_added", actor, "Portföye toplu not eklendi", [
    `Alan: ${noteFieldLabel}`,
    `Not: ${cleanText(notePreview, "-")}`,
  ]);
}

export function buildPropertyUpdatedActivity(
  previous: Property,
  next: Property,
  actor: PropertyActivityActor,
  options: PropertyActivityOptions = {},
) {
  const details: string[] = [];

  if (previous.title !== next.title) {
    details.push(`Başlık: "${previous.title}" -> "${next.title}"`);
  }

  if (
    previous.price !== next.price
    || previous.priceSourceAmount !== next.priceSourceAmount
    || previous.priceCurrency !== next.priceCurrency
  ) {
    details.push(`Fiyat: ${formatPropertyPrice(previous)} -> ${formatPropertyPrice(next)}`);
  }

  if (previous.rooms !== next.rooms) {
    details.push(`Oda tipi: ${previous.rooms} -> ${next.rooms}`);
  }

  if (previous.areaM2 !== next.areaM2) {
    details.push(`Metrekare: ${previous.areaM2} -> ${next.areaM2}`);
  }

  if (previous.floor !== next.floor) {
    details.push(`Kat bilgisi: ${cleanText(previous.floor, "-")} -> ${cleanText(next.floor, "-")}`);
  }

  if (previous.heating !== next.heating) {
    details.push(`Isıtma: ${previous.heating} -> ${next.heating}`);
  }

  if (previous.marketStatus !== next.marketStatus) {
    details.push(`Pazar tipi: ${cleanText(previous.marketStatus, "-")} -> ${cleanText(next.marketStatus, "-")}`);
  }

  if (previous.publicationStatus !== next.publicationStatus) {
    details.push(
      `Yayın durumu: ${normalizePropertyPublicationStatus(previous.publicationStatus)} -> ${normalizePropertyPublicationStatus(next.publicationStatus)}`,
    );
  }

  if (previous.advisorId !== next.advisorId) {
    details.push(
      `Danışman: ${formatAdvisorName(options.previousAdvisorName)} -> ${formatAdvisorName(options.nextAdvisorName)}`,
    );
  }

  if ((previous.developerCompany ?? "") !== (next.developerCompany ?? "")) {
    details.push(
      `Firma: ${cleanText(previous.developerCompany, "-")} -> ${cleanText(next.developerCompany, "-")}`,
    );
  }

  if (
    previous.country !== next.country
    || previous.city !== next.city
    || previous.district !== next.district
    || previous.neighborhood !== next.neighborhood
  ) {
    details.push(`Konum: ${formatPropertyLocation(previous)} -> ${formatPropertyLocation(next)}`);
  }

  if (previous.coverImage !== next.coverImage || !areStringArraysEqual(previous.galleryImages, next.galleryImages)) {
    details.push("Görseller güncellendi");
  }

  if (!areStringArraysEqual(previous.highlights, next.highlights) || !areStringArraysEqual(previous.features, next.features)) {
    details.push("Öne çıkanlar veya özellikler güncellendi");
  }

  if (!areObjectsEqual(previous.infoItems, next.infoItems)) {
    details.push("Iconlu bilgi alanları güncellendi");
  }

  if (previous.description !== next.description || !areObjectsEqual(previous.translations, next.translations)) {
    details.push("Açıklama ve çok dilli içerikler güncellendi");
  }

  if (
    previous.staffNotes !== next.staffNotes
    || previous.customerFeedbackNotes !== next.customerFeedbackNotes
    || previous.adminCommissionNotes !== next.adminCommissionNotes
    || previous.adminPrivateNotes !== next.adminPrivateNotes
  ) {
    details.push("İç operasyon notları güncellendi");
  }

  if (details.length === 0) {
    details.push("Form içeriği yeniden kaydedildi");
  }

  return baseLogInput(next, "updated", actor, "Portföy güncellendi", details);
}
