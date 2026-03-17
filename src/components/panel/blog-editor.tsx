"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { BlogBlockBuilder } from "@/components/panel/blog-block-builder";
import { BlogSeoChecklist } from "@/components/panel/blog-seo-checklist";
import { builderBlocksToContent, contentToBuilderBlocks } from "@/lib/blog-content";
import { SAMPLE_IMAGE_SETS } from "@/lib/sample-images";
import type { BlogPost } from "@/lib/types";

type BlogEditorProps = {
  initialPosts: BlogPost[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function BlogEditor({ initialPosts }: BlogEditorProps) {
  const router = useRouter();
  const initialPost = initialPosts[0];
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialPost?.slug ?? "");
  const [imageIndex, setImageIndex] = useState<number>(-1);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [contentBlocks, setContentBlocks] = useState(() => contentToBuilderBlocks(initialPost?.content ?? ""));
  const [title, setTitle] = useState(initialPost?.title ?? "");
  const [authorName, setAuthorName] = useState(initialPost?.authorName ?? "");
  const [tagsInput, setTagsInput] = useState(initialPost?.tags.join(", ") ?? "");
  const [excerpt, setExcerpt] = useState(initialPost?.excerpt ?? "");
  const [metaTitle, setMetaTitle] = useState(initialPost?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(initialPost?.metaDescription ?? "");

  const selectedPost = useMemo(
    () => posts.find((post) => post.slug === selectedSlug),
    [posts, selectedSlug],
  );

  function syncEditorState(nextPost: BlogPost | undefined) {
    setContentBlocks(contentToBuilderBlocks(nextPost?.content ?? ""));
    setTitle(nextPost?.title ?? "");
    setAuthorName(nextPost?.authorName ?? "");
    setTagsInput(nextPost?.tags.join(", ") ?? "");
    setExcerpt(nextPost?.excerpt ?? "");
    setMetaTitle(nextPost?.metaTitle ?? "");
    setMetaDescription(nextPost?.metaDescription ?? "");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedPost) {
      return;
    }

    const selectedImageSet = imageIndex >= 0 ? SAMPLE_IMAGE_SETS[imageIndex] : null;
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

    setStatus({ type: "loading" });

    const response = await fetch(`/api/blog/${selectedPost.slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        excerpt,
        content,
        authorName,
        tags,
        metaTitle,
        metaDescription,
        coverImage: selectedImageSet?.cover ?? selectedPost.coverImage,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Blog yazısı güncellenemedi." });
      return;
    }

    const payload = (await response.json()) as { post: BlogPost };
    setPosts((previous) => previous.map((post) => (post.slug === payload.post.slug ? payload.post : post)));
    syncEditorState(payload.post);
    setStatus({ type: "success", message: `${payload.post.title} güncellendi.` });
    setImageIndex(-1);
    router.refresh();
  }

  if (!selectedPost) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Blog Düzenle</h2>
        <p className="mt-2 text-sm text-slate-600">Düzenlenecek blog yazısı bulunamadı.</p>
      </section>
    );
  }

  const previewImage = imageIndex >= 0 ? SAMPLE_IMAGE_SETS[imageIndex]?.cover : selectedPost.coverImage;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Blog Yazısı Düzenle</h2>
          <p className="mt-2 text-sm text-slate-600">Hazır blokları sürükle-bırak ile düzenleyip yazıyı güncelleyin.</p>
        </div>
        <Link href={`/blog/${selectedPost.slug}`} className="text-sm font-semibold text-slate-700 underline">
          Yazıyı aç
        </Link>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Düzenlenecek Blog Yazısı</p>
        <select
          value={selectedSlug}
          onChange={(event) => {
            const nextSlug = event.target.value;
            const nextPost = posts.find((post) => post.slug === nextSlug);
            setSelectedSlug(nextSlug);
            syncEditorState(nextPost);
            setImageIndex(-1);
            setStatus({ type: "idle" });
          }}
          className="input mt-2"
        >
          {posts.map((post) => (
            <option key={post.id} value={post.slug}>
              {post.title} • {post.authorName}
            </option>
          ))}
        </select>
      </div>

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
            placeholder="Yazı başlığı"
            className="input"
          />
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
            placeholder="Kısa özet"
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
            name="imageSetIndex"
            className="input"
            value={imageIndex}
            onChange={(event) => setImageIndex(Number(event.target.value))}
          >
            <option value={-1}>Mevcut kapak görselini koru</option>
            {SAMPLE_IMAGE_SETS.map((set, index) => (
              <option key={set.label} value={index}>
                Kapak Görseli: {set.label}
              </option>
            ))}
          </select>
        </label>

        <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${previewImage})` }} />
          <p className="px-3 py-2 text-xs text-slate-600">
            {imageIndex >= 0 ? `Seçili set: ${SAMPLE_IMAGE_SETS[imageIndex]?.label ?? "-"}` : "Mevcut kapak korunacak"}
          </p>
        </div>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
        >
          {status.type === "loading" ? "Güncelleniyor..." : "Blog Yazısını Güncelle"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}
    </section>
  );
}
