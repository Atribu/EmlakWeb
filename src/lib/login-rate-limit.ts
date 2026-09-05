const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 8;

type LoginAttempt = {
  count: number;
  resetAt: number;
};

const attempts = new Map<string, LoginAttempt>();

function now() {
  return Date.now();
}

export function isLoginRateLimited(key: string): boolean {
  const attempt = attempts.get(key);

  if (!attempt) {
    return false;
  }

  if (attempt.resetAt <= now()) {
    attempts.delete(key);
    return false;
  }

  return attempt.count >= MAX_ATTEMPTS;
}

export function recordFailedLoginAttempt(key: string) {
  const currentTime = now();
  const attempt = attempts.get(key);

  if (!attempt || attempt.resetAt <= currentTime) {
    attempts.set(key, { count: 1, resetAt: currentTime + WINDOW_MS });
    return;
  }

  attempts.set(key, {
    ...attempt,
    count: attempt.count + 1,
  });
}

export function clearLoginRateLimit(key: string) {
  attempts.delete(key);
}
