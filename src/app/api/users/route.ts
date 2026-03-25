import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import {
  assignableUserRoles,
  canAssignUserRole,
  canManageUsers,
  filterUsersForActor,
} from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { createUser, listUsers } from "@/lib/data-store";
import type { CreateUserInput, UserRole } from "@/lib/types";

function parseString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseRole(value: unknown): UserRole {
  if (typeof value !== "string") {
    throw new Error("Kullanıcı rolü zorunludur.");
  }

  if (!["portal_admin", "admin", "portfolio_manager", "advisor", "editor"].includes(value)) {
    throw new Error("Geçersiz kullanıcı rolü.");
  }

  return value as UserRole;
}

function parseInput(payload: unknown): CreateUserInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const body = payload as Record<string, unknown>;

  return {
    name: parseString(body.name, "Ad Soyad"),
    email: parseString(body.email, "E-posta"),
    phone: parseString(body.phone, "Telefon"),
    password: parseString(body.password, "Şifre"),
    role: parseRole(body.role),
    advisorId: typeof body.advisorId === "string" ? body.advisorId.trim() || undefined : undefined,
  };
}

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canManageUsers(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const users = filterUsersForActor(user, listUsers());

  return NextResponse.json({
    users,
    assignableRoles: assignableUserRoles(user.role),
  });
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canManageUsers(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  try {
    const payload = await request.json();
    const input = parseInput(payload);

    if (!canAssignUserRole(user.role, input.role)) {
      return NextResponse.json({ message: "Bu rolü atama yetkiniz yok." }, { status: 403 });
    }

    const createdUser = createUser(input);
    return NextResponse.json({ user: createdUser }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Kullanıcı oluşturulamadı.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
