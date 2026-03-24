export const MAX_WEBP_UPLOAD_MB = 8;
export const MAX_IMAGES_PER_ROOM = 8;
export const MAX_PORTFOLIO_REQUEST_MB = 4;

const maxUploadBytes = MAX_WEBP_UPLOAD_MB * 1024 * 1024;
const maxPortfolioRequestBytes = MAX_PORTFOLIO_REQUEST_MB * 1024 * 1024;

export const PORTFOLIO_ROOM_FIELDS = [
  { name: "livingRoomImage", label: "Salon", requiredOnCreate: true },
  { name: "kitchenImage", label: "Mutfak", requiredOnCreate: true },
  { name: "bedroomImage", label: "Yatak Odası", requiredOnCreate: true },
  { name: "bathroomImage", label: "Banyo", requiredOnCreate: false },
  { name: "balconyImage", label: "Balkon / Teras", requiredOnCreate: false },
] as const;

type RoomField = (typeof PORTFOLIO_ROOM_FIELDS)[number];

function isWebpFile(file: File): boolean {
  const lowerName = file.name.toLocaleLowerCase("tr");
  return file.type === "image/webp" || lowerName.endsWith(".webp");
}

export function validateWebpFile(file: File, fieldLabel: string) {
  if (file.size <= 0) {
    throw new Error(`${fieldLabel} dosyası boş olamaz.`);
  }

  if (!isWebpFile(file)) {
    throw new Error(`${fieldLabel} yalnızca .webp formatında olmalıdır.`);
  }

  if (file.size > maxUploadBytes) {
    throw new Error(`${fieldLabel} en fazla ${MAX_WEBP_UPLOAD_MB} MB olabilir.`);
  }
}

function fileToDataUrlInBrowser(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const value = reader.result;
      if (typeof value !== "string") {
        reject(new Error("Görsel okunamadı."));
        return;
      }

      resolve(value);
    };

    reader.onerror = () => reject(new Error("Görsel okunamadı."));
    reader.readAsDataURL(file);
  });
}

async function fileToDataUrlOnServer(file: File): Promise<string> {
  const contentType = file.type || "image/webp";
  const arrayBuffer = await file.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");
  return `data:${contentType};base64,${base64}`;
}

export async function readWebpAsDataUrl(file: File, fieldLabel: string): Promise<string> {
  validateWebpFile(file, fieldLabel);
  if (typeof window === "undefined") {
    return fileToDataUrlOnServer(file);
  }

  return fileToDataUrlInBrowser(file);
}

export function getFilesFromFormData(formData: FormData, fieldName: string): File[] {
  return formData
    .getAll(fieldName)
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export function validateTotalUploadSize(files: File[]) {
  const totalBytes = files.reduce((sum, file) => sum + file.size, 0);

  if (totalBytes > maxPortfolioRequestBytes) {
    throw new Error(
      `Toplam görsel yükleme boyutu en fazla ${MAX_PORTFOLIO_REQUEST_MB} MB olabilir. Daha küçük .webp dosyaları deneyin.`,
    );
  }
}

export function makeRoomImageLabel(field: RoomField, index: number, total: number): string {
  if (total <= 1) {
    return field.label;
  }

  return `${field.label} ${index + 1}`;
}

export function isLabelForRoom(label: string, roomLabel: string): boolean {
  return label === roomLabel || label.startsWith(`${roomLabel} `);
}
