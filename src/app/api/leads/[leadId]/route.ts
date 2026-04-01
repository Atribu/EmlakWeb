import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canManageLeads, canViewLead } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { getLeadById, updateLeadStage } from "@/lib/data-store";
import type { LeadStage } from "@/lib/types";

const validStages: LeadStage[] = [
  "new",
  "called",
  "appointment_scheduled",
  "offer_submitted",
  "won",
  "lost",
];

function parseStage(value: unknown): LeadStage {
  if (typeof value !== "string") {
    throw new Error("Lead aşaması zorunludur.");
  }

  if (!validStages.includes(value as LeadStage)) {
    throw new Error("Geçersiz lead aşaması.");
  }

  return value as LeadStage;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!user.role || !canManageLeads(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { leadId } = await params;
  const existing = getLeadById(leadId);

  if (!existing) {
    return NextResponse.json({ message: "Lead bulunamadı." }, { status: 404 });
  }

  if (!canViewLead(user, existing)) {
    return NextResponse.json({ message: "Bu lead kaydına erişim yetkiniz yok." }, { status: 403 });
  }

  try {
    const payload = (await request.json()) as { stage?: unknown; pipelineNote?: unknown };

    const stage = parseStage(payload?.stage);
    const pipelineNote = typeof payload?.pipelineNote === "string" ? payload.pipelineNote : undefined;

    const lead = updateLeadStage({
      leadId,
      stage,
      pipelineNote,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
