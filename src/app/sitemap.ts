import type { MetadataRoute } from "next";

import { listBlogPosts, listProperties } from "@/lib/data-store";
import { getBaseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/portfoyler`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/harita`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/danismanlar`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hizmetler`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/iletisim`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/yetkili-giris`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listProperties().map((property) => ({
    url: `${baseUrl}/ilan/${property.slug}`,
    lastModified: new Date(property.publishedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = listBlogPosts().map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.publishedAt),
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...listingRoutes, ...blogRoutes];
}
