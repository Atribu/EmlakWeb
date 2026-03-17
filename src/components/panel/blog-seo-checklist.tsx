"use client";

import { useMemo } from "react";

import { BlogBuilderBlock, builderBlocksToContent } from "@/lib/blog-content";

type BlogSeoChecklistProps = {
  title: string;
  excerpt: string;
  metaTitle: string;
  metaDescription: string;
  tagsInput: string;
  contentBlocks: BlogBuilderBlock[];
};

type SeoCheck = {
  label: string;
  passed: boolean;
  detail: string;
};

function countWords(value: string): number {
  return value
    .trim()
    .split(/\s+/g)
    .filter(Boolean).length;
}

export function BlogSeoChecklist({
  title,
  excerpt,
  metaTitle,
  metaDescription,
  tagsInput,
  contentBlocks,
}: BlogSeoChecklistProps) {
  const checks = useMemo<SeoCheck[]>(() => {
    const tags = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    const serializedContent = builderBlocksToContent(contentBlocks);
    const wordCount = countWords(`${excerpt} ${serializedContent}`);
    const h2Count = contentBlocks.filter((block) => block.type === "h2" && block.text.trim().length > 0).length;
    const richBlockCount = contentBlocks.filter((block) =>
      ["ul", "ol", "quote", "image"].includes(block.type) && block.text.trim().length > 0,
    ).length;
    const ctaCount = contentBlocks.filter((block) => block.type === "cta" && block.text.trim().length > 0).length;

    return [
      {
        label: "H1 uzunlugu",
        passed: title.trim().length >= 35 && title.trim().length <= 70,
        detail: `${title.trim().length} karakter (ideal: 35-70)`,
      },
      {
        label: "Meta title",
        passed: metaTitle.trim().length >= 50 && metaTitle.trim().length <= 60,
        detail: `${metaTitle.trim().length} karakter (ideal: 50-60)`,
      },
      {
        label: "Meta description",
        passed: metaDescription.trim().length >= 140 && metaDescription.trim().length <= 160,
        detail: `${metaDescription.trim().length} karakter (ideal: 140-160)`,
      },
      {
        label: "Ozet paragraf",
        passed: excerpt.trim().length >= 90 && excerpt.trim().length <= 220,
        detail: `${excerpt.trim().length} karakter (ideal: 90-220)`,
      },
      {
        label: "Icerik uzunlugu",
        passed: wordCount >= 250,
        detail: `${wordCount} kelime (minimum: 250)`,
      },
      {
        label: "H2 bolumleri",
        passed: h2Count >= 1,
        detail: `${h2Count} adet H2`,
      },
      {
        label: "Etiket sayisi",
        passed: tags.length >= 3,
        detail: `${tags.length} etiket (minimum: 3)`,
      },
      {
        label: "Zengin icerik bloklari",
        passed: richBlockCount >= 1,
        detail: `${richBlockCount} adet (UL/OL/QUOTE/IMG)`,
      },
      {
        label: "CTA kullanimi",
        passed: ctaCount >= 1,
        detail: `${ctaCount} adet CTA`,
      },
    ];
  }, [contentBlocks, excerpt, metaDescription, metaTitle, tagsInput, title]);

  const passedCount = checks.filter((check) => check.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);

  return (
    <section className="md:col-span-2 rounded-xl border border-[#d8c9b2] bg-[#fffaf1] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#6f5a3d]">SEO Kontrol Paneli</p>
        <p className="text-sm font-semibold text-[#3a2f22]">Skor: {score}/100</p>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#eee2d1]">
        <div className="h-full bg-[#b89155] transition-all" style={{ width: `${score}%` }} />
      </div>

      <ul className="mt-4 space-y-2">
        {checks.map((check) => (
          <li
            key={check.label}
            className={`rounded-lg border px-3 py-2 ${
              check.passed
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-amber-200 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="text-sm font-semibold">{check.label}</p>
            <p className="mt-0.5 text-xs">{check.detail}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
