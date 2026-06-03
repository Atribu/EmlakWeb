import type { SiteLanguage } from "@/lib/site-preferences";

export type UserRole = "portal_admin" | "admin" | "portfolio_manager" | "advisor" | "editor";

export type PropertyPriceCurrency = "TRY" | "USD" | "EUR" | "GBP";
export type PropertyMarketStatus = "Hazır" | "Proje";
export type PropertyPublicationStatus = "Pasif" | "Aktif";

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

export type CreateUserInput = {
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  password: string;
  advisorId?: string;
};

export type Advisor = {
  id: string;
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  focusArea: string;
  image: string;
};

export type CreateAdvisorInput = {
  name: string;
  title: string;
  phone: string;
  whatsapp: string;
  email: string;
  focusArea: string;
  image: string;
};

export type PropertyTranslationFields = {
  title?: string;
  description?: string;
  highlights?: string[];
  features?: string[];
};

export type PropertyTranslations = Partial<Record<Exclude<SiteLanguage, "TR">, PropertyTranslationFields>>;

export type PropertyInfoIconKey =
  | "commission"
  | "location"
  | "building"
  | "rooms"
  | "bath"
  | "pool"
  | "calendar"
  | "plane"
  | "beach"
  | "area";

export type PropertyInfoItem = {
  icon: PropertyInfoIconKey;
  value: string;
};

export type Property = {
  id: string;
  slug: string;
  title: string;
  country?: string;
  city: string;
  district: string;
  neighborhood: string;
  type: PropertyType;
  price: number;
  priceCurrency?: PropertyPriceCurrency;
  priceSourceAmount?: number;
  rooms: string;
  areaM2: number;
  floor: string;
  heating: string;
  marketStatus?: PropertyMarketStatus;
  publicationStatus?: PropertyPublicationStatus;
  listingRef: string;
  description: string;
  highlights: string[];
  features: string[];
  infoItems?: PropertyInfoItem[];
  developerCompany?: string;
  staffNotes?: string;
  customerFeedbackNotes?: string;
  adminCommissionNotes?: string;
  adminPrivateNotes?: string;
  advisorId: string;
  latitude: number;
  longitude: number;
  coverColor: string;
  coverImage: string;
  galleryImages: string[];
  imageLabels: string[];
  translations?: PropertyTranslations;
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
  publicationStatus?: PropertyPublicationStatus;
  includeInactive?: boolean;
};

export type CreatePropertyInput = {
  title: string;
  country?: string;
  city: string;
  district: string;
  neighborhood: string;
  type: PropertyType;
  price: number;
  priceCurrency?: PropertyPriceCurrency;
  priceSourceAmount?: number;
  rooms: string;
  areaM2: number;
  floor: string;
  heating: string;
  marketStatus?: PropertyMarketStatus;
  publicationStatus?: PropertyPublicationStatus;
  description: string;
  highlights: string[];
  features: string[];
  infoItems?: PropertyInfoItem[];
  developerCompany?: string;
  staffNotes?: string;
  customerFeedbackNotes?: string;
  adminCommissionNotes?: string;
  adminPrivateNotes?: string;
  advisorId?: string;
  latitude?: number;
  longitude?: number;
  coverColor: string;
  coverImage: string;
  galleryImages: string[];
  imageLabels: string[];
  translations?: PropertyTranslations;
};

export type ContactLead = {
  id: string;
  propertySlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  stage: LeadStage;
  source: LeadSource;
  preferredDate?: string;
  preferredTime?: string;
  appointmentNote?: string;
  assignedAdvisorId?: string;
  pipelineNote?: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadStage =
  | "new"
  | "called"
  | "appointment_scheduled"
  | "offer_submitted"
  | "won"
  | "lost";

export type LeadSource = "contact_form" | "appointment_form";

export type CreateLeadInput = {
  propertySlug: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  source?: LeadSource;
  preferredDate?: string;
  preferredTime?: string;
  appointmentNote?: string;
  assignedAdvisorId?: string;
  stage?: LeadStage;
  pipelineNote?: string;
};

export type SellerLead = {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  propertyType: string;
  subType?: string;
  areaM2?: number;
  rooms?: string;
  buildingAge?: string;
  floor?: string;
  inCompound?: string;
  preferredDateTime?: string;
  message: string;
  createdAt: string;
};

export type CreateSellerLeadInput = {
  name: string;
  email: string;
  phone: string;
  city: string;
  district: string;
  neighborhood?: string;
  propertyType: string;
  subType?: string;
  areaM2?: number;
  rooms?: string;
  buildingAge?: string;
  floor?: string;
  inCompound?: string;
  preferredDateTime?: string;
  message: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  publishedAt: string;
};

export type CreateBlogPostInput = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  authorName: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
};
