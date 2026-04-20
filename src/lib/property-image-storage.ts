import fs from "node:fs/promises";
import path from "node:path";

import { validatePortfolioImageFile } from "@/lib/portfolio-images";
import { UPLOAD_DISK_ROOT, UPLOAD_PUBLIC_PREFIX } from "@/lib/upload-config";

const uploadPublicRoot = `${UPLOAD_PUBLIC_PREFIX}/properties`;
const uploadDiskRoot = path.join(UPLOAD_DISK_ROOT, "properties");

const charMap: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

function normalizeSegment(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ç|ğ|ı|ö|ş|ü/g, (char) => charMap[char[0]] ?? char[0])
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function safeSegment(value: string, fallback: string): string {
  return normalizeSegment(value) || fallback;
}

function normalizeFileName(value: string): string {
  const stripped = value.replace(/\.webp$/i, "");
  return `${safeSegment(stripped, "gorsel")}.webp`;
}

async function convertImageToWebp(file: File, fieldLabel: string): Promise<Buffer> {
  validatePortfolioImageFile(file, fieldLabel);

  try {
    const sharp = (await import("sharp")).default;
    const source = Buffer.from(await file.arrayBuffer());

    return await sharp(source)
      .rotate()
      .webp({ quality: 82 })
      .toBuffer();
  } catch (error) {
    console.error("[property-image-convert-error]", error);
    throw new Error(`${fieldLabel} işlenemedi. Lütfen farklı bir jpg, png veya webp dosyası deneyin.`);
  }
}

async function ensurePropertyUploadDirectory(storageKey: string) {
  const safeStorageKey = safeSegment(storageKey, "portfoy");
  const directory = path.join(uploadDiskRoot, safeStorageKey);
  await fs.mkdir(directory, { recursive: true });
  return { directory, safeStorageKey };
}

function publicPathToDiskPath(publicPath: string): string | null {
  if (!isManagedPropertyImagePath(publicPath)) {
    return null;
  }

  return path.join(UPLOAD_DISK_ROOT, publicPath.slice(`${UPLOAD_PUBLIC_PREFIX}/`.length));
}

export function createPropertyImageStorageKey(seed: string): string {
  return `${safeSegment(seed, "portfoy")}-${crypto.randomUUID().slice(0, 8)}`;
}

export function buildRoomImageFileName(roomLabel: string, index: number, total: number): string {
  const baseName = safeSegment(roomLabel, "oda");
  if (total <= 1) {
    return `${baseName}.webp`;
  }

  return `${baseName}-${index + 1}.webp`;
}

export function buildGalleryImageFileName(index: number): string {
  return `gallery-${index + 1}.webp`;
}

export async function savePropertyImageFile(
  file: File,
  options: { storageKey: string; fileName: string; fieldLabel: string },
): Promise<string> {
  const { directory, safeStorageKey } = await ensurePropertyUploadDirectory(options.storageKey);
  const safeFileName = normalizeFileName(options.fileName);
  const diskPath = path.join(directory, safeFileName);
  const buffer = await convertImageToWebp(file, options.fieldLabel);

  await fs.writeFile(diskPath, buffer);

  return `${uploadPublicRoot}/${safeStorageKey}/${safeFileName}`;
}

export function isManagedPropertyImagePath(imagePath: string): boolean {
  return imagePath.startsWith(`${uploadPublicRoot}/`);
}

export function getPropertyStorageKeyFromImagePath(imagePath: string): string | null {
  if (!isManagedPropertyImagePath(imagePath)) {
    return null;
  }

  const relative = imagePath.slice(`${uploadPublicRoot}/`.length);
  const [storageKey] = relative.split("/");

  return storageKey || null;
}

export function resolvePropertyStorageKey(imagePaths: string[], fallbackSeed: string): string {
  const existingStorageKey = imagePaths
    .map((imagePath) => getPropertyStorageKeyFromImagePath(imagePath))
    .find((value): value is string => Boolean(value));

  return existingStorageKey ?? createPropertyImageStorageKey(fallbackSeed);
}

export async function deleteManagedPropertyImages(imagePaths: string[]) {
  const uniqueDiskPaths = Array.from(
    new Set(
      imagePaths
        .map((imagePath) => publicPathToDiskPath(imagePath))
        .filter((diskPath): diskPath is string => Boolean(diskPath)),
    ),
  );

  await Promise.all(
    uniqueDiskPaths.map(async (diskPath) => {
      try {
        await fs.unlink(diskPath);
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
          console.error("[property-image-delete-error]", error);
        }
      }
    }),
  );
}
