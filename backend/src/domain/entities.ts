import type { ReflectionCategory, ReflectionTone, SourceType, SupportedLanguage } from "../types/reflection";

export interface UserRecord {
  id: string;
  email: string | null;
  displayName: string | null;
  createdAt: string;
  updatedAt: string;
  appLanguage: string | null;
  reflectionLanguage: string | null;
  timezone: string | null;
  notificationTime: string | null;
  subscriptionTier: "Freemium" | "Premium" | "Lifelong";
}

export interface ReflectionRecord {
  id: string;
  dateKey: string;
  language: SupportedLanguage;
  text: string;
  theme: ReflectionCategory;
  tone: ReflectionTone;
  tags: string[];
  sourceType: SourceType;
  createdAt: string;
}

export interface SavedReflectionRecord {
  id: string;
  userId: string;
  reflectionId: string;
  dateKey: string;
  reflectionText: string;
  theme: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface NoteRecord {
  id: string;
  userId: string;
  reflectionId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionRecord {
  id: string;
  userId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CollectionItemRecord {
  id: string;
  collectionId: string;
  reflectionId: string;
  createdAt: string;
}

export interface SubscriptionStatusRecord {
  id: string;
  userId: string;
  provider: string;
  productId: string;
  entitlementId: string | null;
  tier: "Freemium" | "Premium" | "Lifelong";
  status: string;
  expiresAt: string | null;
  isLifetime: boolean;
  rawPayload?: unknown;
  updatedAt: string;
}
