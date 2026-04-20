import path from "node:path";

export const UPLOAD_DISK_ROOT = path.join(process.cwd(), ".demo-data", "uploads");
export const UPLOAD_PUBLIC_PREFIX = "/api/uploads";
