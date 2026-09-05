import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios, canDeletePortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import {
  countPropertiesReferencingImagePath,
  createPropertyActivityLog,
  deletePropertiesBySlugs,
  getPropertyBySlugWithOptions,
  listAdvisors,
  updatePropertyNotesBySlugs,
  updatePropertiesOperationalBySlugs,
} from "@/lib/data-store";
import {
  buildPropertyAdvisorChangedActivity,
  buildPropertyDeletedActivity,
  buildPropertyNoteAddedActivity,
  buildPropertyStatusChangedActivity,
  createPropertyActivityActor,
} from "@/lib/property-activity";
import { deleteManagedPropertyImages } from "@/lib/property-image-storage";
import { PROPERTY_PUBLICATION_STATUS_OPTIONS } from "@/lib/property-panel-options";
import type { PropertyPublicationStatus } from "@/lib/types";

type BulkPropertyAction =
  | { action: "set_publication_status"; slugs: string[]; publicationStatus?: unknown }
  | { action: "set_advisor"; slugs: string[]; advisorId?: unknown }
  | { action: "append_note"; slugs: string[]; noteField?: unknown; noteText?: unknown }
  | { action: "delete"; slugs: string[] };

const validPublicationStatuses = [...PROPERTY_PUBLICATION_STATUS_OPTIONS] as PropertyPublicationStatus[];
const bulkNoteFieldMap = {
  staffNotes: "Çalışan Notu",
  customerFeedbackNotes: "Müşteri Geri Dönüşleri",
  adminCommissionNotes: "Komisyon / İç Finans Notu",
  adminPrivateNotes: "Yönetici Özel Notu",
} as const;

type BulkNoteField = keyof typeof bulkNoteFieldMap;

function buildPropertyResponse(property: {
  id: string;
  slug: string;
  listingRef: string;
  title: string;
  publicationStatus?: PropertyPublicationStatus;
  advisorId?: string;
  staffNotes?: string;
  customerFeedbackNotes?: string;
  adminCommissionNotes?: string;
  adminPrivateNotes?: string;
}) {
  return {
    id: property.id,
    slug: property.slug,
    listingRef: property.listingRef,
    title: property.title,
    publicationStatus: property.publicationStatus,
    advisorId: property.advisorId,
    staffNotes: property.staffNotes,
    customerFeedbackNotes: property.customerFeedbackNotes,
    adminCommissionNotes: property.adminCommissionNotes,
    adminPrivateNotes: property.adminPrivateNotes,
  };
}

function parseString(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseSlugs(value: unknown) {
  if (!Array.isArray(value)) {
    throw new Error("İşlem yapılacak portföyler seçilmedi.");
  }

  const slugs = Array.from(
    new Set(
      value
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean),
    ),
  );

  if (slugs.length === 0) {
    throw new Error("İşlem yapılacak portföyler seçilmedi.");
  }

  return slugs;
}

function parsePublicationStatus(value: unknown): PropertyPublicationStatus {
  const publicationStatus = parseString(value, "Yayın durumu") as PropertyPublicationStatus;

  if (!validPublicationStatuses.includes(publicationStatus)) {
    throw new Error("Yayın durumu geçersiz.");
  }

  return publicationStatus;
}

function parseBulkNoteField(value: unknown): BulkNoteField {
  const noteField = parseString(value, "Not alanı") as BulkNoteField;

  if (!(noteField in bulkNoteFieldMap)) {
    throw new Error("Not alanı geçersiz.");
  }

  return noteField;
}

function buildBulkNoteEntry(actorName: string, noteText: string) {
  const stamp = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Istanbul",
  }).format(new Date());

  return `${stamp} - ${actorName}: ${noteText.trim()}`;
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  try {
    const payload = (await request.json()) as BulkPropertyAction;
    const slugs = parseSlugs(payload.slugs);

    if (payload.action === "set_publication_status") {
      if (!user.role || !canDeletePortfolios(user.role)) {
        return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
      }

      const publicationStatus = parsePublicationStatus(payload.publicationStatus);
      const previousProperties = slugs
        .map((slug) => getPropertyBySlugWithOptions(slug, { includeInactive: true }))
        .filter((property) => property != null);
      const properties = updatePropertiesOperationalBySlugs(slugs, { publicationStatus });
      const previousMap = new Map(previousProperties.map((property) => [property.slug, property]));
      const actor = createPropertyActivityActor(user);

      properties.forEach((property) => {
        const previous = previousMap.get(property.slug);

        if (!previous || previous.publicationStatus === property.publicationStatus) {
          return;
        }

        createPropertyActivityLog(buildPropertyStatusChangedActivity(previous, property, actor));
      });

      return NextResponse.json({
        action: payload.action,
        count: properties.length,
        properties: properties.map((property) => buildPropertyResponse(property)),
      });
    }

    if (payload.action === "set_advisor") {
      if (!user.role || !canCreateOrEditPortfolios(user.role)) {
        return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
      }

      const advisorId = parseString(payload.advisorId, "Danışman");
      const previousProperties = slugs
        .map((slug) => getPropertyBySlugWithOptions(slug, { includeInactive: true }))
        .filter((property) => property != null);
      const properties = updatePropertiesOperationalBySlugs(slugs, { advisorId });
      const previousMap = new Map(previousProperties.map((property) => [property.slug, property]));
      const advisorMap = new Map(listAdvisors().map((advisor) => [advisor.id, advisor.name]));
      const actor = createPropertyActivityActor(user);

      properties.forEach((property) => {
        const previous = previousMap.get(property.slug);

        if (!previous || previous.advisorId === property.advisorId) {
          return;
        }

        createPropertyActivityLog(
          buildPropertyAdvisorChangedActivity(previous, property, actor, {
            previousAdvisorName: advisorMap.get(previous.advisorId),
            nextAdvisorName: advisorMap.get(property.advisorId),
          }),
        );
      });

      return NextResponse.json({
        action: payload.action,
        count: properties.length,
        properties: properties.map((property) => buildPropertyResponse(property)),
      });
    }

    if (payload.action === "append_note") {
      const noteField = parseBulkNoteField(payload.noteField);
      const noteText = parseString(payload.noteText, "Not metni");
      const adminOnlyField = noteField === "adminCommissionNotes" || noteField === "adminPrivateNotes";

      if (adminOnlyField) {
        if (!user.role || !canDeletePortfolios(user.role)) {
          return NextResponse.json({ message: "Bu not alanı için yetkiniz yok." }, { status: 403 });
        }
      } else if (!user.role || !canCreateOrEditPortfolios(user.role)) {
        return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
      }

      const previousProperties = slugs
        .map((slug) => getPropertyBySlugWithOptions(slug, { includeInactive: true }))
        .filter((property) => property != null);
      const actor = createPropertyActivityActor(user);
      const nextLine = buildBulkNoteEntry(user.name, noteText);
      const properties = updatePropertyNotesBySlugs(
        previousProperties.map((property) => {
          const previousValue = property[noteField];
          const nextValue = [previousValue?.trim(), nextLine].filter(Boolean).join("\n");

          return {
            slug: property.slug,
            [noteField]: nextValue,
          };
        }),
      );

      properties.forEach((property) => {
        createPropertyActivityLog(
          buildPropertyNoteAddedActivity(
            property,
            actor,
            bulkNoteFieldMap[noteField],
            noteText.length > 80 ? `${noteText.slice(0, 77)}...` : noteText,
          ),
        );
      });

      return NextResponse.json({
        action: payload.action,
        count: properties.length,
        noteField,
        properties: properties.map((property) => buildPropertyResponse(property)),
      });
    }

    if (payload.action === "delete") {
      if (!user.role || !canDeletePortfolios(user.role)) {
        return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
      }

      const removedProperties = deletePropertiesBySlugs(slugs);
      const advisorMap = new Map(listAdvisors().map((advisor) => [advisor.id, advisor.name]));
      const actor = createPropertyActivityActor(user);

      removedProperties.forEach((property) => {
        createPropertyActivityLog(
          buildPropertyDeletedActivity(property, actor, {
            advisorName: advisorMap.get(property.advisorId),
          }),
        );
      });

      const removableImages = Array.from(
        new Set(
          removedProperties.flatMap((property) => [property.coverImage, ...property.galleryImages]),
        ),
      ).filter((imagePath) => countPropertiesReferencingImagePath(imagePath) === 0);

      if (removableImages.length > 0) {
        await deleteManagedPropertyImages(removableImages);
      }

      return NextResponse.json({
        action: payload.action,
        count: removedProperties.length,
        properties: removedProperties.map((property) => ({
          id: property.id,
          slug: property.slug,
          listingRef: property.listingRef,
          title: property.title,
        })),
      });
    }

    return NextResponse.json({ message: "Geçersiz toplu işlem talebi." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Toplu işlem tamamlanamadı.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
