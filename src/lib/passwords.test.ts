import assert from "node:assert/strict";
import test from "node:test";

import { hashPassword, isHashedPassword, verifyPassword } from "@/lib/passwords";

test("hashPassword stores passwords in a verifiable non-plain format", () => {
  const password = "admin1234";
  const hashedPassword = hashPassword(password);

  assert.equal(isHashedPassword(hashedPassword), true);
  assert.notEqual(hashedPassword, password);
  assert.equal(verifyPassword(password, hashedPassword), true);
  assert.equal(verifyPassword("wrong-password", hashedPassword), false);
});

test("verifyPassword keeps legacy plain-text passwords compatible during migration", () => {
  assert.equal(verifyPassword("admin", "admin"), true);
  assert.equal(verifyPassword("wrong", "admin"), false);
});
