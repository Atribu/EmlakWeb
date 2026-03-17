"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";

import { BlogBlockBuilder } from "@/components/panel/blog-block-builder";
import { BlogSeoChecklist } from "@/components/panel/blog-seo-checklist";
import { builderBlocksToContent, defaultBlogBuilderBlocks } from "@/lib/blog-content";
import { SAMPLE_IMAGE_SETS } from "@/lib/sample-images";

type BlogFormProps = {
  defaultAuthorName: string;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; slug: string };

export function BlogForm({ defaultAuthorName }: BlogFormProps) {
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [imageIndex, setImageIndex] = useState(0);
  const [contentBlocks, setContentBlocks] = useState(() => defaultBlogBuilderBlocks());
  const [title, setTitle] = useState("");
  const [authorName, setAuthorName] = useState(defaultAuthorName);
  const [tagsInput, setTagsInput] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const selectedImageSet = useMemo(
    () => SAMPLE_IMAGE_SETS[imageIndex] ?? SAMPLE_IMAGE_SETS[0],
    [imageIndex],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = builderBlocksToContent(contentBlocks);
    const tags = tagsInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!content.trim()) {
      setStatus({ type: "error", message: "En az bir içerik bloğu doldurmalısınız." });
      return;
    }

    if (tags.length === 0) {
      setStatus({ type: "error", message: "En az bir SEO etiketi eklemelisiniz." });
      return;
    }

    const set = SAMPLE_IMAGE_SETS[imageIndex] ?? SAMPLE_IMAGE_SETS[0];

    setStatus({ type: "loading" });

    const response = await fetch("/api/blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt,
        content,
        authorName,
        tags,
        metaTitle,
        metaDescription,
        coverImage: set?.cover,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({
        type: "error",
        message: payload?.message ?? "Blog yazısı oluşturulamadı.",
      });
      return;
    }

    const payload = (await response.json()) as { post: { slug: string } };
    setStatus({ type: "success", slug: payload.post.slug });
    setImageIndex(0);
    setContentBlocks(defaultBlogBuilderBlocks());
    setTitle("");
    setAuthorName(defaultAuthorName);
    setTagsInput("");
    setExcerpt("");
    setMetaTitle("");
    setMetaDescription("");
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">SEO Odaklı Blog Yazısı Oluştur</h2>
      <p className="mt-2 text-sm text-slate-600">
        Hazır bileşenleri sürükle-bırak ile sıralayıp tasarımı düzenleyin.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-4 md:grid-cols-2">
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            H1 - Ana Başlık
          </span>
          <input
            required
            name="title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Örn: İstanbul'da Lüks Konut Yatırım Rehberi"
            className="input"
          />
          <p className="mt-1 text-xs text-slate-500">Ana anahtar kelimeyi başlığa yakın kullanın.</p>
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Yazar
          </span>
          <input
            required
            name="authorName"
            value={authorName}
            onChange={(event) => setAuthorName(event.target.value)}
            placeholder="Yazar adı"
            className="input"
          />
        </label>

        <label>
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            SEO Etiketleri
          </span>
          <input
            required
            name="tags"
            value={tagsInput}
            onChange={(event) => setTagsInput(event.target.value)}
            placeholder="Etiketler (virgülle)"
            className="input"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            P - Özet Paragraf
          </span>
          <textarea
            required
            name="excerpt"
            rows={2}
            value={excerpt}
            onChange={(event) => setExcerpt(event.target.value)}
            placeholder="İlk paragrafta yazının değerini net anlatın."
            className="input"
          />
        </label>

        <BlogBlockBuilder blocks={contentBlocks} onChange={setContentBlocks} />

        <BlogSeoChecklist
          title={title}
          excerpt={excerpt}
          metaTitle={metaTitle}
          metaDescription={metaDescription}
          tagsInput={tagsInput}
          contentBlocks={contentBlocks}
        />

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            SEO Meta Title
          </span>
          <input
            required
            name="metaTitle"
            value={metaTitle}
            onChange={(event) => setMetaTitle(event.target.value)}
            placeholder="55-60 karakter ideal"
            className="input"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            SEO Meta Description
          </span>
          <textarea
            required
            name="metaDescription"
            rows={3}
            value={metaDescription}
            onChange={(event) => setMetaDescription(event.target.value)}
            placeholder="140-160 karakter, tıklama odaklı açıklama"
            className="input"
          />
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Kapak Görseli
          </span>
          <select
            required
            name="imageSetIndex"
            className="input"
            value={imageIndex}
            onChange={(event) => setImageIndex(Number(event.target.value))}
          >
            {SAMPLE_IMAGE_SETS.map((set, index) => (
              <option key={set.label} value={index}>
                Kapak Görseli: {set.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${selectedImageSet?.cover})` }} />
          <p className="px-3 py-2 text-xs text-slate-600">Seçili kapak: {selectedImageSet?.label}</p>
        </div>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
        >
          {status.type === "loading" ? "Yayınlanıyor..." : "Blog Yazısını Yayınla"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}

      {status.type === "success" ? (
        <p className="mt-3 text-sm text-emerald-700">
          Blog yazısı yayınlandı.
          <Link href={`/blog/${status.slug}`} className="ml-1 font-semibold underline">
            Yazıyı görüntüle
          </Link>
        </p>
      ) : null}
    </section>
  );
}
