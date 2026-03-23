import type {
  PageStylePresetId,
  PaperThemePresetId,
  TypographyPresetId,
} from "@/theme/presets";
import type { StoredReflectionFollowUp } from "@/types/ai";

export type ReflectionCategory =
  | "calm"
  | "clarity"
  | "discipline"
  | "self-respect"
  | "purpose"
  | "relationships"
  | "courage"
  | "creativity"
  | "healing"
  | "focus";

export type ReflectionTone =
  | "gentle"
  | "clear-eyed"
  | "steady"
  | "curious"
  | "grounded"
  | "expansive";

export type SourceType = "manual" | "ai" | "original_reflection";
export type LocalizedReflectionText = string | Partial<Record<SupportedLanguage, string>>;

export interface ReflectionSeedItem {
  id: string;
  text: string;
  category: ReflectionCategory;
  tone: ReflectionTone;
  sourceType: SourceType;
}

export interface ManualReflectionEntry {
  id: string;
  date: string;
  text: LocalizedReflectionText;
  category: ReflectionCategory;
  tone: ReflectionTone;
  sourceType: "manual";
}

export interface ReflectionItem extends ReflectionSeedItem {
  date: string;
  isFavorite: boolean;
}

export type ThemePreference = "system" | "light" | "dark";
export type SupportedLanguage = string;
export type OnboardingPreference = "clarity" | "calm" | "direction" | "focus";
export type SubscriptionModel = "Freemium" | "Premium" | "Lifelong";

export interface NotificationPreference {
  hour: number;
  minute: number;
}

export interface AppPreferences {
  selectedCategories: ReflectionCategory[];
  notificationTime: NotificationPreference;
  theme: ThemePreference;
  paperMode: "preset" | "custom";
  paperThemeId: PaperThemePresetId;
  customPaperColor: string;
  noteBackgroundColor: string;
  typographyPresetId: TypographyPresetId;
  pageStyleId: PageStylePresetId;
}

export interface ReflectionDetailParams {
  reflectionId: string;
  date: string;
}

export interface AppStorageState {
  hasCompletedOnboarding: boolean;
  hasSeenTodayIntroOverlay: boolean;
  preferredLanguage: SupportedLanguage | null;
  quoteLanguages: SupportedLanguage[];
  quoteLanguageSelections: Record<string, SupportedLanguage>;
  subscriptionModel: SubscriptionModel;
  userName: string | null;
  userPreferences: OnboardingPreference[];
  dailyNotificationTime: string | null;
  reflectionNotes: Record<string, string>;
  favorites: string[];
  dailySelections: Record<string, string>;
  reflectionFollowUps: Record<string, StoredReflectionFollowUp>;
  viewedDates: string[];
  preferences: AppPreferences;
}
