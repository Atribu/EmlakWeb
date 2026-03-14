export type UserRole = "admin" | "advisor" | "editor";

export type PropertyType =
  | "Daire"
  | "Villa"
  | "Rezidans"
  | "Arsa"
  | "Ofis";

export type User = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  username: string;
  password: string;
  advisorId?: string;
};

export type SafeUser = Omit<User, "password">;

export type Advisor = {
  id: string;
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  focusArea: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  type: PropertyType;
  price: number;
  rooms: string;
  areaM2: number;
  floor: string;
  heating: string;
  listingRef: string;
  description: string;
  highlights: string[];
  features: string[];
  advisorId: string;
  latitude: number;
  longitude: number;
  coverColor: string;
  coverImage: string;
  galleryImages: string[];
  imageLabels: string[];
  publishedAt: string;
};

export type PropertyFilter = {
  query?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  rooms?: string;
  advisorId?: string;
};

export type CreatePropertyInput = {
  title: string;
  city: string;
  district: string;
  neighborhood: string;
  type: PropertyType;
  price: number;
  rooms: string;
  areaM2: number;
  floor: string;
  heating: string;
  description: string;
  highlights: string[];
  features: string[];
  advisorId: string;
  latitude?: number;
  longitude?: number;
  coverColor: string;
  coverImage: string;
  galleryImages: string[];
  imageLabels: string[];
};

export type ContactLead = {
  id: string;
  propertySlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  createdAt: string;
};
