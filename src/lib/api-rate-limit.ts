import { NextResponse } from "next/server";

import { checkRateLimit, getClientIpFromHeaders } from "@/lib/security";

const PUBLIC_FORM_WINDOW_MS = 10 * 60 * 1000;
const PUBLIC_FORM_MAX_ATTEMPTS = 12;

export function publicFormRateLimitResponse(request: Request, formKey: string): NextResponse | null {
  const clientIp = getClientIpFromHeaders(request.headers);
  const result = checkRateLimit(`public-form:${formKey}:${clientIp}`, {
    windowMs: PUBLIC_FORM_WINDOW_MS,
    maxAttempts: PUBLIC_FORM_MAX_ATTEMPTS,
  });

  if (!result.limited) {
    return null;
  }

  return NextResponse.json(
    { message: "Çok fazla form gönderimi yapıldı. Lütfen biraz sonra tekrar deneyin." },
    {
      status: 429,
      headers: {
        "Retry-After": String(result.retryAfterSeconds),
      },
    },
  );
}
