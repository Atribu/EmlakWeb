import {
  pbkdf2Sync,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

const HASH_PREFIX = "pbkdf2";
const HASH_ITERATIONS = 120_000;
const HASH_KEY_LENGTH = 64;
const HASH_DIGEST = "sha512";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST).toString("base64url");

  return [HASH_PREFIX, HASH_ITERATIONS, salt, hash].join("$");
}

export function isHashedPassword(value: string): boolean {
  return value.startsWith(`${HASH_PREFIX}$`);
}

export function verifyPassword(password: string, storedPassword: string): boolean {
  if (!isHashedPassword(storedPassword)) {
    return password === storedPassword;
  }

  const [, iterationsRaw, salt, expectedHash] = storedPassword.split("$");
  const iterations = Number(iterationsRaw);

  if (!Number.isInteger(iterations) || !salt || !expectedHash) {
    return false;
  }

  const actualHash = pbkdf2Sync(password, salt, iterations, HASH_KEY_LENGTH, HASH_DIGEST);
  const expectedHashBuffer = Buffer.from(expectedHash, "base64url");

  if (actualHash.length !== expectedHashBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualHash, expectedHashBuffer);
}
