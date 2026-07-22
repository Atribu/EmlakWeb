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

function escapeSvgText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildCenteredWatermarkSvg(width: number, height: number): Buffer {
  const watermarkText = process.env.EMLAK_WATERMARK_TEXT?.trim() || "RODINA Invest Co.";
  const subText = process.env.EMLAK_WATERMARK_SUBTEXT?.trim() || "RODINA INVEST";
  const safeWatermarkText = escapeSvgText(watermarkText);
  const safeSubText = escapeSvgText(subText);
  const shortestSide = Math.max(1, Math.min(width, height));
  const logoSize = Math.max(54, Math.min(118, Math.round(shortestSide * 0.12)));
  const titleSize = Math.max(30, Math.min(82, Math.round(width * 0.055)));
  const subTitleSize = Math.max(10, Math.min(22, Math.round(titleSize * 0.27)));
  const contentWidth = Math.min(width * 0.74, titleSize * Math.max(watermarkText.length * 0.62, 9));
  const boxWidth = Math.max(260, Math.min(width * 0.82, contentWidth + logoSize + 86));
  const boxHeight = Math.max(110, logoSize + 42);
  const centerX = width / 2;
  const centerY = height / 2;
  const boxX = centerX - boxWidth / 2;
  const boxY = centerY - boxHeight / 2;
  const logoX = boxX + 30;
  const logoY = centerY - logoSize / 2;
  const textX = logoX + logoSize + 28;
  const titleY = centerY - subTitleSize * 0.12;
  const subTitleY = titleY + titleSize * 0.5;

  return Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="watermark-shadow" x="-20%" y="-30%" width="140%" height="160%">
          <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#020617" flood-opacity="0.22"/>
        </filter>
      </defs>
      <g opacity="0.48" filter="url(#watermark-shadow)">
        <rect x="${boxX}" y="${boxY}" width="${boxWidth}" height="${boxHeight}" rx="${boxHeight / 2}" fill="#ffffff" fill-opacity="0.42" stroke="#ffffff" stroke-opacity="0.55" stroke-width="2"/>
        <rect x="${logoX}" y="${logoY}" width="${logoSize}" height="${logoSize}" rx="${logoSize * 0.24}" fill="#0f172a" fill-opacity="0.72"/>
        <text x="${logoX + logoSize / 2}" y="${logoY + logoSize * 0.66}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${logoSize * 0.42}" font-weight="800" fill="#ffffff">PS</text>
        <text x="${textX}" y="${titleY}" font-family="Arial, Helvetica, sans-serif" font-size="${titleSize}" font-weight="800" letter-spacing="-1.5" fill="#ffffff" stroke="#0f172a" stroke-opacity="0.46" stroke-width="2.2" paint-order="stroke">${safeWatermarkText}</text>
        <text x="${textX + 3}" y="${subTitleY}" font-family="Arial, Helvetica, sans-serif" font-size="${subTitleSize}" font-weight="800" letter-spacing="${Math.max(2, subTitleSize * 0.18)}" fill="#ffffff" fill-opacity="0.92">${safeSubText}</text>
      </g>
    </svg>
  `);
}

async function convertImageToWebp(file: File, fieldLabel: string): Promise<Buffer> {
  validatePortfolioImageFile(file, fieldLabel);

  try {
    const sharp = (await import("sharp")).default;
    const source = Buffer.from(await file.arrayBuffer());
    const normalized = await sharp(source)
      .rotate()
      .toBuffer({ resolveWithObject: true });

    return await sharp(normalized.data)
      .composite([
        {
          input: buildCenteredWatermarkSvg(normalized.info.width, normalized.info.height),
          gravity: "center",
        },
      ])
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
