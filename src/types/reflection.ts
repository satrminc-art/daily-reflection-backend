import type {
  AppearancePresetId,
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
export type ReflectionTextTranslations = Partial<Record<SupportedLanguage, string>>;
export interface LocalizedReflectionContent {
  text: string;
}

export interface ReflectionSeedItem {
  id: string;
  text: string;
  translations?: ReflectionTextTranslations | Record<SupportedLanguage, LocalizedReflectionContent>;
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
export type TextColorMode = "default" | "custom";
export type AppearanceMode = "default" | "preset" | "custom";
export type ReflectionLanguageMode = "same_as_app" | "custom";
export type ReminderPreset = "morning" | "midday" | "evening" | "late" | "custom";
export type PremiumPromptContext = "general" | "save" | "collections" | "personalization" | "reengagement";

export interface NotificationPreference {
  hour: number;
  minute: number;
}

export interface AppPreferences {
  selectedCategories: ReflectionCategory[];
  notificationTime: NotificationPreference;
  reminderPreset: ReminderPreset;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  silentMode: boolean;
  theme: ThemePreference;
  appearanceMode: AppearanceMode;
  selectedAppearancePresetId: AppearancePresetId | null;
  appBackgroundColor: string;
  textColorMode: TextColorMode;
  customTextColor: string;
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

export interface PersonalCollection {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  description?: string | null;
}

export interface PersonalCollectionSummary extends PersonalCollection {
  reflectionCount: number;
}

export interface DailyReminderSchedule {
  reminderIds: string[];
  followUpReminderCount: number;
  scheduledAt: string[];
  cancelledAt?: string | null;
}

export interface PremiumPromptHistoryEntry {
  lastShownAt: string | null;
  lastDismissedAt: string | null;
  lastOpenedAt: string | null;
}

export interface AppStorageState {
  hasCompletedOnboarding: boolean;
  hasSeenTodayIntroOverlay: boolean;
  hasSeenDailyReflectionPreview: boolean;
  hasSeenInitialPremiumOffer: boolean;
  hasSeenPostReflectionPremiumInvite: boolean;
  localUserId: string;
  preferredLanguage: SupportedLanguage | null;
  reflectionLanguageMode: ReflectionLanguageMode;
  reflectionLanguage: SupportedLanguage | null;
  reflectionLanguages: SupportedLanguage[];
  quoteLanguages: SupportedLanguage[];
  quoteLanguageSelections: Record<string, SupportedLanguage>;
  subscriptionModel: SubscriptionModel;
  userName: string | null;
  userPreferences: OnboardingPreference[];
  dailyNotificationTime: string | null;
  lastNotificationMessage: string | null;
  lastNotificationDate: string | null;
  reflectionNotes: Record<string, string>;
  favorites: string[];
  shownDatesByReflectionId: Record<string, string>;
  dailyThemeSelections: Record<string, ReflectionCategory>;
  activeReflectionId: string | null;
  activeReflectionDateKey: string | null;
  activeReflectionActivatedAt: string | null;
  activeReflectionViewedAtByDate: Record<string, string>;
  reminderScheduleByDate: Record<string, DailyReminderSchedule>;
  lateOpenDeferredDates: string[];
  personalCollections: PersonalCollection[];
  collectionEntries: Record<string, string[]>;
  dailySelections: Record<string, string>;
  reflectionFollowUps: Record<string, StoredReflectionFollowUp>;
  viewedDates: string[];
  lastFreemiumUpgradePromptAt: string | null;
  lastFreemiumUpgradeNotificationAt: string | null;
  premiumPromptHistory: Partial<Record<PremiumPromptContext, PremiumPromptHistoryEntry>>;
  preferences: AppPreferences;
}
