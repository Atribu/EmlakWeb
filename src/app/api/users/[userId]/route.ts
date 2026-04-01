import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canDeleteManagedUser, canManageUsers, canViewManagedUser } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { deleteUserById, getUserById } from "@/lib/data-store";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  const actor = getUserFromRequest(request);

  if (!actor) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canManageUsers(actor.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { userId } = await params;
  const target = getUserById(userId);

  if (!target || !canViewManagedUser(actor, target)) {
    return NextResponse.json({ message: "Kullanıcı bulunamadı." }, { status: 404 });
  }

  if (!canDeleteManagedUser(actor, target)) {
    return NextResponse.json({ message: "Bu kullanıcıyı silme yetkiniz yok." }, { status: 403 });
  }

  try {
    const removed = deleteUserById(userId);
    return NextResponse.json({ user: removed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kullanıcı silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
