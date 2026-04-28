import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { createProperty, getPropertyBySlugWithOptions } from "@/lib/data-store";

function parseRoomSelections(value: unknown): string[] {
  if (!Array.isArray(value)) {
    throw new Error("Kopyalanacak oda tiplerini seçin.");
  }

  const output = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (output.length === 0) {
    throw new Error("Kopyalanacak oda tiplerini seçin.");
  }

  return Array.from(new Set(output));
}

function resolveVariantTitle(baseTitle: string, sourceRoom: string, nextRoom: string): string {
  const normalizedTitle = baseTitle.trim();

  if (sourceRoom && normalizedTitle.includes(sourceRoom)) {
    return normalizedTitle.replace(sourceRoom, nextRoom);
  }

  if (normalizedTitle.endsWith(`- ${nextRoom}`) || normalizedTitle.endsWith(nextRoom)) {
    return normalizedTitle;
  }

  return `${normalizedTitle} - ${nextRoom}`;
}

export async function POST(
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
  const source = getPropertyBySlugWithOptions(slug, { includeInactive: true });

  if (!source) {
    return NextResponse.json({ message: "Portföy bulunamadı." }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const roomSelections = parseRoomSelections(payload.roomSelections)
      .filter((room) => room !== source.rooms);

    if (roomSelections.length === 0) {
      throw new Error("Mevcut oda tipinden farklı en az bir varyant seçin.");
    }

    const properties = roomSelections.map((room) =>
      createProperty({
        ...source,
        title: resolveVariantTitle(source.title, source.rooms, room),
        rooms: room,
        publicationStatus: "Pasif",
      }, user.id),
    );

    return NextResponse.json({ properties, count: properties.length }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Portföy kopyalanamadı.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
