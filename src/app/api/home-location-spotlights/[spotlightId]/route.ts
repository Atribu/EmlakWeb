import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import {
  deleteHomeLocationSpotlightById,
  getHomeLocationSpotlightById,
  updateHomeLocationSpotlightById,
} from "@/lib/data-store";
import { parseHomeLocationSpotlightInput } from "@/lib/home-location-spotlight-input";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ spotlightId: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canCreateOrEditPortfolios(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { spotlightId } = await params;
  const existing = getHomeLocationSpotlightById(spotlightId);

  if (!existing) {
    return NextResponse.json({ message: "Popüler lokasyon kaydı bulunamadı." }, { status: 404 });
  }

  try {
    const spotlight = updateHomeLocationSpotlightById(
      spotlightId,
      parseHomeLocationSpotlightInput(await request.json()),
    );
    return NextResponse.json({ spotlight });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Popüler lokasyon kaydı güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ spotlightId: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canCreateOrEditPortfolios(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { spotlightId } = await params;
  const existing = getHomeLocationSpotlightById(spotlightId);

  if (!existing) {
    return NextResponse.json({ message: "Popüler lokasyon kaydı bulunamadı." }, { status: 404 });
  }

  try {
    const spotlight = deleteHomeLocationSpotlightById(spotlightId);
    return NextResponse.json({
      spotlight: {
        id: spotlight.id,
        slug: spotlight.slug,
        title: spotlight.title,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Popüler lokasyon kaydı silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
