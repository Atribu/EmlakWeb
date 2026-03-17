import fs from "node:fs";
import path from "node:path";

import { initialAdvisors, initialBlogPosts, initialProperties, initialUsers } from "@/lib/mock-data";
import { pickSampleImageSet } from "@/lib/sample-images";
import type {
  Advisor,
  BlogPost,
  ContactLead,
  CreateAdvisorInput,
  CreateBlogPostInput,
  CreateLeadInput,
  CreatePropertyInput,
  LeadStage,
  Property,
  PropertyFilter,
  SafeUser,
  User,
} from "@/lib/types";

const cityNormalizer: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
};

const store = {
  advisors: [...initialAdvisors],
  properties: [...initialProperties],
  blogPosts: [...initialBlogPosts],
  users: [...initialUsers],
  leads: [] as ContactLead[],
};

const demoDataDir = path.join(process.cwd(), ".demo-data");
const blogStorePath = path.join(demoDataDir, "blog-posts.json");

function ensureDemoDataDir() {
  if (!fs.existsSync(demoDataDir)) {
    fs.mkdirSync(demoDataDir, { recursive: true });
  }
}

function writeBlogPostsToDisk(posts: BlogPost[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(blogStorePath, JSON.stringify(posts, null, 2), "utf-8");
  } catch (error) {
    console.error("[demo-blog-store-write-error]", error);
  }
}

function readBlogPostsFromDisk(): BlogPost[] | null {
  try {
    if (!fs.existsSync(blogStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(blogStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const valid = parsed.filter((item) => item && typeof item === "object") as BlogPost[];
    return valid;
  } catch (error) {
    console.error("[demo-blog-store-read-error]", error);
    return null;
  }
}

function syncBlogPostsFromDisk() {
  const diskPosts = readBlogPostsFromDisk();

  if (diskPosts && diskPosts.length > 0) {
    store.blogPosts = diskPosts;
    return;
  }

  if (!fs.existsSync(blogStorePath)) {
    writeBlogPostsToDisk(store.blogPosts);
  }
}

const validLeadStages: LeadStage[] = [
  "new",
  "called",
  "appointment_scheduled",
  "offer_submitted",
  "won",
  "lost",
];

const cityCenterLookup: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Izmir: [38.4237, 27.1428],
  İzmir: [38.4237, 27.1428],
  Ankara: [39.9334, 32.8597],
  Antalya: [36.8969, 30.7133],
  Bursa: [40.1885, 29.061],
};

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    name: user.name,
    role: user.role,
    email: user.email,
    phone: user.phone,
    username: user.username,
    advisorId: user.advisorId,
  };
}

function normalizeText(value: string): string {
  return value
    .toLocaleLowerCase("tr")
    .replace(/ç|ğ|ı|ö|ş|ü/g, (char) => cityNormalizer[char[0]] ?? char[0])
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

function createSlug(value: string): string {
  return normalizeText(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
}

function nextListingRef(): string {
  const sequence = store.properties.length + 1;
  return `PN-${String(sequence).padStart(4, "0")}`;
}

function uniqueSlug(base: string): string {
  const existing = new Set(store.properties.map((property) => property.slug));
  if (!existing.has(base)) {
    return base;
  }

  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) {
    cursor += 1;
  }

  return `${base}-${cursor}`;
}

function uniqueBlogSlug(base: string): string {
  const existing = new Set(store.blogPosts.map((post) => post.slug));
  if (!existing.has(base)) {
    return base;
  }

  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) {
    cursor += 1;
  }

  return `${base}-${cursor}`;
}

function inferCoordinates(input: CreatePropertyInput): { latitude: number; longitude: number } {
  if (
    typeof input.latitude === "number" &&
    Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" &&
    Number.isFinite(input.longitude)
  ) {
    return { latitude: input.latitude, longitude: input.longitude };
  }

  const center =
    cityCenterLookup[input.city] ??
    cityCenterLookup[input.city.replace("İ", "I")] ??
    cityCenterLookup.İstanbul;

  const offsetIndex = store.properties.length % 7;
  const latitudeOffset = (offsetIndex - 3) * 0.0052;
  const longitudeOffset = (offsetIndex - 3) * 0.0041;

  return {
    latitude: Number((center[0] + latitudeOffset).toFixed(6)),
    longitude: Number((center[1] + longitudeOffset).toFixed(6)),
  };
}

export function listAdvisors(): Advisor[] {
  return [...store.advisors];
}

export function getAdvisorById(advisorId: string): Advisor | undefined {
  return store.advisors.find((advisor) => advisor.id === advisorId);
}

function advisorUsage(advisorId: string): { propertyCount: number; linkedUserCount: number } {
  return {
    propertyCount: store.properties.filter((property) => property.advisorId === advisorId).length,
    linkedUserCount: store.users.filter((user) => user.advisorId === advisorId).length,
  };
}

export function createAdvisor(input: CreateAdvisorInput): Advisor {
  const name = input.name.trim();
  const title = input.title.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const focusArea = input.focusArea.trim();

  if (!name || !title || !phone || !whatsapp || !email || !focusArea) {
    throw new Error("Danışman alanları eksik.");
  }

  const hasSameEmail = store.advisors.some(
    (advisor) => advisor.email.toLocaleLowerCase("tr") === email,
  );
  if (hasSameEmail) {
    throw new Error("Bu e-posta ile kayıtlı bir danışman zaten var.");
  }

  const advisor: Advisor = {
    id: `adv-${crypto.randomUUID()}`,
    name,
    title,
    phone,
    whatsapp,
    email,
    focusArea,
  };

  store.advisors.unshift(advisor);
  return advisor;
}

export function updateAdvisorById(advisorId: string, input: CreateAdvisorInput): Advisor {
  const advisor = getAdvisorById(advisorId);
  if (!advisor) {
    throw new Error("Danışman bulunamadı.");
  }

  const name = input.name.trim();
  const title = input.title.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const focusArea = input.focusArea.trim();

  if (!name || !title || !phone || !whatsapp || !email || !focusArea) {
    throw new Error("Danışman alanları eksik.");
  }

  const hasSameEmail = store.advisors.some(
    (item) => item.id !== advisorId && item.email.toLocaleLowerCase("tr") === email,
  );
  if (hasSameEmail) {
    throw new Error("Bu e-posta başka bir danışmana ait.");
  }

  advisor.name = name;
  advisor.title = title;
  advisor.phone = phone;
  advisor.whatsapp = whatsapp;
  advisor.email = email;
  advisor.focusArea = focusArea;

  return advisor;
}

export function deleteAdvisor(advisorId: string): Advisor {
  const advisorIndex = store.advisors.findIndex((advisor) => advisor.id === advisorId);
  if (advisorIndex === -1) {
    throw new Error("Danışman bulunamadı.");
  }

  const usage = advisorUsage(advisorId);
  if (usage.propertyCount > 0) {
    throw new Error(
      `Bu danışmana bağlı ${usage.propertyCount} portföy var. Önce portföyleri başka danışmana taşıyın.`,
    );
  }

  if (usage.linkedUserCount > 0) {
    throw new Error(
      `Bu danışmana bağlı ${usage.linkedUserCount} kullanıcı hesabı var. Önce kullanıcı bağlantısını kaldırın.`,
    );
  }

  const [removed] = store.advisors.splice(advisorIndex, 1);
  return removed;
}

export function listProperties(filter: PropertyFilter = {}): Property[] {
  const query = filter.query ? normalizeText(filter.query) : "";

  return store.properties
    .filter((property) => {
      if (filter.city && property.city !== filter.city) {
        return false;
      }

      if (filter.type && property.type !== filter.type) {
        return false;
      }

      if (typeof filter.minPrice === "number" && property.price < filter.minPrice) {
        return false;
      }

      if (typeof filter.maxPrice === "number" && property.price > filter.maxPrice) {
        return false;
      }

      if (filter.rooms && property.rooms !== filter.rooms) {
        return false;
      }

      if (filter.advisorId && property.advisorId !== filter.advisorId) {
        return false;
      }

      if (!query) {
        return true;
      }

      const haystack = normalizeText(
        [
          property.title,
          property.city,
          property.district,
          property.neighborhood,
          property.listingRef,
        ].join(" "),
      );

      return haystack.includes(query);
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getPropertyBySlug(slug: string): Property | undefined {
  return store.properties.find((property) => property.slug === slug);
}

export function createProperty(input: CreatePropertyInput, actorId: string): Property {
  const advisor = getAdvisorById(input.advisorId);
  if (!advisor) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const sampleSet = pickSampleImageSet(store.properties.length + 1);
  const baseSlug = createSlug(input.title);
  const location = inferCoordinates(input);
  const property: Property = {
    ...input,
    latitude: location.latitude,
    longitude: location.longitude,
    coverImage: input.coverImage || sampleSet.cover,
    galleryImages:
      input.galleryImages && input.galleryImages.length > 0
        ? input.galleryImages
        : sampleSet.gallery,
    id: `prp-${crypto.randomUUID()}`,
    slug: uniqueSlug(baseSlug),
    listingRef: nextListingRef(),
    publishedAt: new Date().toISOString(),
  };

  store.properties.unshift(property);

  // Demo store keeps local state only while server process is alive.
  void actorId;

  return property;
}

export function updatePropertyBySlug(slug: string, input: CreatePropertyInput): Property {
  const property = getPropertyBySlug(slug);
  if (!property) {
    throw new Error("Portföy bulunamadı.");
  }

  const advisor = getAdvisorById(input.advisorId);
  if (!advisor) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const location = inferCoordinates({
    ...input,
    latitude: input.latitude ?? property.latitude,
    longitude: input.longitude ?? property.longitude,
  });

  property.title = input.title.trim();
  property.city = input.city.trim();
  property.district = input.district.trim();
  property.neighborhood = input.neighborhood.trim();
  property.type = input.type;
  property.price = input.price;
  property.rooms = input.rooms.trim();
  property.areaM2 = input.areaM2;
  property.floor = input.floor.trim();
  property.heating = input.heating.trim();
  property.description = input.description.trim();
  property.highlights = input.highlights;
  property.features = input.features;
  property.advisorId = input.advisorId;
  property.latitude = location.latitude;
  property.longitude = location.longitude;
  property.coverColor = input.coverColor;
  property.coverImage = input.coverImage || property.coverImage;
  property.galleryImages = input.galleryImages.length > 0 ? input.galleryImages : property.galleryImages;
  property.imageLabels = input.imageLabels.length > 0 ? input.imageLabels : property.imageLabels;

  return property;
}

export function listCities(): string[] {
  return Array.from(new Set(store.properties.map((property) => property.city))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function listTypes(): string[] {
  return Array.from(new Set(store.properties.map((property) => property.type))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function listRoomOptions(): string[] {
  return Array.from(new Set(store.properties.map((property) => property.rooms))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function authenticateUser(username: string, password: string): SafeUser | null {
  const user = store.users.find(
    (candidate) =>
      candidate.username.toLocaleLowerCase("tr") === username.toLocaleLowerCase("tr") &&
      candidate.password === password,
  );

  return user ? toSafeUser(user) : null;
}

export function getUserById(userId: string): SafeUser | null {
  const user = store.users.find((candidate) => candidate.id === userId);
  return user ? toSafeUser(user) : null;
}

export function listUsers(): SafeUser[] {
  return store.users.map(toSafeUser);
}

export function createLead(input: CreateLeadInput): ContactLead {
  const stage = input.stage ?? "new";
  if (!validLeadStages.includes(stage)) {
    throw new Error("Geçersiz lead aşaması.");
  }

  const now = new Date().toISOString();
  const lead: ContactLead = {
    ...input,
    source: input.source ?? "contact_form",
    stage,
    id: `lead-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  store.leads.unshift(lead);
  return lead;
}

export function listBlogPosts(): BlogPost[] {
  syncBlogPostsFromDisk();
  return [...store.blogPosts].sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  syncBlogPostsFromDisk();
  return store.blogPosts.find((post) => post.slug === slug);
}

export function createBlogPost(input: CreateBlogPostInput): BlogPost {
  syncBlogPostsFromDisk();
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }

  if (tags.length === 0) {
    throw new Error("En az bir etiket girilmelidir.");
  }

  const post: BlogPost = {
    id: `blog-${crypto.randomUUID()}`,
    slug: uniqueBlogSlug(createSlug(title)),
    title,
    excerpt,
    content,
    coverImage,
    authorName,
    tags,
    metaTitle,
    metaDescription,
    publishedAt: new Date().toISOString(),
  };

  store.blogPosts.unshift(post);
  writeBlogPostsToDisk(store.blogPosts);
  return post;
}

export function updateBlogPostBySlug(slug: string, input: CreateBlogPostInput): BlogPost {
  syncBlogPostsFromDisk();
  const post = getBlogPostBySlug(slug);
  if (!post) {
    throw new Error("Blog yazısı bulunamadı.");
  }

  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((tag) => tag.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }

  if (tags.length === 0) {
    throw new Error("En az bir etiket girilmelidir.");
  }

  post.title = title;
  post.excerpt = excerpt;
  post.content = content;
  post.coverImage = coverImage;
  post.authorName = authorName;
  post.tags = tags;
  post.metaTitle = metaTitle;
  post.metaDescription = metaDescription;
  writeBlogPostsToDisk(store.blogPosts);

  return post;
}

export function listLeads(): ContactLead[] {
  return [...store.leads].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function getLeadById(leadId: string): ContactLead | undefined {
  return store.leads.find((lead) => lead.id === leadId);
}

export function updateLeadStage(input: {
  leadId: string;
  stage: LeadStage;
  pipelineNote?: string;
}): ContactLead {
  if (!validLeadStages.includes(input.stage)) {
    throw new Error("Geçersiz lead aşaması.");
  }

  const lead = getLeadById(input.leadId);
  if (!lead) {
    throw new Error("Lead bulunamadı.");
  }

  lead.stage = input.stage;
  if (typeof input.pipelineNote === "string") {
    lead.pipelineNote = input.pipelineNote.trim() || undefined;
  }
  lead.updatedAt = new Date().toISOString();

  return lead;
}

export function leadStageSummary() {
  const summary: Record<LeadStage, number> = {
    new: 0,
    called: 0,
    appointment_scheduled: 0,
    offer_submitted: 0,
    won: 0,
    lost: 0,
  };

  for (const lead of store.leads) {
    summary[lead.stage] += 1;
  }

  return summary;
}

export function dashboardSummary() {
  return {
    propertyCount: store.properties.length,
    blogCount: store.blogPosts.length,
    advisorCount: store.advisors.length,
    leadCount: store.leads.length,
    cityCount: new Set(store.properties.map((property) => property.city)).size,
  };
}
