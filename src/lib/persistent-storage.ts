import path from "node:path";

const DEFAULT_DATA_DIR = path.join(process.cwd(), ".demo-data");
const DEFAULT_UPLOAD_DIR = path.join(DEFAULT_DATA_DIR, "uploads");

function resolveConfiguredPath(value: string | undefined, fallback: string): string {
  if (!value?.trim()) {
    return fallback;
  }

  const cleanedValue = value.trim();
  return path.isAbsolute(cleanedValue)
    ? cleanedValue
    : path.join(/*turbopackIgnore: true*/ process.cwd(), cleanedValue);
}

export function getDataDir(): string {
  return resolveConfiguredPath(process.env.EMLAK_DATA_DIR, DEFAULT_DATA_DIR);
}

export function getDatabasePath(): string {
  return resolveConfiguredPath(process.env.EMLAK_DB_PATH, path.join(getDataDir(), "emlak.db"));
}

export function getUploadDiskRoot(): string {
  return resolveConfiguredPath(process.env.EMLAK_UPLOAD_DIR, DEFAULT_UPLOAD_DIR);
}
