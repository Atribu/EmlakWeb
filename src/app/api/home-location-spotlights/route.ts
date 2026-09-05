import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canCreateOrEditPortfolios } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { createHomeLocationSpotlight, listHomeLocationSpotlights } from "@/lib/data-store";
import { parseHomeLocationSpotlightInput } from "@/lib/home-location-spotlight-input";

export async function GET() {
  return NextResponse.json({ spotlights: listHomeLocationSpotlights() });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canCreateOrEditPortfolios(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  try {
    const spotlight = createHomeLocationSpotlight(parseHomeLocationSpotlightInput(await request.json()));
    return NextResponse.json({ spotlight }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Popüler lokasyon kaydı oluşturulamadı.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
