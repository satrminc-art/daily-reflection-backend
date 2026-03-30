import { SupportedLanguage, SubscriptionModel } from "@/types/reflection";

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  appLanguage: SupportedLanguage | null;
  reflectionLanguage: SupportedLanguage | null;
  timezone: string | null;
  notificationTime: string | null;
  subscriptionTier: SubscriptionModel;
  createdAt: string | null;
  updatedAt: string | null;
}
