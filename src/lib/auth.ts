import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";

import { getUserById } from "@/lib/data-store";
import type { SafeUser } from "@/lib/types";

export const SESSION_COOKIE = "emlak_demo_session";
export const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionPayload = {
  userId: string;
  expiresAt: number;
};

function getSessionSecret() {
  return process.env.EMLAK_SESSION_SECRET || process.env.AUTH_SECRET || "emlak-local-development-session-secret";
}

function encodePayload(payload: SessionPayload): string {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSessionSecret()).update(encodedPayload).digest("base64url");
}

function verifySignature(encodedPayload: string, signature: string): boolean {
  const expectedSignature = signPayload(encodedPayload);
  const actual = Buffer.from(signature, "base64url");
  const expected = Buffer.from(expectedSignature, "base64url");

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function decodePayload(value: string): SessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf-8")) as SessionPayload;
    if (!parsed?.userId || typeof parsed.expiresAt !== "number") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function createSessionCookieValue(userId: string): string {
  const encodedPayload = encodePayload({
    userId,
    expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000,
  });
  const signature = signPayload(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function userFromSessionValue(value: string | undefined): SafeUser | null {
  if (!value) {
    return null;
  }

  const [encodedPayload, signature] = value.split(".");

  if (!encodedPayload || !signature || !verifySignature(encodedPayload, signature)) {
    return null;
  }

  const payload = decodePayload(encodedPayload);
  if (!payload) {
    return null;
  }

  if (payload.expiresAt <= Date.now()) {
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
