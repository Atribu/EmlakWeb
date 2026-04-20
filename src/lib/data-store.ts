import db from "@/lib/db";
import { sanitizePropertyTranslations } from "@/lib/property-content";
import { sanitizePropertyInfoItems } from "@/lib/property-info-items";
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

// ─── helpers ────────────────────────────────────────────────────────────────

const cityNormalizer: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
};

const cityCenterLookup: Record<string, [number, number]> = {
  İstanbul: [41.0082, 28.9784],
  Izmir: [38.4237, 27.1428],
  İzmir: [38.4237, 27.1428],
  Ankara: [39.9334, 32.8597],
  Antalya: [36.8969, 30.7133],
  Bursa: [40.1885, 29.061],
};

const validLeadStages: LeadStage[] = [
  "new", "called", "appointment_scheduled", "offer_submitted", "won", "lost",
];

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

function uniqueSlug(base: string): string {
  const rows = db.prepare("SELECT slug FROM properties WHERE slug = ? OR slug LIKE ?").all(base, `${base}-%`) as { slug: string }[];
  const existing = new Set(rows.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) cursor += 1;
  return `${base}-${cursor}`;
}

function uniqueBlogSlug(base: string): string {
  const rows = db.prepare("SELECT slug FROM blog_posts WHERE slug = ? OR slug LIKE ?").all(base, `${base}-%`) as { slug: string }[];
  const existing = new Set(rows.map((r) => r.slug));
  if (!existing.has(base)) return base;
  let cursor = 2;
  while (existing.has(`${base}-${cursor}`)) cursor += 1;
  return `${base}-${cursor}`;
}

function nextListingRef(): string {
  const row = db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number };
  return `PN-${String(row.c + 1).padStart(4, "0")}`;
}

function inferCoordinates(input: CreatePropertyInput, propCount: number): { latitude: number; longitude: number } {
  if (
    typeof input.latitude === "number" && Number.isFinite(input.latitude) &&
    typeof input.longitude === "number" && Number.isFinite(input.longitude)
  ) {
    return { latitude: input.latitude, longitude: input.longitude };
  }
  const center =
    cityCenterLookup[input.city] ??
    cityCenterLookup[input.city.replace("İ", "I")] ??
    cityCenterLookup.İstanbul;
  const offsetIndex = propCount % 7;
  return {
    latitude: Number((center[0] + (offsetIndex - 3) * 0.0052).toFixed(6)),
    longitude: Number((center[1] + (offsetIndex - 3) * 0.0041).toFixed(6)),
  };
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id, name: user.name, role: user.role,
    email: user.email, phone: user.phone, username: user.username,
    advisorId: user.advisorId,
  };
}

// ─── row mappers ─────────────────────────────────────────────────────────────

function rowToProperty(row: Record<string, unknown>): Property {
  return {
    ...(row as unknown as Property),
    price: Number(row.price),
    areaM2: Number(row.areaM2),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    highlights: JSON.parse(row.highlights as string),
    features: JSON.parse(row.features as string),
    infoItems: JSON.parse(row.infoItems as string),
    galleryImages: JSON.parse(row.galleryImages as string),
    imageLabels: JSON.parse(row.imageLabels as string),
    translations: JSON.parse(row.translations as string),
  };
}

function rowToAdvisor(row: Record<string, unknown>): Advisor {
  return row as unknown as Advisor;
}

function rowToUser(row: Record<string, unknown>): User {
  return {
    ...(row as unknown as User),
    advisorId: (row.advisorId as string | null) ?? undefined,
  };
}

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    ...(row as unknown as BlogPost),
    tags: JSON.parse(row.tags as string),
  };
}

function rowToLead(row: Record<string, unknown>): ContactLead {
  return row as unknown as ContactLead;
}

function rowToSellerLead(row: Record<string, unknown>): SellerLead {
  return {
    ...(row as unknown as SellerLead),
    areaM2: row.areaM2 != null ? Number(row.areaM2) : undefined,
  };
}

// ─── advisors ────────────────────────────────────────────────────────────────

export function listAdvisors(): Advisor[] {
  return (db.prepare("SELECT * FROM advisors").all() as Record<string, unknown>[]).map(rowToAdvisor);
}

export function getAdvisorById(advisorId: string): Advisor | undefined {
  const row = db.prepare("SELECT * FROM advisors WHERE id = ?").get(advisorId) as Record<string, unknown> | undefined;
  return row ? rowToAdvisor(row) : undefined;
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

  const existing = db.prepare("SELECT id FROM advisors WHERE LOWER(email) = ?").get(email);
  if (existing) throw new Error("Bu e-posta ile kayıtlı bir danışman zaten var.");

  const advisor: Advisor = {
    id: `adv-${crypto.randomUUID()}`,
    name, title, phone, whatsapp, email, focusArea,
    image: input.image || pickSampleAdvisorImageForSeed(email),
  };

  db.prepare(`
    INSERT INTO advisors (id, name, title, phone, whatsapp, email, focusArea, image)
    VALUES (@id, @name, @title, @phone, @whatsapp, @email, @focusArea, @image)
  `).run(advisor);

  return advisor;
}

export function updateAdvisorById(advisorId: string, input: CreateAdvisorInput): Advisor {
  const advisor = getAdvisorById(advisorId);
  if (!advisor) throw new Error("Danışman bulunamadı.");

  const name = input.name.trim();
  const title = input.title.trim();
  const phone = input.phone.trim();
  const whatsapp = input.whatsapp.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const focusArea = input.focusArea.trim();

  if (!name || !title || !phone || !whatsapp || !email || !focusArea) {
    throw new Error("Danışman alanları eksik.");
  }

  const conflict = db.prepare("SELECT id FROM advisors WHERE LOWER(email) = ? AND id != ?").get(email, advisorId);
  if (conflict) throw new Error("Bu e-posta başka bir danışmana ait.");

  const image = input.image || advisor.image;
  db.prepare(`
    UPDATE advisors SET name=@name, title=@title, phone=@phone, whatsapp=@whatsapp,
      email=@email, focusArea=@focusArea, image=@image WHERE id=@id
  `).run({ name, title, phone, whatsapp, email, focusArea, image, id: advisorId });

  return { ...advisor, name, title, phone, whatsapp, email, focusArea, image };
}

export function deleteAdvisor(advisorId: string): Advisor {
  const advisor = getAdvisorById(advisorId);
  if (!advisor) throw new Error("Danışman bulunamadı.");

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties WHERE advisorId = ?").get(advisorId) as { c: number }).c;
  if (propCount > 0) throw new Error(`Bu danışmana bağlı ${propCount} portföy var. Önce portföyleri başka danışmana taşıyın.`);

  const userCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE advisorId = ?").get(advisorId) as { c: number }).c;
  if (userCount > 0) throw new Error(`Bu danışmana bağlı ${userCount} kullanıcı hesabı var. Önce kullanıcı bağlantısını kaldırın.`);

  db.prepare("DELETE FROM advisors WHERE id = ?").run(advisorId);
  return advisor;
}

// ─── properties ──────────────────────────────────────────────────────────────

export function listProperties(filter: PropertyFilter = {}): Property[] {
  const rows = (db.prepare("SELECT * FROM properties ORDER BY publishedAt DESC").all() as Record<string, unknown>[]).map(rowToProperty);
  const query = filter.query ? normalizeText(filter.query) : "";

  return rows.filter((p) => {
    if (filter.city && p.city !== filter.city) return false;
    if (filter.type && p.type !== filter.type) return false;
    if (typeof filter.minPrice === "number" && p.price < filter.minPrice) return false;
    if (typeof filter.maxPrice === "number" && p.price > filter.maxPrice) return false;
    if (filter.rooms && p.rooms !== filter.rooms) return false;
    if (filter.advisorId && p.advisorId !== filter.advisorId) return false;
    if (!query) return true;

    const haystack = normalizeText([
      p.title, p.city, p.district, p.neighborhood, p.listingRef,
      ...(p.infoItems?.map((i) => i.value) ?? []),
      ...(p.translations ? Object.values(p.translations).flatMap((t) => [
        t?.title ?? "", t?.description ?? "",
        ...(t?.highlights ?? []), ...(t?.features ?? []),
      ]) : []),
    ].join(" "));

    return haystack.includes(query);
  });
}

export function getPropertyBySlug(slug: string): Property | undefined {
  const row = db.prepare("SELECT * FROM properties WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? rowToProperty(row) : undefined;
}

export function createProperty(input: CreatePropertyInput, actorId: string): Property {
  void actorId;
  if (input.advisorId && !getAdvisorById(input.advisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const sampleSet = pickSampleImageSet(propCount + 1);
  const baseSlug = createSlug(input.title);
  const location = inferCoordinates(input, propCount);

  const property: Property = {
    ...input,
    advisorId: input.advisorId?.trim() ?? "",
    infoItems: sanitizePropertyInfoItems(input.infoItems),
    translations: sanitizePropertyTranslations(input.translations),
    latitude: location.latitude,
    longitude: location.longitude,
    coverImage: input.coverImage || sampleSet.cover,
    galleryImages: input.galleryImages && input.galleryImages.length > 0 ? input.galleryImages : sampleSet.gallery,
    imageLabels: input.imageLabels ?? [],
    id: `prp-${crypto.randomUUID()}`,
    slug: uniqueSlug(baseSlug),
    listingRef: nextListingRef(),
    publishedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO properties
      (id, slug, title, city, district, neighborhood, type, price, rooms, areaM2,
       floor, heating, listingRef, description, highlights, features, infoItems,
       advisorId, latitude, longitude, coverColor, coverImage, galleryImages,
       imageLabels, translations, publishedAt)
    VALUES
      (@id, @slug, @title, @city, @district, @neighborhood, @type, @price, @rooms, @areaM2,
       @floor, @heating, @listingRef, @description, @highlights, @features, @infoItems,
       @advisorId, @latitude, @longitude, @coverColor, @coverImage, @galleryImages,
       @imageLabels, @translations, @publishedAt)
  `).run({
    ...property,
    highlights: JSON.stringify(property.highlights),
    features: JSON.stringify(property.features),
    infoItems: JSON.stringify(property.infoItems),
    galleryImages: JSON.stringify(property.galleryImages),
    imageLabels: JSON.stringify(property.imageLabels),
    translations: JSON.stringify(property.translations),
  });

  return property;
}

export function updatePropertyBySlug(slug: string, input: CreatePropertyInput): Property {
  const property = getPropertyBySlug(slug);
  if (!property) throw new Error("Portföy bulunamadı.");

  if (input.advisorId && !getAdvisorById(input.advisorId)) {
    throw new Error("Seçilen danışman bulunamadı.");
  }

  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const location = inferCoordinates({
    ...input,
    latitude: input.latitude ?? property.latitude,
    longitude: input.longitude ?? property.longitude,
  }, propCount);

  const updated: Property = {
    ...property,
    title: input.title.trim(),
    city: input.city.trim(),
    district: input.district.trim(),
    neighborhood: input.neighborhood.trim(),
    type: input.type,
    price: input.price,
    rooms: input.rooms.trim(),
    areaM2: input.areaM2,
    floor: input.floor.trim(),
    heating: input.heating.trim(),
    description: input.description.trim(),
    highlights: input.highlights,
    features: input.features,
    infoItems: sanitizePropertyInfoItems(input.infoItems),
    advisorId: input.advisorId?.trim() ?? "",
    latitude: location.latitude,
    longitude: location.longitude,
    coverColor: input.coverColor,
    coverImage: input.coverImage || property.coverImage,
    galleryImages: input.galleryImages.length > 0 ? input.galleryImages : property.galleryImages,
    imageLabels: input.imageLabels.length > 0 ? input.imageLabels : property.imageLabels,
    translations: sanitizePropertyTranslations(input.translations),
  };

  db.prepare(`
    UPDATE properties SET
      title=@title, city=@city, district=@district, neighborhood=@neighborhood,
      type=@type, price=@price, rooms=@rooms, areaM2=@areaM2, floor=@floor,
      heating=@heating, description=@description, highlights=@highlights,
      features=@features, infoItems=@infoItems, advisorId=@advisorId,
      latitude=@latitude, longitude=@longitude, coverColor=@coverColor,
      coverImage=@coverImage, galleryImages=@galleryImages, imageLabels=@imageLabels,
      translations=@translations
    WHERE slug=@slug
  `).run({
    ...updated,
    highlights: JSON.stringify(updated.highlights),
    features: JSON.stringify(updated.features),
    infoItems: JSON.stringify(updated.infoItems),
    galleryImages: JSON.stringify(updated.galleryImages),
    imageLabels: JSON.stringify(updated.imageLabels),
    translations: JSON.stringify(updated.translations),
  });

  return updated;
}

export function deletePropertyBySlug(slug: string): Property {
  const property = getPropertyBySlug(slug);
  if (!property) throw new Error("Portföy bulunamadı.");
  db.prepare("DELETE FROM properties WHERE slug = ?").run(slug);
  return property;
}

export function listCities(): string[] {
  return (db.prepare("SELECT DISTINCT city FROM properties ORDER BY city").all() as { city: string }[]).map((r) => r.city);
}

export function listTypes(): string[] {
  return (db.prepare("SELECT DISTINCT type FROM properties ORDER BY type").all() as { type: string }[]).map((r) => r.type);
}

export function listRoomOptions(): string[] {
  return (db.prepare("SELECT DISTINCT rooms FROM properties ORDER BY rooms").all() as { rooms: string }[]).map((r) => r.rooms);
}

// ─── users ───────────────────────────────────────────────────────────────────

export function authenticateUser(identifier: string, password: string): SafeUser | null {
  const normalized = identifier.toLocaleLowerCase("tr");
  const row = db.prepare(`
    SELECT * FROM users WHERE (LOWER(username) = ? OR LOWER(email) = ?) AND password = ?
  `).get(normalized, normalized, password) as Record<string, unknown> | undefined;
  return row ? toSafeUser(rowToUser(row)) : null;
}

export function getUserById(userId: string): SafeUser | null {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as Record<string, unknown> | undefined;
  return row ? toSafeUser(rowToUser(row)) : null;
}

export function listUsers(): SafeUser[] {
  const roleOrder: Record<string, number> = {
    portal_admin: 0, admin: 1, portfolio_manager: 2, advisor: 2, editor: 3,
  };
  return (db.prepare("SELECT * FROM users").all() as Record<string, unknown>[])
    .map(rowToUser)
    .sort((a, b) => {
      const diff = (roleOrder[a.role] ?? 99) - (roleOrder[b.role] ?? 99);
      return diff !== 0 ? diff : a.name.localeCompare(b.name, "tr");
    })
    .map(toSafeUser);
}

export function createUser(input: CreateUserInput): SafeUser {
  const name = input.name.trim();
  const email = input.email.trim().toLocaleLowerCase("tr");
  const phone = input.phone.trim();
  const password = input.password.trim();
  const role = input.role;
  const advisorId = input.advisorId?.trim() || undefined;

  if (!name || !email || !phone || !password || !role) throw new Error("Kullanıcı alanları eksik.");
  if (!["portal_admin", "admin", "portfolio_manager", "advisor", "editor"].includes(role)) throw new Error("Geçersiz kullanıcı rolü.");
  if (password.length < 6) throw new Error("Şifre en az 6 karakter olmalıdır.");

  const dup = db.prepare("SELECT id FROM users WHERE LOWER(email) = ? OR LOWER(username) = ?").get(email, email);
  if (dup) throw new Error("Bu e-posta ile kayıtlı bir kullanıcı zaten var.");

  if (advisorId) {
    if (!getAdvisorById(advisorId)) throw new Error("Seçilen danışman bulunamadı.");
  }

  if (role === "advisor") {
    if (!advisorId) throw new Error("Danışman hesabı için bağlı danışman seçmelisiniz.");
    const linked = db.prepare("SELECT id FROM users WHERE role = 'advisor' AND advisorId = ?").get(advisorId);
    if (linked) throw new Error("Bu danışman için zaten bir panel hesabı bulunuyor.");
  }

  const user: User = {
    id: `usr-${crypto.randomUUID()}`,
    name, role: role as UserRole, email, phone,
    username: email, password, advisorId,
  };

  db.prepare(`
    INSERT INTO users (id, name, role, email, phone, username, password, advisorId)
    VALUES (@id, @name, @role, @email, @phone, @username, @password, @advisorId)
  `).run({ ...user, advisorId: user.advisorId ?? null });

  return toSafeUser(user);
}

export function deleteUserById(userId: string): SafeUser {
  const row = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as Record<string, unknown> | undefined;
  if (!row) throw new Error("Kullanıcı bulunamadı.");
  const user = rowToUser(row);

  if (user.role === "portal_admin") {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'portal_admin'").get() as { c: number }).c;
    if (adminCount <= 1) throw new Error("Sistemde en az bir portal admin hesabı kalmalıdır.");
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  return toSafeUser(user);
}

// ─── leads ───────────────────────────────────────────────────────────────────

export function createLead(input: CreateLeadInput): ContactLead {
  const stage = input.stage ?? "new";
  if (!validLeadStages.includes(stage)) throw new Error("Geçersiz lead aşaması.");
  const now = new Date().toISOString();

  const lead: ContactLead = {
    ...input,
    source: input.source ?? "contact_form",
    stage,
    id: `lead-${crypto.randomUUID()}`,
    createdAt: now,
    updatedAt: now,
  };

  db.prepare(`
    INSERT INTO leads
      (id, propertySlug, name, email, phone, message, stage, source,
       preferredDate, preferredTime, appointmentNote, assignedAdvisorId, pipelineNote, createdAt, updatedAt)
    VALUES
      (@id, @propertySlug, @name, @email, @phone, @message, @stage, @source,
       @preferredDate, @preferredTime, @appointmentNote, @assignedAdvisorId, @pipelineNote, @createdAt, @updatedAt)
  `).run({
    ...lead,
    preferredDate: lead.preferredDate ?? null,
    preferredTime: lead.preferredTime ?? null,
    appointmentNote: lead.appointmentNote ?? null,
    assignedAdvisorId: lead.assignedAdvisorId ?? null,
    pipelineNote: lead.pipelineNote ?? null,
  });

  return lead;
}

export function listLeads(): ContactLead[] {
  return (db.prepare("SELECT * FROM leads ORDER BY updatedAt DESC").all() as Record<string, unknown>[]).map(rowToLead);
}

export function getLeadById(leadId: string): ContactLead | undefined {
  const row = db.prepare("SELECT * FROM leads WHERE id = ?").get(leadId) as Record<string, unknown> | undefined;
  return row ? rowToLead(row) : undefined;
}

export function updateLeadStage(input: { leadId: string; stage: LeadStage; pipelineNote?: string }): ContactLead {
  if (!validLeadStages.includes(input.stage)) throw new Error("Geçersiz lead aşaması.");
  const lead = getLeadById(input.leadId);
  if (!lead) throw new Error("Lead bulunamadı.");

  const updatedAt = new Date().toISOString();
  const pipelineNote = typeof input.pipelineNote === "string"
    ? (input.pipelineNote.trim() || null)
    : (lead.pipelineNote ?? null);

  db.prepare(`
    UPDATE leads SET stage = @stage, pipelineNote = @pipelineNote, updatedAt = @updatedAt WHERE id = @id
  `).run({ stage: input.stage, pipelineNote, updatedAt, id: input.leadId });

  return { ...lead, stage: input.stage, pipelineNote: pipelineNote ?? undefined, updatedAt };
}

export function leadStageSummary() {
  const summary: Record<LeadStage, number> = {
    new: 0, called: 0, appointment_scheduled: 0, offer_submitted: 0, won: 0, lost: 0,
  };
  const rows = db.prepare("SELECT stage, COUNT(*) as c FROM leads GROUP BY stage").all() as { stage: string; c: number }[];
  for (const row of rows) {
    if (validLeadStages.includes(row.stage as LeadStage)) {
      summary[row.stage as LeadStage] = row.c;
    }
  }
  return summary;
}

// ─── seller leads ────────────────────────────────────────────────────────────

export function createSellerLead(input: CreateSellerLeadInput): SellerLead {
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

  db.prepare(`
    INSERT INTO seller_leads
      (id, name, email, phone, city, district, neighborhood, propertyType, subType,
       areaM2, rooms, buildingAge, floor, inCompound, preferredDateTime, message, createdAt)
    VALUES
      (@id, @name, @email, @phone, @city, @district, @neighborhood, @propertyType, @subType,
       @areaM2, @rooms, @buildingAge, @floor, @inCompound, @preferredDateTime, @message, @createdAt)
  `).run({
    ...sellerLead,
    neighborhood: sellerLead.neighborhood ?? null,
    subType: sellerLead.subType ?? null,
    areaM2: sellerLead.areaM2 ?? null,
    rooms: sellerLead.rooms ?? null,
    buildingAge: sellerLead.buildingAge ?? null,
    floor: sellerLead.floor ?? null,
    inCompound: sellerLead.inCompound ?? null,
    preferredDateTime: sellerLead.preferredDateTime ?? null,
  });

  return sellerLead;
}

export function listSellerLeads(): SellerLead[] {
  return (db.prepare("SELECT * FROM seller_leads ORDER BY createdAt DESC").all() as Record<string, unknown>[]).map(rowToSellerLead);
}

// ─── blog posts ──────────────────────────────────────────────────────────────

export function listBlogPosts(): BlogPost[] {
  return (db.prepare("SELECT * FROM blog_posts ORDER BY publishedAt DESC").all() as Record<string, unknown>[]).map(rowToBlogPost);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  const row = db.prepare("SELECT * FROM blog_posts WHERE slug = ?").get(slug) as Record<string, unknown> | undefined;
  return row ? rowToBlogPost(row) : undefined;
}

export function createBlogPost(input: CreateBlogPostInput): BlogPost {
  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((t) => t.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }
  if (tags.length === 0) throw new Error("En az bir etiket girilmelidir.");

  const post: BlogPost = {
    id: `blog-${crypto.randomUUID()}`,
    slug: uniqueBlogSlug(createSlug(title)),
    title, excerpt, content, coverImage, authorName, tags,
    metaTitle, metaDescription,
    publishedAt: new Date().toISOString(),
  };

  db.prepare(`
    INSERT INTO blog_posts
      (id, slug, title, excerpt, content, coverImage, authorName, tags, metaTitle, metaDescription, publishedAt)
    VALUES
      (@id, @slug, @title, @excerpt, @content, @coverImage, @authorName, @tags, @metaTitle, @metaDescription, @publishedAt)
  `).run({ ...post, tags: JSON.stringify(post.tags) });

  return post;
}

export function updateBlogPostBySlug(slug: string, input: CreateBlogPostInput): BlogPost {
  const post = getBlogPostBySlug(slug);
  if (!post) throw new Error("Blog yazısı bulunamadı.");

  const title = input.title.trim();
  const excerpt = input.excerpt.trim();
  const content = input.content.trim();
  const coverImage = input.coverImage.trim();
  const authorName = input.authorName.trim();
  const metaTitle = input.metaTitle.trim();
  const metaDescription = input.metaDescription.trim();
  const tags = input.tags.map((t) => t.trim()).filter(Boolean);

  if (!title || !excerpt || !content || !coverImage || !authorName || !metaTitle || !metaDescription) {
    throw new Error("Blog alanları eksik.");
  }
  if (tags.length === 0) throw new Error("En az bir etiket girilmelidir.");

  db.prepare(`
    UPDATE blog_posts SET title=@title, excerpt=@excerpt, content=@content,
      coverImage=@coverImage, authorName=@authorName, tags=@tags,
      metaTitle=@metaTitle, metaDescription=@metaDescription
    WHERE slug=@slug
  `).run({ title, excerpt, content, coverImage, authorName, tags: JSON.stringify(tags), metaTitle, metaDescription, slug });

  return { ...post, title, excerpt, content, coverImage, authorName, tags, metaTitle, metaDescription };
}

export function deleteBlogPostBySlug(slug: string): BlogPost {
  const post = getBlogPostBySlug(slug);
  if (!post) throw new Error("Blog yazısı bulunamadı.");
  db.prepare("DELETE FROM blog_posts WHERE slug = ?").run(slug);
  return post;
}

// ─── dashboard ───────────────────────────────────────────────────────────────

export function dashboardSummary() {
  const propCount = (db.prepare("SELECT COUNT(*) as c FROM properties").get() as { c: number }).c;
  const blogCount = (db.prepare("SELECT COUNT(*) as c FROM blog_posts").get() as { c: number }).c;
  const advisorCount = (db.prepare("SELECT COUNT(*) as c FROM advisors").get() as { c: number }).c;
  const leadCount = (db.prepare("SELECT COUNT(*) as c FROM leads").get() as { c: number }).c;
  const cityCount = (db.prepare("SELECT COUNT(DISTINCT city) as c FROM properties").get() as { c: number }).c;
  return { propertyCount: propCount, blogCount, advisorCount, leadCount, cityCount };
}
