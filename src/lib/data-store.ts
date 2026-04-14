import fs from "node:fs";
import path from "node:path";

import { initialAdvisors, initialBlogPosts, initialProperties, initialUsers } from "@/lib/mock-data";
import { sanitizePropertyTranslations } from "@/lib/property-content";
import { pickSampleAdvisorImageForSeed } from "@/lib/sample-advisor-images";
import { pickSampleImageSet } from "@/lib/sample-images";
import type {
  Advisor,
  BlogPost,
  ContactLead,
  CreateAdvisorInput,
  CreateBlogPostInput,
  CreateLeadInput,
  CreatePropertyInput,
  CreateSellerLeadInput,
  CreateUserInput,
  LeadStage,
  Property,
  PropertyFilter,
  SafeUser,
  SellerLead,
  User,
  UserRole,
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
  sellerLeads: [] as SellerLead[],
};

const demoDataDir = path.join(process.cwd(), ".demo-data");
const advisorStorePath = path.join(demoDataDir, "advisors.json");
const propertyStorePath = path.join(demoDataDir, "properties.json");
const blogStorePath = path.join(demoDataDir, "blog-posts.json");
const userStorePath = path.join(demoDataDir, "users.json");
const leadStorePath = path.join(demoDataDir, "leads.json");
const sellerLeadStorePath = path.join(demoDataDir, "seller-leads.json");

type DiskCacheKey = "advisors" | "properties" | "blogPosts" | "users" | "leads" | "sellerLeads";

const diskCacheState: Record<DiskCacheKey, { initialized: boolean; mtimeMs: number | null }> = {
  advisors: { initialized: false, mtimeMs: null },
  properties: { initialized: false, mtimeMs: null },
  blogPosts: { initialized: false, mtimeMs: null },
  users: { initialized: false, mtimeMs: null },
  leads: { initialized: false, mtimeMs: null },
  sellerLeads: { initialized: false, mtimeMs: null },
};

function fileMtimeMs(filePath: string): number | null {
  try {
    return fs.statSync(filePath).mtimeMs;
  } catch {
    return null;
  }
}

function hasDiskResourceChanged(key: DiskCacheKey, filePath: string): boolean {
  const nextMtimeMs = fileMtimeMs(filePath);
  const cache = diskCacheState[key];
  const changed = !cache.initialized || cache.mtimeMs !== nextMtimeMs;
  cache.initialized = true;
  cache.mtimeMs = nextMtimeMs;
  return changed;
}

function rememberDiskResourceState(key: DiskCacheKey, filePath: string) {
  diskCacheState[key].initialized = true;
  diskCacheState[key].mtimeMs = fileMtimeMs(filePath);
}

function ensureDemoDataDir() {
  if (!fs.existsSync(demoDataDir)) {
    fs.mkdirSync(demoDataDir, { recursive: true });
  }
}

function writeBlogPostsToDisk(posts: BlogPost[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(blogStorePath, JSON.stringify(posts, null, 2), "utf-8");
    rememberDiskResourceState("blogPosts", blogStorePath);
  } catch (error) {
    console.error("[demo-blog-store-write-error]", error);
  }
}

function writeAdvisorsToDisk(advisors: Advisor[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(advisorStorePath, JSON.stringify(advisors, null, 2), "utf-8");
    rememberDiskResourceState("advisors", advisorStorePath);
  } catch (error) {
    console.error("[demo-advisor-store-write-error]", error);
  }
}

function writePropertiesToDisk(properties: Property[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(propertyStorePath, JSON.stringify(properties, null, 2), "utf-8");
    rememberDiskResourceState("properties", propertyStorePath);
  } catch (error) {
    console.error("[demo-property-store-write-error]", error);
  }
}

function writeUsersToDisk(users: User[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(userStorePath, JSON.stringify(users, null, 2), "utf-8");
    rememberDiskResourceState("users", userStorePath);
  } catch (error) {
    console.error("[demo-user-store-write-error]", error);
  }
}

function writeLeadsToDisk(leads: ContactLead[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(leadStorePath, JSON.stringify(leads, null, 2), "utf-8");
    rememberDiskResourceState("leads", leadStorePath);
  } catch (error) {
    console.error("[demo-lead-store-write-error]", error);
  }
}

function writeSellerLeadsToDisk(sellerLeads: SellerLead[]) {
  try {
    ensureDemoDataDir();
    fs.writeFileSync(sellerLeadStorePath, JSON.stringify(sellerLeads, null, 2), "utf-8");
    rememberDiskResourceState("sellerLeads", sellerLeadStorePath);
  } catch (error) {
    console.error("[demo-seller-lead-store-write-error]", error);
  }
}

function readPropertiesFromDisk(): Property[] | null {
  try {
    if (!fs.existsSync(propertyStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(propertyStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const valid = parsed.filter((item) => item && typeof item === "object") as Property[];
    return valid;
  } catch (error) {
    console.error("[demo-property-store-read-error]", error);
    return null;
  }
}

function readAdvisorsFromDisk(): Advisor[] | null {
  try {
    if (!fs.existsSync(advisorStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(advisorStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    const valid = parsed
      .filter((item) => item && typeof item === "object")
      .map((item, index) => {
        const advisor = item as Advisor & { image?: string };
        return {
          ...advisor,
          image:
            typeof advisor.image === "string" && advisor.image.trim()
              ? advisor.image.trim()
              : pickSampleAdvisorImageForSeed(`${advisor.id ?? advisor.email ?? index}`),
        } satisfies Advisor;
      });
    return valid;
  } catch (error) {
    console.error("[demo-advisor-store-read-error]", error);
    return null;
  }
}

function normalizeStoredUserRole(role: unknown): UserRole {
  if (
    role === "portal_admin" ||
    role === "admin" ||
    role === "portfolio_manager" ||
    role === "advisor" ||
    role === "editor"
  ) {
    return role;
  }

  return "editor";
}

function readUsersFromDisk(): User[] | null {
  try {
    if (!fs.existsSync(userStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(userStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed
      .filter((item) => item && typeof item === "object")
      .map((item, index) => {
        const user = item as Partial<User> & { role?: unknown };
        const email =
          typeof user.email === "string" && user.email.trim()
            ? user.email.trim().toLocaleLowerCase("tr")
            : `kullanici-${index + 1}@ornek.com`;

        return {
          id: typeof user.id === "string" && user.id.trim() ? user.id.trim() : `usr-${crypto.randomUUID()}`,
          name: typeof user.name === "string" && user.name.trim() ? user.name.trim() : `Kullanıcı ${index + 1}`,
          role: normalizeStoredUserRole(user.role),
          email,
          phone: typeof user.phone === "string" ? user.phone.trim() : "",
          username:
            typeof user.username === "string" && user.username.trim()
              ? user.username.trim()
              : email,
          password: typeof user.password === "string" ? user.password : "",
          advisorId:
            typeof user.advisorId === "string" && user.advisorId.trim()
              ? user.advisorId.trim()
              : undefined,
        } satisfies User;
      });
  } catch (error) {
    console.error("[demo-user-store-read-error]", error);
    return null;
  }
}

function syncAdvisorsFromDisk() {
  if (!hasDiskResourceChanged("advisors", advisorStorePath)) {
    return;
  }

  const diskAdvisors = readAdvisorsFromDisk();

  if (diskAdvisors) {
    store.advisors = diskAdvisors;
    return;
  }

  if (!fs.existsSync(advisorStorePath)) {
    writeAdvisorsToDisk(store.advisors);
  }
}

function syncUsersFromDisk() {
  if (!hasDiskResourceChanged("users", userStorePath)) {
    return;
  }

  const diskUsers = readUsersFromDisk();

  if (diskUsers) {
    store.users = diskUsers;
    return;
  }

  if (!fs.existsSync(userStorePath)) {
    writeUsersToDisk(store.users);
  }
}

function readLeadsFromDisk(): ContactLead[] | null {
  try {
    if (!fs.existsSync(leadStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(leadStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter((item) => item && typeof item === "object") as ContactLead[];
  } catch (error) {
    console.error("[demo-lead-store-read-error]", error);
    return null;
  }
}

function readSellerLeadsFromDisk(): SellerLead[] | null {
  try {
    if (!fs.existsSync(sellerLeadStorePath)) {
      return null;
    }

    const raw = fs.readFileSync(sellerLeadStorePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!Array.isArray(parsed)) {
      return null;
    }

    return parsed.filter((item) => item && typeof item === "object") as SellerLead[];
  } catch (error) {
    console.error("[demo-seller-lead-store-read-error]", error);
    return null;
  }
}

function syncLeadsFromDisk() {
  if (!hasDiskResourceChanged("leads", leadStorePath)) {
    return;
  }

  const diskLeads = readLeadsFromDisk();

  if (diskLeads) {
    store.leads = diskLeads;
    return;
  }

  if (!fs.existsSync(leadStorePath)) {
    writeLeadsToDisk(store.leads);
  }
}

function syncSellerLeadsFromDisk() {
  if (!hasDiskResourceChanged("sellerLeads", sellerLeadStorePath)) {
    return;
  }

  const diskSellerLeads = readSellerLeadsFromDisk();

  if (diskSellerLeads) {
    store.sellerLeads = diskSellerLeads;
    return;
  }

  if (!fs.existsSync(sellerLeadStorePath)) {
    writeSellerLeadsToDisk(store.sellerLeads);
  }
}

function syncPropertiesFromDisk() {
  if (!hasDiskResourceChanged("properties", propertyStorePath)) {
    return;
  }

  const diskProperties = readPropertiesFromDisk();

  if (diskProperties) {
    store.properties = diskProperties;
    return;
  }

  if (!fs.existsSync(propertyStorePath)) {
    writePropertiesToDisk(store.properties);
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
  if (!hasDiskResourceChanged("blogPosts", blogStorePath)) {
    return;
  }

  const diskPosts = readBlogPostsFromDisk();

  if (diskPosts) {
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
  syncAdvisorsFromDisk();
  return [...store.advisors];
}

export function getAdvisorById(advisorId: string): Advisor | undefined {
  syncAdvisorsFromDisk();
  return store.advisors.find((advisor) => advisor.id === advisorId);
}

function advisorUsage(advisorId: string): { propertyCount: number; linkedUserCount: number } {
  syncUsersFromDisk();
  return {
    propertyCount: store.properties.filter((property) => property.advisorId === advisorId).length,
    linkedUserCount: store.users.filter((user) => user.advisorId === advisorId).length,
  };
}

export function createAdvisor(input: CreateAdvisorInput): Advisor {
  syncAdvisorsFromDisk();
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
    image: input.image || pickSampleAdvisorImageForSeed(email),
  };

  store.advisors.unshift(advisor);
  writeAdvisorsToDisk(store.advisors);
  return advisor;
}

export function updateAdvisorById(advisorId: string, input: CreateAdvisorInput): Advisor {
  syncAdvisorsFromDisk();
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
  advisor.image = input.image || advisor.image;
  writeAdvisorsToDisk(store.advisors);

  return advisor;
}

export function deleteAdvisor(advisorId: string): Advisor {
  syncAdvisorsFromDisk();
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
  writeAdvisorsToDisk(store.advisors);
  return removed;
}

export function listProperties(filter: PropertyFilter = {}): Property[] {
  syncPropertiesFromDisk();
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
          ...(property.translations
            ? Object.values(property.translations).flatMap((translation) => [
                translation?.title ?? "",
                translation?.description ?? "",
                ...(translation?.highlights ?? []),
                ...(translation?.features ?? []),
              ])
            : []),
        ].join(" "),
      );

      return haystack.includes(query);
    })
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

export function getPropertyBySlug(slug: string): Property | undefined {
  syncPropertiesFromDisk();
  return store.properties.find((property) => property.slug === slug);
}

export function createProperty(input: CreatePropertyInput, actorId: string): Property {
  syncPropertiesFromDisk();
  const advisor = getAdvisorById(input.advisorId);
  if (!advisor) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const sampleSet = pickSampleImageSet(store.properties.length + 1);
  const baseSlug = createSlug(input.title);
  const location = inferCoordinates(input);
  const property: Property = {
    ...input,
    translations: sanitizePropertyTranslations(input.translations),
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
  writePropertiesToDisk(store.properties);

  // Demo store keeps local state only while server process is alive.
  void actorId;

  return property;
}

export function updatePropertyBySlug(slug: string, input: CreatePropertyInput): Property {
  syncPropertiesFromDisk();
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
  property.translations = sanitizePropertyTranslations(input.translations);
  writePropertiesToDisk(store.properties);

  return property;
}

export function deletePropertyBySlug(slug: string): Property {
  syncPropertiesFromDisk();
  const propertyIndex = store.properties.findIndex((property) => property.slug === slug);

  if (propertyIndex === -1) {
    throw new Error("Portföy bulunamadı.");
  }

  const [removed] = store.properties.splice(propertyIndex, 1);
  writePropertiesToDisk(store.properties);

  return removed;
}

export function listCities(): string[] {
  syncPropertiesFromDisk();
  return Array.from(new Set(store.properties.map((property) => property.city))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function listTypes(): string[] {
  syncPropertiesFromDisk();
  return Array.from(new Set(store.properties.map((property) => property.type))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function listRoomOptions(): string[] {
  syncPropertiesFromDisk();
  return Array.from(new Set(store.properties.map((property) => property.rooms))).sort((a, b) =>
    a.localeCompare(b, "tr"),
  );
}

export function authenticateUser(identifier: string, password: string): SafeUser | null {
  syncUsersFromDisk();
  const normalizedIdentifier = identifier.toLocaleLowerCase("tr");
  const user = store.users.find(
    (candidate) =>
      (candidate.username.toLocaleLowerCase("tr") === normalizedIdentifier ||
        candidate.email.toLocaleLowerCase("tr") === normalizedIdentifier) &&
      candidate.password === password,
  );

  return user ? toSafeUser(user) : null;
}

export function getUserById(userId: string): SafeUser | null {
  syncUsersFromDisk();
  const user = store.users.find((candidate) => candidate.id === userId);
  return user ? toSafeUser(user) : null;
}

export function listUsers(): SafeUser[] {
  syncUsersFromDisk();
  const roleOrder: Record<string, number> = {
    portal_admin: 0,
    admin: 1,
    portfolio_manager: 2,
    advisor: 2,
    editor: 3,
  };

  return [...store.users]
    .sort((left, right) => {
      const roleDiff = (roleOrder[left.role] ?? 99) - (roleOrder[right.role] ?? 99);
      if (roleDiff !== 0) {
        return roleDiff;
      }

      return left.name.localeCompare(right.name, "tr");
    })
    .map(toSafeUser);
}

export function createUser(input: CreateUserInput): SafeUser {
  syncUsersFromDisk();
  syncAdvisorsFromDisk();
  const name = input.name.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const phone = input.phone.trim();
  const password = input.password.trim();
  const role = input.role;
  const advisorId = input.advisorId?.trim() || undefined;

  if (!name || !email || !phone || !password || !role) {
    throw new Error("Kullanıcı alanları eksik.");
  }

  if (!["portal_admin", "admin", "portfolio_manager", "advisor", "editor"].includes(role)) {
    throw new Error("Geçersiz kullanıcı rolü.");
  }

  if (password.length < 6) {
    throw new Error("Şifre en az 6 karakter olmalıdır.");
  }

  const duplicateEmail = store.users.some(
    (user) =>
      user.email.toLocaleLowerCase("tr") === email ||
      user.username.toLocaleLowerCase("tr") === email,
  );

  if (duplicateEmail) {
    throw new Error("Bu e-posta ile kayıtlı bir kullanıcı zaten var.");
  }

  if (advisorId) {
    const advisor = getAdvisorById(advisorId);

    if (!advisor) {
      throw new Error("Seçilen danışman bulunamadı.");
    }
  }

  if (role === "advisor") {
    if (!advisorId) {
      throw new Error("Danışman hesabı için bağlı danışman seçmelisiniz.");
    }

    const linkedAdvisorExists = store.users.some(
      (user) => user.role === "advisor" && user.advisorId === advisorId,
    );

    if (linkedAdvisorExists) {
      throw new Error("Bu danışman için zaten bir panel hesabı bulunuyor.");
    }
  }

  const user: User = {
    id: `usr-${crypto.randomUUID()}`,
    name,
    role,
    email,
    phone,
    username: email,
    password,
    advisorId,
  };

  store.users.unshift(user);
  writeUsersToDisk(store.users);
  return toSafeUser(user);
}

export function deleteUserById(userId: string): SafeUser {
  syncUsersFromDisk();
  const userIndex = store.users.findIndex((candidate) => candidate.id === userId);

  if (userIndex === -1) {
    throw new Error("Kullanıcı bulunamadı.");
  }

  const [removed] = store.users.splice(userIndex, 1);

  if (removed.role === "portal_admin" && !store.users.some((user) => user.role === "portal_admin")) {
    store.users.splice(userIndex, 0, removed);
    throw new Error("Sistemde en az bir portal admin hesabı kalmalıdır.");
  }

  writeUsersToDisk(store.users);
  return toSafeUser(removed);
}

export function createLead(input: CreateLeadInput): ContactLead {
  syncLeadsFromDisk();
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
  writeLeadsToDisk(store.leads);
  return lead;
}

export function createSellerLead(input: CreateSellerLeadInput): SellerLead {
  syncSellerLeadsFromDisk();
  const now = new Date().toISOString();

  const sellerLead: SellerLead = {
    ...input,
    neighborhood: input.neighborhood?.trim() || undefined,
    subType: input.subType?.trim() || undefined,
    rooms: input.rooms?.trim() || undefined,
    buildingAge: input.buildingAge?.trim() || undefined,
    floor: input.floor?.trim() || undefined,
    inCompound: input.inCompound?.trim() || undefined,
    preferredDateTime: input.preferredDateTime?.trim() || undefined,
    id: `seller-lead-${crypto.randomUUID()}`,
    createdAt: now,
  };

  store.sellerLeads.unshift(sellerLead);
  writeSellerLeadsToDisk(store.sellerLeads);
  return sellerLead;
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

export function deleteBlogPostBySlug(slug: string): BlogPost {
  syncBlogPostsFromDisk();
  const postIndex = store.blogPosts.findIndex((post) => post.slug === slug);

  if (postIndex === -1) {
    throw new Error("Blog yazısı bulunamadı.");
  }

  const [removed] = store.blogPosts.splice(postIndex, 1);
  writeBlogPostsToDisk(store.blogPosts);

  return removed;
}

export function listLeads(): ContactLead[] {
  syncLeadsFromDisk();
  return [...store.leads].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

export function listSellerLeads(): SellerLead[] {
  syncSellerLeadsFromDisk();
  return [...store.sellerLeads].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getLeadById(leadId: string): ContactLead | undefined {
  syncLeadsFromDisk();
  return store.leads.find((lead) => lead.id === leadId);
}

export function updateLeadStage(input: {
  leadId: string;
  stage: LeadStage;
  pipelineNote?: string;
}): ContactLead {
  syncLeadsFromDisk();
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
  writeLeadsToDisk(store.leads);

  return lead;
}

export function leadStageSummary() {
  syncLeadsFromDisk();
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
  syncAdvisorsFromDisk();
  syncPropertiesFromDisk();
  syncBlogPostsFromDisk();
  syncLeadsFromDisk();
  return {
    propertyCount: store.properties.length,
    blogCount: store.blogPosts.length,
    advisorCount: store.advisors.length,
    leadCount: store.leads.length,
    cityCount: new Set(store.properties.map((property) => property.city)).size,
  };
}
