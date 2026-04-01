import { NextResponse } from "next/server";

import {
  createSessionCookieValue,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { authenticateUser } from "@/lib/data-store";
import { readSitePreferencesFromCookieHeader } from "@/lib/site-preferences";

export async function POST(request: Request) {
  const language = readSitePreferencesFromCookieHeader(request.headers.get("cookie")).language;
  const copy =
    language === "EN"
      ? {
          missing: "Email and password are required.",
          invalid: "Email or password is incorrect.",
        }
      : language === "RU"
        ? {
            missing: "Электронная почта и пароль обязательны.",
            invalid: "Неверный email или пароль.",
          }
        : language === "AR"
          ? {
              missing: "البريد الإلكتروني وكلمة المرور مطلوبان.",
              invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
            }
          : {
              missing: "E-posta ve şifre zorunludur.",
              invalid: "E-posta veya şifre hatalı.",
            };

  const payload = (await request.json().catch(() => null)) as
    | { identifier?: unknown; username?: unknown; password?: unknown }
    | null;

  const identifier =
    typeof payload?.identifier === "string"
      ? payload.identifier.trim()
      : typeof payload?.username === "string"
        ? payload.username.trim()
        : "";
  const password = typeof payload?.password === "string" ? payload.password.trim() : "";

  if (!identifier || !password) {
    return NextResponse.json({ message: copy.missing }, { status: 400 });
  }

  const user = authenticateUser(identifier, password);

  if (!user) {
    return NextResponse.json({ message: copy.invalid }, { status: 401 });
  }

  const response = NextResponse.json({ user });
  response.cookies.set({
    name: SESSION_COOKIE,
    value: createSessionCookieValue(user.id),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });

  return response;
}
