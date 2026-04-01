export function isUnoptimizedImageSrc(src: string): boolean {
  return src.startsWith("data:") || src.startsWith("blob:");
}
