export const BLOG_CONTENT_TEMPLATE = `H2: Konunun Genel Çerçevesi
P: Bu bölümde okuyucunun aradığı cevabı ilk 2-3 cümlede net şekilde verin.

H3: Lokasyon ve Bölge Analizi
P: Semt, ulaşım, sosyal yaşam ve yatırım potansiyeli gibi detayları yazın.

UL: Madde 1 | Madde 2 | Madde 3

H4: Fiyat / Değer Karşılaştırması
P: Piyasa ortalaması, m2 değeri ve fırsat noktalarını örneklerle açıklayın.

QUOTE: Uzman görüşü veya veri tabanlı kısa alıntı

H5: Kısa Sonuç ve Aksiyon
P: Okuyucuyu bir sonraki adıma yönlendiren net bir öneri ekleyin.

CTA: Danışmanla Görüş | /iletisim`;

export type BlogBlockTone = "default" | "accent" | "soft";
export type BlogBuilderBlockType = "h2" | "h3" | "h4" | "h5" | "p" | "ul" | "ol" | "quote" | "cta" | "image";

export type BlogBuilderBlock = {
  id: string;
  type: BlogBuilderBlockType;
  tone: BlogBlockTone;
  text: string;
};

export type BlogContentBlock =
  | { type: "heading"; level: 1 | 2 | 3 | 4 | 5; text: string; tone: BlogBlockTone }
  | { type: "paragraph"; text: string; tone: BlogBlockTone }
  | { type: "list"; ordered: boolean; items: string[]; tone: BlogBlockTone }
  | { type: "quote"; text: string; tone: BlogBlockTone }
  | { type: "cta"; label: string; href: string; tone: BlogBlockTone }
  | { type: "image"; src: string; alt: string; caption?: string; tone: BlogBlockTone };

const headingPattern = /^H([1-5])(?:\|([a-z]+))?\s*:\s*([\s\S]+)$/i;
const paragraphPattern = /^P(?:\|([a-z]+))?\s*:\s*([\s\S]+)$/i;
const ulPattern = /^UL(?:\|([a-z]+))?\s*:\s*([\s\S]+)$/i;
const olPattern = /^OL(?:\|([a-z]+))?\s*:\s*([\s\S]+)$/i;
const quotePattern = /^QUOTE(?:\|([a-z]+))?\s*:\s*([\s\S]+)$/i;
const ctaPattern = /^CTA(?:\|([a-z]+))?\s*:\s*([^|]+?)\s*\|\s*([\s\S]+)$/i;
const imagePattern = /^IMG(?:\|([a-z]+))?\s*:\s*([^|]+?)\s*\|\s*([^|]+?)(?:\s*\|\s*([\s\S]+))?$/i;

function normalizeTone(value: string | undefined): BlogBlockTone {
  if (value === "accent" || value === "soft") {
    return value;
  }

  return "default";
}

export function createBlogBuilderBlock(type: BlogBuilderBlockType = "p"): BlogBuilderBlock {
  return {
    id: crypto.randomUUID(),
    type,
    tone: "default",
    text: "",
  };
}

export function defaultBlogBuilderBlocks(): BlogBuilderBlock[] {
  return [
    { id: crypto.randomUUID(), type: "h2", tone: "default", text: "Konunun Genel Çerçevesi" },
    {
      id: crypto.randomUUID(),
      type: "p",
      tone: "default",
      text: "Bu bölümde okuyucunun aradığı cevabı ilk 2-3 cümlede net şekilde verin.",
    },
    {
      id: crypto.randomUUID(),
      type: "ul",
      tone: "soft",
      text: "Lokasyon avantajı\nYatırım geri dönüşü\nFiyat karşılaştırması",
    },
  ];
}

export function parseListBuilderText(text: string): string[] {
  return text
    .split(/\n+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseCtaBuilderText(text: string): { label: string; href: string } {
  const lines = text
    .split(/\n+/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return { label: lines[0], href: lines[1] };
  }

  const [label = "", href = ""] = text
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  return { label, href };
}

export function parseImageBuilderText(text: string): { src: string; alt: string; caption: string } {
  const lines = text
    .split(/\n+/g)
    .map((item) => item.trim())
    .filter(Boolean);

  if (lines.length >= 2) {
    return {
      src: lines[0],
      alt: lines[1],
      caption: lines.slice(2).join(" "),
    };
  }

  const [src = "", alt = "", caption = ""] = text.split("|").map((item) => item.trim());
  return { src, alt, caption };
}

function parsePipeList(value: string): string[] {
  return value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function parseBlogContent(content: string): BlogContentBlock[] {
  const blocks = content
    .split(/\n\s*\n/g)
    .map((item) => item.trim())
    .filter(Boolean);

  return blocks.map((block) => {
    const headingMatch = block.match(headingPattern);
    if (headingMatch) {
      const level = Number(headingMatch[1]) as 1 | 2 | 3 | 4 | 5;
      const tone = normalizeTone(headingMatch[2]?.trim().toLowerCase());
      const text = headingMatch[3]?.trim() ?? "";
      return { type: "heading", level, text, tone };
    }

    const ulMatch = block.match(ulPattern);
    if (ulMatch) {
      const tone = normalizeTone(ulMatch[1]?.trim().toLowerCase());
      const items = parsePipeList(ulMatch[2] ?? "");
      if (items.length > 0) {
        return { type: "list", ordered: false, items, tone };
      }
    }

    const olMatch = block.match(olPattern);
    if (olMatch) {
      const tone = normalizeTone(olMatch[1]?.trim().toLowerCase());
      const items = parsePipeList(olMatch[2] ?? "");
      if (items.length > 0) {
        return { type: "list", ordered: true, items, tone };
      }
    }

    const quoteMatch = block.match(quotePattern);
    if (quoteMatch) {
      const tone = normalizeTone(quoteMatch[1]?.trim().toLowerCase());
      const text = quoteMatch[2]?.trim() ?? "";
      return { type: "quote", text, tone };
    }

    const ctaMatch = block.match(ctaPattern);
    if (ctaMatch) {
      const tone = normalizeTone(ctaMatch[1]?.trim().toLowerCase());
      const label = ctaMatch[2]?.trim() ?? "";
      const href = ctaMatch[3]?.trim() ?? "";
      if (label && href) {
        return { type: "cta", label, href, tone };
      }
    }

    const imageMatch = block.match(imagePattern);
    if (imageMatch) {
      const tone = normalizeTone(imageMatch[1]?.trim().toLowerCase());
      const src = imageMatch[2]?.trim() ?? "";
      const alt = imageMatch[3]?.trim() ?? "";
      const caption = imageMatch[4]?.trim() ?? "";
      if (src && alt) {
        return { type: "image", src, alt, caption: caption || undefined, tone };
      }
    }

    const paragraphMatch = block.match(paragraphPattern);
    if (paragraphMatch) {
      const tone = normalizeTone(paragraphMatch[1]?.trim().toLowerCase());
      const text = paragraphMatch[2]?.trim() ?? "";
      return { type: "paragraph", text, tone };
    }

    return { type: "paragraph", text: block, tone: "default" };
  });
}

export function contentToBuilderBlocks(content: string): BlogBuilderBlock[] {
  const parsed = parseBlogContent(content);

  if (parsed.length === 0) {
    return defaultBlogBuilderBlocks();
  }

  return parsed.map((block) => {
    if (block.type === "heading") {
      return {
        id: crypto.randomUUID(),
        type: `h${block.level}` as BlogBuilderBlockType,
        tone: block.tone,
        text: block.text,
      };
    }

    if (block.type === "paragraph") {
      return {
        id: crypto.randomUUID(),
        type: "p",
        tone: block.tone,
        text: block.text,
      };
    }

    if (block.type === "list") {
      return {
        id: crypto.randomUUID(),
        type: block.ordered ? "ol" : "ul",
        tone: block.tone,
        text: block.items.join("\n"),
      };
    }

    if (block.type === "quote") {
      return {
        id: crypto.randomUUID(),
        type: "quote",
        tone: block.tone,
        text: block.text,
      };
    }

    if (block.type === "cta") {
      return {
        id: crypto.randomUUID(),
        type: "cta",
        tone: block.tone,
        text: `${block.label}\n${block.href}`,
      };
    }

    return {
      id: crypto.randomUUID(),
      type: "image",
      tone: block.tone,
      text: `${block.src}\n${block.alt}${block.caption ? `\n${block.caption}` : ""}`,
    };
  });
}

export function builderBlocksToContent(blocks: BlogBuilderBlock[]): string {
  return blocks
    .map((block) => {
      const text = block.text.trim();
      if (!text) {
        return "";
      }

      const tonePart = block.tone === "default" ? "" : `|${block.tone}`;

      if (block.type === "p") {
        return `P${tonePart}: ${text}`;
      }

      if (block.type === "ul" || block.type === "ol") {
        const items = parseListBuilderText(text);
        if (items.length === 0) {
          return "";
        }

        return `${block.type.toUpperCase()}${tonePart}: ${items.join(" | ")}`;
      }

      if (block.type === "quote") {
        return `QUOTE${tonePart}: ${text}`;
      }

      if (block.type === "cta") {
        const cta = parseCtaBuilderText(text);
        if (!cta.label || !cta.href) {
          return "";
        }

        return `CTA${tonePart}: ${cta.label} | ${cta.href}`;
      }

      if (block.type === "image") {
        const image = parseImageBuilderText(text);
        if (!image.src || !image.alt) {
          return "";
        }

        return `IMG${tonePart}: ${image.src} | ${image.alt}${image.caption ? ` | ${image.caption}` : ""}`;
      }

      const level = block.type.toUpperCase();
      return `${level}${tonePart}: ${text}`;
    })
    .filter(Boolean)
    .join("\n\n");
}
