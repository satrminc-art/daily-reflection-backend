import { ReflectionCategory, ReflectionTone, SourceType, SubscriptionModel, SupportedLanguage } from "@/types/reflection";

export interface ApiErrorShape {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccessEnvelope<TData> {
  ok: true;
  data: TData;
}

export interface ApiErrorEnvelope {
  ok: false;
  error: ApiErrorShape;
}

export type ApiEnvelope<TData> = ApiSuccessEnvelope<TData> | ApiErrorEnvelope;

export interface ApiSessionPayload {
  provider: "anonymous" | "apple" | "google" | "email";
  idToken?: string;
  refreshToken?: string;
}

export interface ApiSessionResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

export interface CurrentUserResponse {
  id: string;
  email: string | null;
  displayName: string | null;
  appLanguage: SupportedLanguage | null;
  reflectionLanguage: SupportedLanguage | null;
  timezone: string | null;
  notificationTime: string | null;
  subscriptionTier: SubscriptionModel;
  createdAt: string;
}

export interface ApiReflectionRecord {
  id: string;
  dateKey: string;
  language: SupportedLanguage;
  text: string;
  theme: ReflectionCategory;
  tone: ReflectionTone;
  sourceType: SourceType;
  tags: string[];
  createdAt: string;
}

export interface SubscriptionStatusResponse {
  tier: SubscriptionModel;
  status: "active" | "inactive" | "grace_period" | "expired";
  isPremium: boolean;
  productId: string | null;
  expiresAt: string | null;
  isLifetime: boolean;
  source: "backend" | "revenuecat_fallback";
}
