import type { Metadata } from "next";

import { parseBlogContent } from "@/lib/blog-content";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import type { BlogPost, Property } from "@/lib/types";

export const BRAND_NAME = "RODINA Invest Co.";
export const SHORT_BRAND_NAME = "RODINA";
export const BRAND_LOGO_PATH = "/brand/rodina-logo.webp";
export const BRAND_PHONE_DISPLAY = "+90 532 123 45 67";
export const BRAND_PHONE_SCHEMA = "+905321234567";
export const BRAND_EMAIL = "info@rodinainvest.com";
export const BRAND_SOCIAL_LINKS = ["https://instagram.com/rodinainvest", "https://t.me/rodinainvest"];

const defaultTitle = "RODINA | RODINA Invest Co.";
const defaultDescription =
  "İstanbul, Antalya ve Ege hattında premium satılık daire, villa ve yatırım portföyleri. RODINA Invest Co. ile danışman destekli emlak deneyimi.";

type BreadcrumbSchemaItem = {
  name: string;
  path: string;
};

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

export function getBaseUrlString(): string {
  return getBaseUrl().toString().replace(/\/$/, "");
}

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  return new URL(pathOrUrl.startsWith("/") ? pathOrUrl : `/${pathOrUrl}`, getBaseUrl()).toString();
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function baseMetadata(): Metadata {
  const baseUrl = getBaseUrl();
  const logoUrl = absoluteUrl(BRAND_LOGO_PATH);

  return {
    metadataBase: baseUrl,
    title: defaultTitle,
    description: defaultDescription,
    applicationName: BRAND_NAME,
    keywords: [
      "satılık daire",
      "lüks villa",
      "emlak yatırımı",
      "istanbul emlak",
      "premium emlak",
      "rodina invest",
      "rodina emlak",
    ],
    openGraph: {
      title: defaultTitle,
      description: defaultDescription,
      url: baseUrl,
      siteName: SHORT_BRAND_NAME,
      locale: "tr_TR",
      type: "website",
      images: [{ url: logoUrl, alt: BRAND_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: defaultTitle,
      description: defaultDescription,
      images: [logoUrl],
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
      siteName: SHORT_BRAND_NAME,
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
  const coverImage = absoluteUrl(property.coverImage);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/ilan/${property.slug}`,
      images: [{ url: coverImage, alt: property.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
    alternates: {
      canonical: `/ilan/${property.slug}`,
    },
  };
}

export function homeListingSchema(properties: Property[]) {
  const baseUrl = getBaseUrlString();

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${SHORT_BRAND_NAME} Premium İlanlar`,
    itemListElement: properties.slice(0, 12).map((property, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "RealEstateListing",
        "@id": `${baseUrl}/ilan/${property.slug}#listing`,
        url: `${baseUrl}/ilan/${property.slug}`,
        name: property.title,
        image: absoluteUrl(property.coverImage),
      },
    })),
  };
}

export function propertySchema(property: Property) {
  const baseUrl = getBaseUrlString();
  const listingUrl = `${baseUrl}/ilan/${property.slug}`;
  const imageUrls = uniqueValues([property.coverImage, ...property.galleryImages].map(absoluteUrl));

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    "@id": `${listingUrl}#listing`,
    name: property.title,
    description: property.description,
    url: listingUrl,
    mainEntityOfPage: listingUrl,
    image: imageUrls,
    identifier: property.listingRef,
    address: {
      "@type": "PostalAddress",
      addressLocality: property.district,
      addressRegion: property.city,
      streetAddress: property.neighborhood,
      addressCountry: property.country ?? "Türkiye",
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.areaM2,
      unitCode: "MTK",
    },
    numberOfRooms: property.rooms,
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
      url: listingUrl,
      seller: {
        "@id": `${baseUrl}/#organization`,
      },
    },
    seller: {
      "@id": `${baseUrl}/#organization`,
    },
  };
}

export function blogMetadata(post: BlogPost): Metadata {
  const title = post.metaTitle || `${post.title} | ${BRAND_NAME} Blog`;
  const description = post.metaDescription || post.excerpt;
  const coverImage = absoluteUrl(post.coverImage);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      url: `/blog/${post.slug}`,
      images: [{ url: coverImage, alt: post.title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [coverImage],
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export function blogListSchema(posts: BlogPost[]) {
  const baseUrl = getBaseUrlString();

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${baseUrl}/blog#blog`,
    name: `${BRAND_NAME} Blog`,
    url: `${baseUrl}/blog`,
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    blogPost: posts.slice(0, 24).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: `${baseUrl}/blog/${post.slug}`,
      datePublished: post.publishedAt,
      image: absoluteUrl(post.coverImage),
      author: {
        "@type": "Person",
        name: post.authorName,
      },
    })),
  };
}

export function blogPostSchema(post: BlogPost) {
  const baseUrl = getBaseUrlString();
  const postUrl = `${baseUrl}/blog/${post.slug}`;
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
    "@id": `${postUrl}#blog-post`,
    headline: post.title,
    description: post.excerpt,
    image: [absoluteUrl(post.coverImage)],
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
      "@id": `${baseUrl}/#organization`,
    },
    mainEntityOfPage: postUrl,
    keywords: post.tags.join(", "),
  };
}

export function organizationSchema() {
  const baseUrl = getBaseUrlString();
  const logoUrl = absoluteUrl(BRAND_LOGO_PATH);

  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "@id": `${baseUrl}/#organization`,
    name: BRAND_NAME,
    alternateName: SHORT_BRAND_NAME,
    url: `${baseUrl}/`,
    logo: logoUrl,
    image: logoUrl,
    telephone: BRAND_PHONE_SCHEMA,
    email: BRAND_EMAIL,
    priceRange: "$$$",
    areaServed: [
      { "@type": "Country", name: "Türkiye" },
      { "@type": "City", name: "İstanbul" },
      { "@type": "City", name: "Antalya" },
      { "@type": "City", name: "İzmir" },
    ],
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: BRAND_PHONE_SCHEMA,
        contactType: "sales",
        areaServed: "TR",
        availableLanguage: ["Turkish", "English", "Russian", "Arabic"],
      },
    ],
    sameAs: BRAND_SOCIAL_LINKS,
  };
}

export function websiteSchema() {
  const baseUrl = getBaseUrlString();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    name: BRAND_NAME,
    alternateName: SHORT_BRAND_NAME,
    url: `${baseUrl}/`,
    inLanguage: "tr-TR",
    publisher: {
      "@id": `${baseUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/portfoyler?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: BreadcrumbSchemaItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
