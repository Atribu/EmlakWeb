import { NextResponse } from "next/server";

import { SESSION_COOKIE } from "@/lib/auth";

function clearSession(request: Request) {
  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    path: "/",
    maxAge: 0,
  });
  return response;
}

export async function POST(request: Request) {
  return clearSession(request);
}

export async function GET(request: Request) {
  return clearSession(request);
}
