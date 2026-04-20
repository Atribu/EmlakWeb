export const MAX_WEBP_UPLOAD_MB = 8;
export const MAX_GALLERY_IMAGE_COUNT = 24;
export const MAX_PORTFOLIO_REQUEST_MB = 60;

const maxUploadBytes = MAX_WEBP_UPLOAD_MB * 1024 * 1024;
const maxPortfolioRequestBytes = MAX_PORTFOLIO_REQUEST_MB * 1024 * 1024;

const acceptedPortfolioImageMimeTypes = new Set([
  "image/webp",
  "image/jpeg",
  "image/png",
  "image/jpg",
]);

function isWebpFile(file: File): boolean {
  const lowerName = file.name.toLocaleLowerCase("tr");
  return file.type === "image/webp" || lowerName.endsWith(".webp");
}

function isAcceptedPortfolioImage(file: File): boolean {
  const lowerName = file.name.toLocaleLowerCase("tr");
  return (
    acceptedPortfolioImageMimeTypes.has(file.type) ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png")
  );
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

export function validatePortfolioImageFile(file: File, fieldLabel: string) {
  if (file.size <= 0) {
    throw new Error(`${fieldLabel} dosyası boş olamaz.`);
  }

  if (!isAcceptedPortfolioImage(file)) {
    throw new Error(`${fieldLabel} jpg, jpeg, png veya webp formatında olmalıdır.`);
  }

  if (file.size > maxUploadBytes) {
    throw new Error(`${fieldLabel} en fazla ${MAX_WEBP_UPLOAD_MB} MB olabilir.`);
  }
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
      `Toplam görsel yükleme boyutu en fazla ${MAX_PORTFOLIO_REQUEST_MB} MB olabilir. Daha küçük görseller deneyin.`,
    );
  }
}

export function createGalleryImageLabel(index: number): string {
  return `Galeri ${index + 1}`;
}
