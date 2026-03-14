import { NextResponse } from "next/server";

import {
  createSessionCookieValue,
  SESSION_COOKIE,
  SESSION_TTL_SECONDS,
} from "@/lib/auth";
import { authenticateUser } from "@/lib/data-store";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as
    | { username?: unknown; password?: unknown }
    | null;

  const username = typeof payload?.username === "string" ? payload.username.trim() : "";
  const password = typeof payload?.password === "string" ? payload.password.trim() : "";

  if (!username || !password) {
    return NextResponse.json({ message: "Kullanıcı adı ve şifre zorunludur." }, { status: 400 });
  }

  const user = authenticateUser(username, password);

  if (!user) {
    return NextResponse.json({ message: "Kullanıcı adı veya şifre hatalı." }, { status: 401 });
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
