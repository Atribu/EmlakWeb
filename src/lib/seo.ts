import type { Metadata } from "next";

import { parseBlogContent } from "@/lib/blog-content";
import type { BlogPost, Property } from "@/lib/types";

const defaultTitle = "PortföySatış | Premium Emlak ve Yatırım Portföyleri";
const defaultDescription =
  "İstanbul ve çevresinde satış odaklı premium emlak portföyleri. Harita, randevu ve danışman destekli hızlı teklif süreci.";

export function getBaseUrl(): URL {
  const value = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || "http://localhost:3000";
  return new URL(value);
}

export function baseMetadata(): Metadata {
  const baseUrl = getBaseUrl();

  return {
    metadataBase: baseUrl,
    title: defaultTitle,
    description: defaultDescription,
    keywords: [
      "satılık daire",
      "lüks villa",
      "emlak yatırımı",
      "istanbul emlak",
      "premium emlak",
    ],
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: baseUrl,
      siteName: "PortföySatış",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
    },
    alternates: {
      canonical: "/",
    },
  };
}

export function listingMetadata(property: Property): Metadata {
  const title = `${property.title} | ${property.city} Satılık İlan`;
  const description = `${property.city} ${property.district} bölgesinde ${property.rooms} ${property.type}. ${property.listingRef} kodlu premium portföy.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: property.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [property.coverImage],
    },
    alternates: {
      canonical: `/ilan/${property.slug}`,
    },
  };
}

export function homeListingSchema(properties: Property[]) {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "PortföySatış Premium İlanlar",
    itemListElement: properties.slice(0, 12).map((property, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: `${baseUrl}/ilan/${property.slug}`,
      name: property.title,
    })),
  };
}

export function propertySchema(property: Property) {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description,
    url: `${baseUrl}/ilan/${property.slug}`,
    image: [property.coverImage, ...property.galleryImages],
    identifier: property.listingRef,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.district,
      addressRegion: property.city,
      streetAddress: property.neighborhood,
      addressCountry: "TR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.latitude,
      longitude: property.longitude,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "TRY",
      price: property.price,
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/ilan/${property.slug}`,
    },
  };
}

export function blogMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || `${post.title} | PortföySatış Blog`;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: [{ url: post.coverImage }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [post.coverImage],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export function blogListSchema(posts: BlogPost[]) {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "PortföySatış Blog",
    blogPost: posts.slice(0, 24).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      image: post.coverImage,
      author: {
        "@type": "Person",
        name: post.authorName,
      },
    })),
  };
}

export function blogPostSchema(post: BlogPost) {
  const baseUrl = getBaseUrl().toString().replace(/\/$/, "");
  const bodyText = parseBlogContent(post.content)
    .map((block) => {
      if (block.type === "heading" || block.type === "paragraph" || block.type === "quote") {
        return block.text;
      }

      if (block.type === "list") {
        return block.items.join(" ");
      }

      if (block.type === "cta") {
        return `${block.label} ${block.href}`;
      }

      return `${block.alt} ${block.caption ?? ""}`;
    })
    .join(" ")
    .trim();
  const wordCount = bodyText
    .split(/\s+/g)
    .map((item) => item.trim())
    .filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: [post.coverImage],
    articleBody: bodyText || post.excerpt,
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    inLanguage: "tr-TR",
    wordCount,
    author: {
      "@type": "Person",
      name: post.authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "PortföySatış",
      url: baseUrl,
    },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };
}
