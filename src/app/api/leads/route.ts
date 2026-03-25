import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canManageLeads } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { listLeads } from "@/lib/data-store";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!user.role || !canManageLeads(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  return NextResponse.json({ leads: listLeads() });
}
