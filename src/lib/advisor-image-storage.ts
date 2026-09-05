import fs from "node:fs/promises";
import path from "node:path";

import { validateWebpFile } from "@/lib/portfolio-images";
import { UPLOAD_DISK_ROOT, UPLOAD_PUBLIC_PREFIX } from "@/lib/upload-config";

const uploadPublicRoot = `${UPLOAD_PUBLIC_PREFIX}/advisors`;
const uploadDiskRoot = path.join(UPLOAD_DISK_ROOT, "advisors");
const MAX_ADVISOR_IMAGE_PIXELS = 20_000_000;

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

async function ensureAdvisorUploadDirectory(storageKey: string) {
  const safeStorageKey = safeSegment(storageKey, "danisman");
  const directory = path.join(uploadDiskRoot, safeStorageKey);
  await fs.mkdir(directory, { recursive: true });
  return { directory, safeStorageKey };
}

function publicPathToDiskPath(publicPath: string): string | null {
  if (!isManagedAdvisorImagePath(publicPath)) {
    return null;
  }

  return path.join(UPLOAD_DISK_ROOT, publicPath.slice(`${UPLOAD_PUBLIC_PREFIX}/`.length));
}

export function createAdvisorImageStorageKey(seed: string): string {
  return `${safeSegment(seed, "danisman")}-${crypto.randomUUID().slice(0, 8)}`;
}

export function getAdvisorStorageKeyFromImagePath(imagePath: string): string | null {
  if (!isManagedAdvisorImagePath(imagePath)) {
    return null;
  }

  const relative = imagePath.slice(`${uploadPublicRoot}/`.length);
  const [storageKey] = relative.split("/");

  return storageKey || null;
}

export function resolveAdvisorStorageKey(imagePath: string | undefined, fallbackSeed: string): string {
  if (typeof imagePath === "string") {
    const storageKey = getAdvisorStorageKeyFromImagePath(imagePath);
    if (storageKey) {
      return storageKey;
    }
  }

  return createAdvisorImageStorageKey(fallbackSeed);
}

export async function saveAdvisorImageFile(
  file: File,
  options: { storageKey: string; fieldLabel: string },
): Promise<string> {
  const { directory, safeStorageKey } = await ensureAdvisorUploadDirectory(options.storageKey);
  const diskPath = path.join(directory, "portrait.webp");
  const buffer = await normalizeAdvisorImageToWebp(file, options.fieldLabel);

  await fs.writeFile(diskPath, buffer);

  return `${uploadPublicRoot}/${safeStorageKey}/portrait.webp`;
}

async function normalizeAdvisorImageToWebp(file: File, fieldLabel: string): Promise<Buffer> {
  validateWebpFile(file, fieldLabel);

  try {
    const sharp = (await import("sharp")).default;
    const source = Buffer.from(await file.arrayBuffer());

    return await sharp(source, { limitInputPixels: MAX_ADVISOR_IMAGE_PIXELS })
      .rotate()
      .resize({
        width: 1200,
        height: 1200,
        fit: "cover",
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
  } catch (error) {
    console.error("[advisor-image-convert-error]", error);
    throw new Error(`${fieldLabel} işlenemedi. Lütfen geçerli bir webp dosyası deneyin.`);
  }
}

export function isManagedAdvisorImagePath(imagePath: string): boolean {
  return imagePath.startsWith(`${uploadPublicRoot}/`);
}

export async function deleteManagedAdvisorImage(imagePath: string) {
  const diskPath = publicPathToDiskPath(imagePath);

  if (!diskPath) {
    return;
  }

  try {
    await fs.unlink(diskPath);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.error("[advisor-image-delete-error]", error);
    }
  }
}
