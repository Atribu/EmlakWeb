const SAMPLE_ADVISOR_IMAGES = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
] as const;

function stableIndexFromSeed(seed: string): number {
  let hash = 0;

  for (const char of seed) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return hash % SAMPLE_ADVISOR_IMAGES.length;
}

export function pickSampleAdvisorImage(index: number): string {
  return SAMPLE_ADVISOR_IMAGES[index % SAMPLE_ADVISOR_IMAGES.length] ?? SAMPLE_ADVISOR_IMAGES[0]!;
}

export function pickSampleAdvisorImageForSeed(seed: string): string {
  return SAMPLE_ADVISOR_IMAGES[stableIndexFromSeed(seed)] ?? SAMPLE_ADVISOR_IMAGES[0]!;
}
