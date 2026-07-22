import type { Metadata } from "next";

import { parseBlogContent } from "@/lib/blog-content";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import type { BlogPost, Property } from "@/lib/types";

const defaultTitle = "RODINA | RODINA Invest Co.";
const defaultDescription =
  "İstanbul ve çevresinde satış odaklı premium emlak portföyleri. Harita, randevu ve danışman destekli hızlı teklif süreci.";

type PublicPageMetadataOptions = {
  title: string;
  description: string;
  canonical: string;
  indexable?: boolean;
};

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
      siteName: "RODINA",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
    },
  };
}

export function publicPageMetadata({
  title,
  description,
  canonical,
  indexable = true,
}: PublicPageMetadataOptions): Metadata {
  return {
    title,
    description,
    alternates: {
      canonical,
    },
    robots: indexable
      ? undefined
      : {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: "RODINA",
      locale: "tr_TR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export function privatePageMetadata(title: string): Metadata {
  return {
    title,
    alternates: {
      canonical: null,
    },
    robots: {
      index: false,
      follow: false,
      noarchive: true,
      googleBot: {
        index: false,
        follow: false,
        noarchive: true,
      },
    },
  };
}

export function missingPageMetadata(title: string): Metadata {
  return {
    ...privatePageMetadata(title),
    description: "Aradığınız içerik bulunamadı veya artık yayında değil.",
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
      url: `/ilan/${property.slug}`,
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
    name: "RODINA Premium İlanlar",
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
      addressCountry: property.country ?? "Türkiye",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.latitude,
      longitude: property.longitude,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: propertyDisplayCurrency(property),
      price: propertyDisplayAmount(property),
      availability: "https://schema.org/InStock",
      url: `${baseUrl}/ilan/${property.slug}`,
    },
  };
}

export function blogMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || `${post.title} | RODINA Invest Co. Blog`;
  const description = post.metaDescription || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${post.slug}`,
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
    name: "RODINA Invest Co. Blog",
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
      name: "RODINA Invest Co.",
      url: baseUrl,
    },
    mainEntityOfPage: `${baseUrl}/blog/${post.slug}`,
    keywords: post.tags.join(", "),
  };
}
