import { initialAdvisors, initialProperties, initialUsers } from "@/lib/mock-data";
import { pickSampleImageSet } from "@/lib/sample-images";
import type {
  Advisor,
  ContactLead,
  CreatePropertyInput,
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
  users: [...initialUsers],
  leads: [] as ContactLead[],
};

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
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
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

export function createLead(input: Omit<ContactLead, "id" | "createdAt">): ContactLead {
  const lead: ContactLead = {
    ...input,
    id: `lead-${crypto.randomUUID()}`,
    createdAt: new Date().toISOString(),
  };

  store.leads.unshift(lead);
  return lead;
}

export function listLeads(): ContactLead[] {
  return [...store.leads];
}

export function dashboardSummary() {
  return {
    propertyCount: store.properties.length,
    advisorCount: store.advisors.length,
    leadCount: store.leads.length,
    cityCount: new Set(store.properties.map((property) => property.city)).size,
  };
}
