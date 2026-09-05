import { NextResponse } from "next/server";

import { LEGACY_SESSION_COOKIE, SESSION_COOKIE } from "@/lib/auth";

function clearSession(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  for (const cookieName of [SESSION_COOKIE, LEGACY_SESSION_COOKIE]) {
    response.cookies.set({
      name: cookieName,
      value: "",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
    });
  }
  return response;
}

export async function POST(request: Request) {
  return clearSession(request);
}
