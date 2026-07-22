import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";

import {
  assertSafeProductionPassword,
  checkRateLimit,
  isUnsafeDefaultAdminCredential,
  requireProductionSecret,
} from "@/lib/security";

function withNodeEnv(value: string, callback: () => void) {
  const previous = process.env.NODE_ENV;
  process.env.NODE_ENV = value;

  try {
    callback();
  } finally {
    if (previous === undefined) {
      delete process.env.NODE_ENV;
    } else {
      process.env.NODE_ENV = previous;
    }
  }
}

test("production secrets must be explicit and strong", () => {
  withNodeEnv("production", () => {
    assert.throws(() => requireProductionSecret(undefined, "TEST_SECRET"), /zorunludur/);
    assert.throws(() => requireProductionSecret("short", "TEST_SECRET"), /en az 32/);
    assert.equal(requireProductionSecret("x".repeat(40), "TEST_SECRET"), "x".repeat(40));
  });
});

test("production password policy rejects weak passwords", () => {
  withNodeEnv("production", () => {
    assert.throws(() => assertSafeProductionPassword("admin123", "Test şifresi"), /production/);
    assert.doesNotThrow(() => assertSafeProductionPassword("Rodina-Strong-123!", "Test şifresi"));
  });
});

test("unsafe default admin credentials are recognized", () => {
  assert.equal(isUnsafeDefaultAdminCredential("admin@admin", "admin"), true);
  assert.equal(isUnsafeDefaultAdminCredential("ADMIN@ADMIN", "admin"), true);
  assert.equal(isUnsafeDefaultAdminCredential("admin@admin", "Rodina-Strong-123!"), false);
});

test("rate limit blocks after the configured attempt count", () => {
  const key = `test:${randomUUID()}`;
  const options = { windowMs: 60_000, maxAttempts: 2 };

  assert.equal(checkRateLimit(key, options).limited, false);
  assert.equal(checkRateLimit(key, options).limited, false);
  assert.equal(checkRateLimit(key, options).limited, true);
});
