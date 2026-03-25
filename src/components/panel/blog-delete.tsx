"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { BlogPost } from "@/lib/types";

type BlogDeleteProps = {
  initialPosts: BlogPost[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function BlogDelete({ initialPosts, canManage }: BlogDeleteProps) {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr");

    if (!normalizedQuery) {
      return posts;
    }

    return posts.filter((post) =>
      [post.title, post.authorName, post.metaTitle, post.metaDescription, ...post.tags]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(normalizedQuery),
    );
  }, [posts, query]);

  async function handleDelete(post: BlogPost) {
    if (!canManage) {
      return;
    }

    const confirmed = window.confirm(`"${post.title}" blog yazısını silmek istediğine emin misin?`);
    if (!confirmed) {
      return;
    }

    setDeletingSlug(post.slug);

    const response = await fetch(`/api/blog/${post.slug}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Blog yazısı silinemedi." });
      setDeletingSlug(null);
      return;
    }

    setPosts((previous) => previous.filter((item) => item.slug !== post.slug));
    setStatus({ type: "success", message: `"${post.title}" silindi.` });
    setDeletingSlug(null);
    router.refresh();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Blog Yazısı Sil</h2>
      <p className="mt-2 text-sm text-slate-600">
        Yayınlanan blog içeriklerini listeden bulun ve panel üzerinden kaldırın.
      </p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Bu hesapta blog silme yetkisi bulunmuyor.
        </p>
      ) : null}

      <div className="mt-5 grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Blog ara (başlık, yazar, etiket)"
          className="input"
        />
        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          Toplam kayıt: <strong className="text-slate-900">{posts.length}</strong>
        </div>
      </div>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}

      <div className="mt-5 space-y-3">
        {filteredPosts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            {posts.length === 0 ? "Silinebilecek blog yazısı bulunmuyor." : "Aramana uygun blog yazısı bulunamadı."}
          </p>
        ) : (
          filteredPosts.map((post) => (
            <article key={post.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                      Blog
                    </span>
                    <span className="text-xs font-medium text-slate-500">{post.authorName}</span>
                  </div>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{post.title}</p>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{post.excerpt}</p>
                  <p className="mt-2 text-xs text-slate-500">Etiketler: {post.tags.join(", ")}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/blog/${post.slug}`}
                    className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700 transition hover:bg-slate-100"
                  >
                    Yazıyı Aç
                  </Link>
                  <button
                    type="button"
                    disabled={!canManage || deletingSlug === post.slug}
                    onClick={() => void handleDelete(post)}
                    className="cursor-pointer rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    {deletingSlug === post.slug ? "Siliniyor..." : "Blogu Sil"}
                  </button>
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}
