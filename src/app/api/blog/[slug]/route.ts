import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { canManageBlogs } from "@/lib/access-control";
import { getUserFromRequest } from "@/lib/auth";
import { deleteBlogPostBySlug, getBlogPostBySlug, updateBlogPostBySlug } from "@/lib/data-store";
import type { CreateBlogPostInput } from "@/lib/types";

function parseString(value: unknown, label: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} zorunludur.`);
  }

  return value.trim();
}

function parseList(value: unknown, label: string): string[] {
  if (!Array.isArray(value)) {
    throw new Error(`${label} listesi geçersiz.`);
  }

  const output = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (output.length === 0) {
    throw new Error(`${label} için en az bir değer girilmelidir.`);
  }

  return output;
}

function parseInput(payload: unknown): CreateBlogPostInput {
  if (!payload || typeof payload !== "object") {
    throw new Error("Geçersiz istek gövdesi.");
  }

  const body = payload as Record<string, unknown>;

  return {
    title: parseString(body.title, "Başlık"),
    excerpt: parseString(body.excerpt, "Özet"),
    content: parseString(body.content, "İçerik"),
    coverImage: parseString(body.coverImage, "Kapak görseli"),
    authorName: parseString(body.authorName, "Yazar"),
    tags: parseList(body.tags, "Etiket"),
    metaTitle: parseString(body.metaTitle, "SEO başlığı"),
    metaDescription: parseString(body.metaDescription, "SEO açıklaması"),
  };
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canManageBlogs(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { slug } = await params;
  const existing = getBlogPostBySlug(slug);

  if (!existing) {
    return NextResponse.json({ message: "Blog yazısı bulunamadı." }, { status: 404 });
  }

  try {
    const payload = await request.json();
    const input = parseInput(payload);
    const post = updateBlogPostBySlug(slug, input);

    return NextResponse.json({ post });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blog yazısı güncellenemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const user = getUserFromRequest(request);

  if (!user) {
    return NextResponse.json({ message: "Bu işlem için giriş yapmalısınız." }, { status: 401 });
  }

  if (!canManageBlogs(user.role)) {
    return NextResponse.json({ message: "Bu işlem için yetkiniz yok." }, { status: 403 });
  }

  const { slug } = await params;
  const existing = getBlogPostBySlug(slug);

  if (!existing) {
    return NextResponse.json({ message: "Blog yazısı bulunamadı." }, { status: 404 });
  }

  try {
    const post = deleteBlogPostBySlug(slug);
    return NextResponse.json({
      post: {
        id: post.id,
        slug: post.slug,
        title: post.title,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Blog yazısı silinemedi.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
