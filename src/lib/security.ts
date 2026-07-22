const DEFAULT_SESSION_SECRET = "emlak-local-development-session-secret";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  windowMs: number;
  maxAttempts: number;
};

type RateLimitResult = {
  limited: boolean;
  retryAfterSeconds: number;
};

const rateLimitBuckets = new Map<string, RateLimitBucket>();

export function isProductionRuntime(): boolean {
  return process.env.NODE_ENV === "production";
}

export function requireProductionSecret(
  value: string | undefined,
  envName: string,
  fallback: string = DEFAULT_SESSION_SECRET,
  minLength = 32,
): string {
  const secret = value?.trim();

  if (!isProductionRuntime()) {
    return secret || fallback;
  }

  if (!secret) {
    throw new Error(`${envName} production ortamında zorunludur.`);
  }

  if (secret.length < minLength) {
    throw new Error(`${envName} en az ${minLength} karakter olmalıdır.`);
  }

  if (secret === fallback) {
    throw new Error(`${envName} production ortamında varsayılan değer olamaz.`);
  }

  return secret;
}

export function assertSafeProductionPassword(password: string, label = "Şifre") {
  if (!isProductionRuntime()) {
    return;
  }

  const hasEnoughLength = password.length >= 12;
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSymbol = /[^A-Za-z0-9]/.test(password);

  if (!hasEnoughLength || !hasLower || !hasUpper || !hasNumber || !hasSymbol) {
    throw new Error(`${label} production için en az 12 karakter, büyük/küçük harf, rakam ve sembol içermelidir.`);
  }
}

export function isUnsafeDefaultAdminCredential(identifier: string, password: string): boolean {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  return normalizedIdentifier === "admin@admin" && password.trim() === "admin";
}

export function getClientIpFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    headers.get("cf-connecting-ip")?.trim() ||
    headers.get("x-real-ip")?.trim() ||
    forwardedFor ||
    "local"
  );
}

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);

  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + options.windowMs,
    });

    return { limited: false, retryAfterSeconds: Math.ceil(options.windowMs / 1000) };
  }

  if (current.count >= options.maxAttempts) {
    return {
      limited: true,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  rateLimitBuckets.set(key, current);

  return {
    limited: false,
    retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
  };
}

export function clearRateLimit(key: string) {
  rateLimitBuckets.delete(key);
}
