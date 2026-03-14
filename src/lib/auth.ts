import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

import { getUserById } from "@/lib/data-store";
import type { SafeUser } from "@/lib/types";

export const SESSION_COOKIE = "emlak_demo_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  userId: string;
};

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as SessionPayload;
    if (!parsed?.userId) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookieValue(userId: string): string {
  return encodePayload({ userId });
}

export function userFromSessionValue(value: string | undefined): SafeUser | null {
  if (!value) {
    return null;
  }

  const payload = decodePayload(value);
  if (!payload) {
    return null;
  }

  return getUserById(payload.userId);
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(SESSION_COOKIE)?.value;
  return userFromSessionValue(value);
}

export function getUserFromRequest(request: NextRequest): SafeUser | null {
  return userFromSessionValue(request.cookies.get(SESSION_COOKIE)?.value);
}
