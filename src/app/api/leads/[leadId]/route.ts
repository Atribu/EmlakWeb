import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canManageLeads, canViewLead } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { getLeadById, updateLeadStage } from "@/lib/data-store";
import type { LeadPriority, LeadStage } from "@/lib/types";

const validStages: LeadStage[] = [
  "new",
  "called",
  "appointment_scheduled",
  "offer_submitted",
  "won",
  "lost",
];

const validPriorities: LeadPriority[] = ["low", "normal", "high"];

function parseStage(value: unknown): LeadStage {
  if (typeof value !== "string") {
    throw new Error("Lead aşaması zorunludur.");
  }

  if (!validStages.includes(value as LeadStage)) {
    throw new Error("Geçersiz lead aşaması.");
  }

  return value as LeadStage;
}

function parsePriority(value: unknown): LeadPriority | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || !validPriorities.includes(value as LeadPriority)) {
    throw new Error("Geçersiz lead önceliği.");
  }

  return value as LeadPriority;
}

function parseOptionalDate(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Takip tarihi geçersiz.");
  }

  return value;
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
    const payload = (await request.json()) as {
      stage?: unknown;
      pipelineNote?: unknown;
      followUpDate?: unknown;
      priority?: unknown;
      assignedAdvisorId?: unknown;
    };

    const stage = parseStage(payload?.stage);
    const pipelineNote = typeof payload?.pipelineNote === "string" ? payload.pipelineNote : undefined;
    const followUpDate = parseOptionalDate(payload?.followUpDate);
    const priority = parsePriority(payload?.priority);
    const assignedAdvisorId =
      typeof payload?.assignedAdvisorId === "string" || payload?.assignedAdvisorId === null
        ? payload.assignedAdvisorId
        : undefined;

    if (
      assignedAdvisorId !== undefined &&
      user.role !== "portal_admin" &&
      user.role !== "admin"
    ) {
      return NextResponse.json({ message: "Lead ataması için yetkiniz yok." }, { status: 403 });
    }

    const lead = updateLeadStage({
      leadId,
      stage,
      pipelineNote,
      followUpDate,
      priority,
      assignedAdvisorId,
    });

    return NextResponse.json({ lead });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lead güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
