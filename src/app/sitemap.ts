import type { MetadataRoute } from "next";

import { listBlogPosts, listProperties } from "@/lib/data-store";
import { getBaseUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/portfoyler`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/harita`,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/danismanlar`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/hizmetler`,
      changeFrequency: "weekly",
      priority: 0.65,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      changeFrequency: "monthly",
      priority: 0.55,
    },
    {
      url: `${baseUrl}/iletisim`,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/emlak-sat`,
      changeFrequency: "weekly",
      priority: 0.75,
    },
  ];

  const listingRoutes: MetadataRoute.Sitemap = listProperties({ publicationStatus: "Aktif" }).map((property) => ({
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
