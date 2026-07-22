import { NextRequest, NextResponse } from "next/server";

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

function normalizeOrigin(value: string | null | undefined): string | null {
  if (!value?.trim()) {
    return null;
  }

  try {
    return new URL(value.trim()).origin;
  } catch {
    return null;
  }
}

function allowedOriginsForRequest(request: NextRequest): Set<string> {
  const origins = new Set<string>();
  const configuredOrigins = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    ...(process.env.EMLAK_ALLOWED_ORIGINS?.split(",") ?? []),
  ];

  for (const origin of configuredOrigins) {
    const normalized = normalizeOrigin(origin);
    if (normalized) {
      origins.add(normalized);
    }
  }

  origins.add(request.nextUrl.origin);

  const host = request.headers.get("host");
  const forwardedProto = request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
  if (host && forwardedProto) {
    origins.add(`${forwardedProto}://${host}`);
  }

  return origins;
}

export function middleware(request: NextRequest) {
  if (!MUTATING_METHODS.has(request.method)) {
    return NextResponse.next();
  }

  const requestOrigin = normalizeOrigin(request.headers.get("origin"));
  const allowedOrigins = allowedOriginsForRequest(request);

  if (!requestOrigin || !allowedOrigins.has(requestOrigin)) {
    return NextResponse.json({ message: "Güvenlik kontrolü başarısız oldu." }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
