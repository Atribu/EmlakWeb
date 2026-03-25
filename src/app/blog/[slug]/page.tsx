import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { parseBlogContent } from "@/lib/blog-content";
import { getBlogPostBySlug, listBlogPosts } from "@/lib/data-store";
import { formatDateTR } from "@/lib/format";
import { blogMetadata, blogPostSchema } from "@/lib/seo";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function headingToneClass(tone: "default" | "accent" | "soft"): string {
  if (tone === "accent") {
    return "text-[#7a5c2b]";
  }

  if (tone === "soft") {
    return "text-[#4e4539]";
  }

  return "text-[#2f271d]";
}

function paragraphToneClass(tone: "default" | "accent" | "soft"): string {
  if (tone === "accent") {
    return "text-[#6d5227]";
  }

  if (tone === "soft") {
    return "text-[#61584c]";
  }

  return "text-[#4f473d]";
}

function listToneClass(tone: "default" | "accent" | "soft"): string {
  if (tone === "accent") {
    return "text-[#6d5227] marker:text-[#87652f]";
  }

  if (tone === "soft") {
    return "text-[#61584c] marker:text-[#74695b]";
  }

  return "text-[#4f473d] marker:text-[#705f46]";
}

function quoteToneClass(tone: "default" | "accent" | "soft"): string {
  if (tone === "accent") {
    return "border-[#d4bb8f] bg-[#fff8ed] text-[#694f24]";
  }

  if (tone === "soft") {
    return "border-[#d9d6ce] bg-[#f7f6f2] text-[#5a5247]";
  }

  return "border-[#dfd4c0] bg-[#faf7f1] text-[#554c40]";
}

function headingAnchor(text: string, index: number): string {
  const slug = text
    .toLocaleLowerCase("tr")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `bolum-${index}-${slug || "icerik"}`;
}

export async function generateMetadata({ params }: BlogDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    return { title: "Blog Yazısı Bulunamadı | PortföySatış" };
  }

  return blogMetadata(post);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostBySlug(resolvedParams.slug);

  if (!post) {
    notFound();
  }

  const schema = blogPostSchema(post);
  const contentBlocks = parseBlogContent(post.content);
  const tableOfContents = contentBlocks
    .map((block, index) => {
      if (block.type !== "heading" || block.level < 2) {
        return null;
      }

      return {
        id: headingAnchor(block.text, index),
        text: block.text,
        level: block.level,
      };
    })
    .filter(Boolean) as Array<{ id: string; text: string; level: 2 | 3 | 4 | 5 }>;
  const relatedPosts = listBlogPosts()
    .filter((item) => item.id !== post.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)]">
          <div className="relative h-[280px] sm:h-[380px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.coverImage})` }} />
            <div className="hero-overlay absolute inset-0" />

            <div className="absolute bottom-0 left-0 right-0 p-6 text-[#f4ead8] sm:p-9">
              <Link href="/blog" className="text-sm font-semibold text-[#ebd8bb] underline">
                ← Blog listesine dön
              </Link>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">
                {formatDateTR(post.publishedAt)} • {post.authorName}
              </p>
              <h1 className="mt-2 max-w-4xl text-[2.2rem] leading-[1.02] font-semibold sm:text-[3.4rem]">{post.title}</h1>
            </div>
          </div>
        </section>

        <section className="frame mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <article className="luxury-card p-6 sm:p-8">
            <p className="text-base leading-8 text-[#5f5548]">{post.excerpt}</p>

            <div className="mt-6 space-y-5 text-sm leading-8 sm:text-base">
              {contentBlocks.map((block, index) => {
                if (block.type === "heading") {
                  const levelClass =
                    block.level <= 2
                      ? "text-2xl font-semibold"
                      : block.level === 3
                        ? "text-xl font-semibold"
                        : block.level === 4
                          ? "text-lg font-semibold"
                          : "text-base font-semibold uppercase tracking-[0.08em]";
                  const headingClass = `${levelClass} ${headingToneClass(block.tone)}`;
                  const headingId = headingAnchor(block.text, index);

                  if (block.level === 1) {
                    return (
                      <h2 id={headingId} key={`heading-${index}`} className={headingClass}>
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.level === 2) {
                    return (
                      <h2 id={headingId} key={`heading-${index}`} className={headingClass}>
                        {block.text}
                      </h2>
                    );
                  }

                  if (block.level === 3) {
                    return (
                      <h3 id={headingId} key={`heading-${index}`} className={headingClass}>
                        {block.text}
                      </h3>
                    );
                  }

                  if (block.level === 4) {
                    return (
                      <h4 id={headingId} key={`heading-${index}`} className={headingClass}>
                        {block.text}
                      </h4>
                    );
                  }

                  return (
                    <h5 id={headingId} key={`heading-${index}`} className={headingClass}>
                      {block.text}
                    </h5>
                  );
                }

                if (block.type === "list") {
                  if (block.ordered) {
                    return (
                      <ol key={`list-${index}`} className={`list-decimal space-y-1 pl-6 ${listToneClass(block.tone)}`}>
                        {block.items.map((item, itemIndex) => (
                          <li key={`ol-${index}-${itemIndex}`}>{item}</li>
                        ))}
                      </ol>
                    );
                  }

                  return (
                    <ul key={`list-${index}`} className={`list-disc space-y-1 pl-6 ${listToneClass(block.tone)}`}>
                      {block.items.map((item, itemIndex) => (
                        <li key={`ul-${index}-${itemIndex}`}>{item}</li>
                      ))}
                    </ul>
                  );
                }

                if (block.type === "quote") {
                  return (
                    <blockquote
                      key={`quote-${index}`}
                      className={`rounded-xl border-l-4 px-4 py-3 text-sm leading-7 italic ${quoteToneClass(block.tone)}`}
                    >
                      {block.text}
                    </blockquote>
                  );
                }

                if (block.type === "cta") {
                  return (
                    <div key={`cta-${index}`} className="rounded-xl border border-[#dcccb0] bg-[#fcf4e4] px-4 py-4">
                      <a
                        href={block.href}
                        className="inline-flex rounded-full bg-[#2f271d] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#f7e6c8]"
                      >
                        {block.label}
                      </a>
                    </div>
                  );
                }

                if (block.type === "image") {
                  return (
                    <figure key={`image-${index}`} className="overflow-hidden rounded-xl border border-[#dfd2bd] bg-[#f8f4eb]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={block.src} alt={block.alt} className="h-auto w-full object-cover" loading="lazy" />
                      <figcaption className="space-y-1 px-4 py-3 text-xs text-[#5f5548]">
                        <p className="font-semibold">{block.alt}</p>
                        {block.caption ? <p>{block.caption}</p> : null}
                      </figcaption>
                    </figure>
                  );
                }

                return (
                  <p key={`paragraph-${index}`} className={paragraphToneClass(block.tone)}>
                    {block.text}
                  </p>
                );
              })}
            </div>
          </article>

          <aside className="space-y-4">
            {tableOfContents.length > 0 ? (
              <section className="luxury-card p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">Icindekiler</p>
                <nav className="mt-3 space-y-2">
                  {tableOfContents.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className={`block text-sm text-[#4f473d] hover:underline ${item.level >= 4 ? "pl-3" : item.level === 3 ? "pl-2" : ""}`}
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </section>
            ) : null}

            <section className="luxury-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">Etiketler</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[#e2d5c2] bg-[#f9f4eb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6744]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>

            <section className="luxury-card p-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7348]">İlgili Yazılar</p>
              <div className="mt-3 space-y-3">
                {relatedPosts.map((item) => (
                  <article key={item.id} className="rounded-xl border border-[#e3d7c4] bg-white p-3">
                    <h2 className="text-sm font-semibold text-[#241f18]">{item.title}</h2>
                    <Link href={`/blog/${item.slug}`} className="mt-1 inline-block text-xs font-semibold underline">
                      Oku
                    </Link>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </section>

        <SiteFooter />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
    </div>
  );
}
