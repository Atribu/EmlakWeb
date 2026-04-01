import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listBlogPosts } from "@/lib/data-store";
import { blogListPageCopy } from "@/lib/site-copy";
import { formatDate } from "@/lib/format";
import { isUnoptimizedImageSrc } from "@/lib/image-src";
import { getServerSiteLanguage } from "@/lib/site-preferences-server";
import { blogListSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Blog | PortföySatış",
  description: "Emlak yatırımı, satış stratejisi ve premium konut trendleri üzerine SEO odaklı içerikler.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  const language = await getServerSiteLanguage();
  const copy = blogListPageCopy(language);
  const posts = listBlogPosts();
  const schema = blogListSchema(posts);

  return (
    <div className="min-h-screen">
      <SiteHeader />

      <main className="w-full pb-24">
        <section className="frame-wide fade-up relative overflow-hidden rounded-[1.4rem] border border-[#3f3022] bg-[#0f1621] p-7 text-[#f4ead8] shadow-[0_48px_88px_-64px_rgba(0,0,0,0.95)] sm:p-10">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#d8bc8d]">{copy.heroKicker}</p>
          <h1 className="mt-3 text-[2.4rem] leading-[0.95] font-semibold sm:text-[3.8rem]">{copy.heroTitle}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[#d7c8ad] sm:text-base">
            {copy.heroBody}
          </p>
        </section>

        <section className="frame mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="luxury-card overflow-hidden">
              <Image
                src={post.coverImage}
                alt={post.title}
                fetchPriority="low"
                unoptimized={isUnoptimizedImageSrc(post.coverImage)}
                width={960}
                height={420}
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="h-52 w-full object-cover"
              />
              <div className="p-5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8d7348]">
                  {formatDate(post.publishedAt, language)} • {post.authorName}
                </p>
                <h2 className="mt-2 text-[1.75rem] leading-[1.05] font-semibold text-[#1f1a14]">{post.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[#635a4e]">{post.excerpt}</p>
                <div className="mt-3 flex flex-wrap gap-1">
                  {post.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-[#e2d5c2] bg-[#f9f4eb] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7b6744]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <Link href={`/blog/${post.slug}`} className="mt-3 inline-block text-sm font-semibold text-[#6b5028] underline">
                  {copy.read}
                </Link>
              </div>
            </article>
          ))}
        </section>

        <SiteFooter />

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </main>
    </div>
  );
}
