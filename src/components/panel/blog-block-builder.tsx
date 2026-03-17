"use client";

import { DragEvent, useState } from "react";

import {
  BlogBuilderBlock,
  BlogBuilderBlockType,
  BlogBlockTone,
  createBlogBuilderBlock,
  parseCtaBuilderText,
  parseImageBuilderText,
  parseListBuilderText,
} from "@/lib/blog-content";

type BlogBlockBuilderProps = {
  blocks: BlogBuilderBlock[];
  onChange: (blocks: BlogBuilderBlock[]) => void;
};

const typeOptions: Array<{ value: BlogBuilderBlockType; label: string }> = [
  { value: "h2", label: "H2" },
  { value: "h3", label: "H3" },
  { value: "h4", label: "H4" },
  { value: "h5", label: "H5" },
  { value: "p", label: "P" },
  { value: "ul", label: "UL" },
  { value: "ol", label: "OL" },
  { value: "quote", label: "QUOTE" },
  { value: "cta", label: "CTA" },
  { value: "image", label: "IMG" },
];

const toneOptions: Array<{ value: BlogBlockTone; label: string }> = [
  { value: "default", label: "Standart" },
  { value: "accent", label: "Vurgulu" },
  { value: "soft", label: "Yumuşak" },
];

function reorder<T>(items: T[], from: number, to: number): T[] {
  const cloned = [...items];
  const [moved] = cloned.splice(from, 1);
  cloned.splice(to, 0, moved);
  return cloned;
}

function toneClass(tone: BlogBlockTone): string {
  if (tone === "accent") {
    return "border-[#d6bd90] bg-[#fff7ea]";
  }

  if (tone === "soft") {
    return "border-[#d9d7d1] bg-[#f7f6f2]";
  }

  return "border-slate-200 bg-white";
}

function headingClass(type: BlogBuilderBlockType, tone: BlogBlockTone): string {
  const base =
    type === "h2"
      ? "text-2xl sm:text-[1.9rem]"
      : type === "h3"
        ? "text-xl"
        : type === "h4"
          ? "text-lg"
          : "text-base uppercase tracking-[0.08em]";

  if (tone === "accent") {
    return `${base} font-semibold text-[#7a5c2b]`;
  }

  if (tone === "soft") {
    return `${base} font-semibold text-[#4e4539]`;
  }

  return `${base} font-semibold text-[#2f271d]`;
}

function paragraphClass(tone: BlogBlockTone): string {
  if (tone === "accent") {
    return "text-[#6d5227]";
  }

  if (tone === "soft") {
    return "text-[#61584c]";
  }

  return "text-[#4f473d]";
}

function listClass(tone: BlogBlockTone): string {
  if (tone === "accent") {
    return "text-[#6d5227] marker:text-[#8a6a34]";
  }

  if (tone === "soft") {
    return "text-[#61584c] marker:text-[#74695b]";
  }

  return "text-[#4f473d] marker:text-[#6d5d46]";
}

function quoteClass(tone: BlogBlockTone): string {
  if (tone === "accent") {
    return "border-[#d6bd90] bg-[#fff8ed] text-[#6d5227]";
  }

  if (tone === "soft") {
    return "border-[#d9d7d1] bg-[#f6f5f1] text-[#5c5448]";
  }

  return "border-[#dfd7c9] bg-[#f9f6f0] text-[#51493e]";
}

function blockRows(type: BlogBuilderBlockType): number {
  if (type === "p") {
    return 4;
  }

  if (type === "ul" || type === "ol") {
    return 5;
  }

  if (type === "image") {
    return 3;
  }

  if (type === "cta") {
    return 2;
  }

  return 2;
}

function blockPlaceholder(type: BlogBuilderBlockType): string {
  if (type === "p") {
    return "Paragraf metni";
  }

  if (type === "ul" || type === "ol") {
    return "Her satira bir madde yazin";
  }

  if (type === "quote") {
    return "Alinti metni";
  }

  if (type === "cta") {
    return "1. satir: Buton metni\n2. satir: Link (orn. /iletisim)";
  }

  if (type === "image") {
    return "1. satir: Gorsel URL\n2. satir: Alt metin\n3. satir: Aciklama (opsiyonel)";
  }

  return "Baslik metni";
}

function blockHint(type: BlogBuilderBlockType): string {
  if (type === "ul" || type === "ol") {
    return "SEO taramasini guclendirmek icin listeleri ayri satirlarda yazin.";
  }

  if (type === "cta") {
    return "Donusum odakli cagrilar icin net fiil kullanin.";
  }

  if (type === "image") {
    return "Alt metin alanina hedef anahtar kelimeyi dogal sekilde ekleyin.";
  }

  return "";
}

export function BlogBlockBuilder({ blocks, onChange }: BlogBlockBuilderProps) {
  const [dragFromIndex, setDragFromIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  function addBlock(type: BlogBuilderBlockType) {
    onChange([...blocks, createBlogBuilderBlock(type)]);
  }

  function updateBlock(id: string, patch: Partial<BlogBuilderBlock>) {
    onChange(blocks.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function removeBlock(id: string) {
    if (blocks.length <= 1) {
      return;
    }

    onChange(blocks.filter((item) => item.id !== id));
  }

  function moveBlock(from: number, to: number) {
    if (to < 0 || to >= blocks.length || from === to) {
      return;
    }

    onChange(reorder(blocks, from, to));
  }

  function handleDragStart(event: DragEvent<HTMLButtonElement>, index: number) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(index));
    setDragFromIndex(index);
    setDragOverIndex(index);
  }

  function handleDragOver(event: DragEvent<HTMLElement>, index: number) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";

    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDrop(event: DragEvent<HTMLElement>, index: number) {
    event.preventDefault();
    const raw = event.dataTransfer.getData("text/plain");
    const parsedFrom = Number(raw);
    const fromIndex = Number.isInteger(parsedFrom) ? parsedFrom : dragFromIndex;

    if (fromIndex === null || fromIndex < 0 || fromIndex >= blocks.length) {
      setDragFromIndex(null);
      setDragOverIndex(null);
      return;
    }

    if (fromIndex !== index) {
      onChange(reorder(blocks, fromIndex, index));
    }

    setDragFromIndex(null);
    setDragOverIndex(null);
  }

  function handleDragEnd() {
    setDragFromIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-2">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">İçerik Bileşenleri</p>
        <p className="mt-1 text-xs text-slate-500">
          H2/H3/H4/H5/P/UL/OL/QUOTE/CTA/IMG bloklarını ekleyin ve sürükle-bırak ile sıralayın.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {typeOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => addBlock(option.value)}
            className="cursor-pointer rounded-full border border-[#d0c2ad] bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#6f5a3c] transition hover:bg-[#f4ead9]"
          >
            + {option.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <article
            key={block.id}
            onDragOver={(event) => handleDragOver(event, index)}
            onDrop={(event) => handleDrop(event, index)}
            className={`rounded-xl border p-3 transition ${toneClass(block.tone)} ${
              dragOverIndex === index ? "ring-2 ring-[#aa8250]" : ""
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragEnd={handleDragEnd}
                className="cursor-grab rounded border border-slate-300 bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600 active:cursor-grabbing"
                aria-label={`Blok ${index + 1} sürükle`}
                title="Sürükle-bırak ile taşı"
              >
                Tasi
              </button>

              <span className="rounded bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Blok {index + 1}
              </span>

              <select
                value={block.type}
                onChange={(event) => updateBlock(block.id, { type: event.target.value as BlogBuilderBlockType })}
                className="input max-w-[110px]"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <select
                value={block.tone}
                onChange={(event) => updateBlock(block.id, { tone: event.target.value as BlogBlockTone })}
                className="input max-w-[130px]"
              >
                {toneOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    Stil: {option.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => moveBlock(index, index - 1)}
                disabled={index === 0}
                className="cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => moveBlock(index, index + 1)}
                disabled={index === blocks.length - 1}
                className="cursor-pointer rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => removeBlock(block.id)}
                disabled={blocks.length <= 1}
                className="cursor-pointer rounded border border-rose-200 bg-white px-2 py-1 text-xs font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Sil
              </button>
            </div>

            <textarea
              value={block.text}
              onChange={(event) => updateBlock(block.id, { text: event.target.value })}
              rows={blockRows(block.type)}
              placeholder={blockPlaceholder(block.type)}
              className="input mt-3"
            />
            {blockHint(block.type) ? <p className="mt-2 text-xs text-slate-500">{blockHint(block.type)}</p> : null}
          </article>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">Canlı Önizleme</p>
        <div className="mt-3 space-y-4">
          {blocks
            .filter((block) => block.text.trim().length > 0)
            .map((block) => {
              if (block.type === "p") {
                return (
                  <p key={block.id} className={`text-sm leading-8 ${paragraphClass(block.tone)}`}>
                    {block.text}
                  </p>
                );
              }

              if (block.type === "ul" || block.type === "ol") {
                const items = parseListBuilderText(block.text);
                if (items.length === 0) {
                  return null;
                }

                if (block.type === "ol") {
                  return (
                    <ol key={block.id} className={`list-decimal space-y-1 pl-5 text-sm leading-8 ${listClass(block.tone)}`}>
                      {items.map((item, itemIndex) => (
                        <li key={`${block.id}-${itemIndex}`}>{item}</li>
                      ))}
                    </ol>
                  );
                }

                return (
                  <ul key={block.id} className={`list-disc space-y-1 pl-5 text-sm leading-8 ${listClass(block.tone)}`}>
                    {items.map((item, itemIndex) => (
                      <li key={`${block.id}-${itemIndex}`}>{item}</li>
                    ))}
                  </ul>
                );
              }

              if (block.type === "quote") {
                return (
                  <blockquote
                    key={block.id}
                    className={`rounded-xl border-l-4 px-4 py-3 text-sm leading-7 italic ${quoteClass(block.tone)}`}
                  >
                    {block.text}
                  </blockquote>
                );
              }

              if (block.type === "cta") {
                const cta = parseCtaBuilderText(block.text);
                if (!cta.label || !cta.href) {
                  return null;
                }

                return (
                  <div key={block.id} className="rounded-xl border border-[#d8c8ad] bg-[#fdf6e7] p-4">
                    <a
                      href={cta.href}
                      className="inline-flex rounded-full bg-[#2f271d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#f8e8cd]"
                    >
                      {cta.label}
                    </a>
                  </div>
                );
              }

              if (block.type === "image") {
                const image = parseImageBuilderText(block.text);
                if (!image.src || !image.alt) {
                  return null;
                }

                return (
                  <figure key={block.id} className="overflow-hidden rounded-xl border border-[#dfd2bd] bg-[#f7f4ed]">
                    <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${image.src})` }} />
                    <figcaption className="space-y-1 px-3 py-2 text-xs text-[#5f5548]">
                      <p>
                        <strong>Alt:</strong> {image.alt}
                      </p>
                      {image.caption ? <p>{image.caption}</p> : null}
                    </figcaption>
                  </figure>
                );
              }

              const Tag = block.type;
              return (
                <Tag key={block.id} className={headingClass(block.type, block.tone)}>
                  {block.text}
                </Tag>
              );
            })}
        </div>
      </div>
    </div>
  );
}
