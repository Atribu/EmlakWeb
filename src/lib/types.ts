import type { SiteLanguage } from "@/lib/site-preferences";

export type UserRole = "portal_admin" | "admin" | "portfolio_manager" | "advisor" | "editor";

export type PropertyPriceCurrency = "TRY" | "USD" | "EUR" | "GBP";
export type PropertyMarketStatus = "Hazır" | "Proje";
export type PropertyPublicationStatus = "Taslak" | "Onay Bekliyor" | "Aktif" | "Pasif" | "Satıldı";

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

export type PropertyActivityAction =
  | "created"
  | "updated"
  | "publication_status_changed"
  | "advisor_changed"
  | "note_added"
  | "duplicated"
  | "deleted";

export type PropertyActivityLog = {
  id: string;
  propertySlug: string;
  propertyId?: string;
  listingRef?: string;
  propertyTitle: string;
  actionType: PropertyActivityAction;
  actorUserId?: string;
  actorName: string;
  actorRole: UserRole | string;
  summary: string;
  details: string[];
  createdAt: string;
};

export type CreatePropertyActivityLogInput = {
  propertySlug: string;
  propertyId?: string;
  listingRef?: string;
  propertyTitle: string;
  actionType: PropertyActivityAction;
  actorUserId?: string;
  actorName: string;
  actorRole: UserRole | string;
  summary: string;
  details: string[];
  createdAt?: string;
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
  priority?: LeadPriority;
  source: LeadSource;
  preferredDate?: string;
  preferredTime?: string;
  followUpDate?: string;
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

export type LeadPriority = "low" | "normal" | "high";

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
  followUpDate?: string;
  priority?: LeadPriority;
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

export type HomeLocationSpotlightLayout = "hero" | "compact" | "wide" | "standard";

export type HomeLocationSpotlightTranslationFields = {
  title?: string;
  subtitle?: string;
  badge?: string;
  blurb?: string;
  statText?: string;
};

export type HomeLocationSpotlightTranslations = Partial<
  Record<Exclude<SiteLanguage, "TR">, HomeLocationSpotlightTranslationFields>
>;

export type HomeLocationSpotlight = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  badge: string;
  blurb: string;
  statText?: string;
  href: string;
  image: string;
  priceAmount?: number;
  priceCurrency?: PropertyPriceCurrency;
  layoutVariant: HomeLocationSpotlightLayout;
  sortOrder: number;
  isActive: boolean;
  translations?: HomeLocationSpotlightTranslations;
  createdAt: string;
  updatedAt: string;
};

export type CreateHomeLocationSpotlightInput = {
  title: string;
  subtitle: string;
  badge: string;
  blurb: string;
  statText?: string;
  href: string;
  image: string;
  priceAmount?: number;
  priceCurrency?: PropertyPriceCurrency;
  layoutVariant?: HomeLocationSpotlightLayout;
  sortOrder?: number;
  isActive?: boolean;
  translations?: HomeLocationSpotlightTranslations;
};

export type UpdateHomeLocationSpotlightInput = Partial<CreateHomeLocationSpotlightInput>;
