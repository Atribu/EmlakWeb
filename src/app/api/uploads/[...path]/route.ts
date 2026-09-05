import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import { UPLOAD_DISK_ROOT } from "@/lib/upload-config";

const MIME_TYPES: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path: segments } = await params;
  const uploadRoot = path.resolve(UPLOAD_DISK_ROOT);

  const safePath = segments
    .map((s) => path.basename(s))
    .join(path.sep);

  const diskPath = path.resolve(uploadRoot, safePath);
  const relativePath = path.relative(uploadRoot, diskPath);

  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  try {
    const buffer = await fs.readFile(diskPath);
    const ext = path.extname(diskPath).toLowerCase();
    const contentType = MIME_TYPES[ext];

    if (!contentType) {
      return new NextResponse("Unsupported Media Type", { status: 415 });
    }

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new NextResponse("Not Found", { status: 404 });
  }
}
