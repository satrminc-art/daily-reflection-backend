import AsyncStorage from "@react-native-async-storage/async-storage";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { getLanguageOption } from "@/localization/languages";
import { STORAGE_KEYS } from "@/storage/keys";
import { sanitizeCustomPaperColor } from "@/theme/paperColor";
import { PAGE_STYLE_PRESETS, PAPER_THEME_PRESETS, TYPOGRAPHY_PRESETS } from "@/theme/presets";
import {
  AppPreferences,
  AppStorageState,
  OnboardingPreference,
  SubscriptionModel,
  SupportedLanguage,
} from "@/types/reflection";
import { StoredReflectionFollowUp } from "@/types/ai";

const defaultPreferences: AppPreferences = {
  selectedCategories: REFLECTION_CATEGORIES,
  notificationTime: { hour: 8, minute: 30 },
  theme: "system",
  paperMode: "preset",
  paperThemeId: "warm-ivory",
  customPaperColor: "#E9E2D8",
  noteBackgroundColor: "#FFFFFF",
  typographyPresetId: "editorial-serif",
  pageStyleId: "classic-tearoff",
};

export const defaultAppState: AppStorageState = {
  hasCompletedOnboarding: false,
  hasSeenTodayIntroOverlay: false,
  preferredLanguage: null,
  quoteLanguages: ["en"],
  quoteLanguageSelections: {},
  subscriptionModel: "Freemium",
  userName: null,
  userPreferences: [],
  dailyNotificationTime: null,
  reflectionNotes: {},
  favorites: [],
  dailySelections: {},
  reflectionFollowUps: {},
  viewedDates: [],
  preferences: defaultPreferences,
};

function uniqueStrings(items: string[] | undefined): string[] {
  return Array.from(new Set((items || []).filter(Boolean)));
}

function normalizeCategory(category: string): string {
  return category === "ambition" ? "healing" : category;
}

function sanitizeCategories(items: string[] | undefined): AppPreferences["selectedCategories"] {
  const normalized = uniqueStrings(items).map(normalizeCategory);
  return normalized.filter((item): item is AppPreferences["selectedCategories"][number] =>
    REFLECTION_CATEGORIES.includes(item as AppPreferences["selectedCategories"][number]),
  );
}

function sanitizeDailySelections(
  input: Record<string, string> | undefined,
): Record<string, string> {
  if (!input) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(input)
      .filter(([date, reflectionId]) => Boolean(date) && Boolean(reflectionId))
      .map(([date, reflectionId]) => [
        date,
        reflectionId.startsWith("ambition-") ? reflectionId.replace("ambition-", "healing-") : reflectionId,
      ]),
  );
}

function sanitizeLanguage(language: string | null | undefined): SupportedLanguage | null {
  return getLanguageOption(language)?.code ?? null;
}

function sanitizeQuoteLanguages(languages: string[] | undefined, preferredLanguage?: string | null): SupportedLanguage[] {
  const values = uniqueStrings(languages ?? (preferredLanguage ? [preferredLanguage] : ["en"]));
  const sanitized = values
    .map((language) => sanitizeLanguage(language))
    .filter((language): language is SupportedLanguage => Boolean(language));

  return sanitized.length ? sanitized : ["en"];
}

function sanitizeQuoteLanguageSelections(
  selections: Record<string, string> | undefined,
): Record<string, SupportedLanguage> {
  if (!selections) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(selections)
      .map(([date, language]) => [date.trim(), sanitizeLanguage(language)] as const)
      .filter(([date, language]) => date.length > 0 && Boolean(language)),
  ) as Record<string, SupportedLanguage>;
}

function sanitizeUserName(userName: string | null | undefined): string | null {
  if (!userName) {
    return null;
  }

  const trimmed = userName.trim();
  return trimmed.length ? trimmed : null;
}

function sanitizeSubscriptionModel(model: string | null | undefined): SubscriptionModel {
  if (model === "Premium" || model === "Lifelong") {
    return model;
  }

  return "Freemium";
}

function isOnboardingPreference(preference: string): preference is OnboardingPreference {
  return preference === "clarity" || preference === "calm" || preference === "direction" || preference === "focus";
}

function sanitizeOnboardingPreferences(
  preferences: string[] | undefined,
  legacyPreference?: string | null,
): OnboardingPreference[] {
  const values = uniqueStrings(preferences ?? (legacyPreference ? [legacyPreference] : []));
  return values.filter(isOnboardingPreference);
}

function sanitizeTimeString(timeValue: string | null | undefined): string | null {
  if (!timeValue) {
    return null;
  }

  return /^\d{2}:\d{2}$/.test(timeValue) ? timeValue : null;
}

function sanitizePaperThemeId(paperThemeId: string | null | undefined): AppPreferences["paperThemeId"] {
  const matchingTheme = PAPER_THEME_PRESETS.find((preset) => preset.id === paperThemeId);
  return matchingTheme?.id ?? defaultPreferences.paperThemeId;
}

function sanitizePaperMode(paperMode: string | null | undefined): AppPreferences["paperMode"] {
  return paperMode === "custom" ? "custom" : "preset";
}

function sanitizeTypographyPresetId(typographyPresetId: string | null | undefined): AppPreferences["typographyPresetId"] {
  const matchingPreset = TYPOGRAPHY_PRESETS.find((preset) => preset.id === typographyPresetId);
  return matchingPreset?.id ?? defaultPreferences.typographyPresetId;
}

function sanitizePageStyleId(pageStyleId: string | null | undefined): AppPreferences["pageStyleId"] {
  const matchingPreset = PAGE_STYLE_PRESETS.find((preset) => preset.id === pageStyleId);
  return matchingPreset?.id ?? defaultPreferences.pageStyleId;
}

function sanitizeReflectionNotes(
  notes: Record<string, string> | undefined,
): Record<string, string> {
  if (!notes) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(notes)
      .map(([key, value]) => [key.trim(), value.trim()] as const)
      .filter(([key, value]) => key.length > 0 && value.length > 0),
  );
}

function sanitizeReflectionFollowUps(
  followUps: Record<string, StoredReflectionFollowUp> | undefined,
): Record<string, StoredReflectionFollowUp> {
  if (!followUps) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(followUps)
      .map(([key, value]) => {
        if (
          !value ||
          typeof value !== "object" ||
          typeof value.reflectionId !== "string" ||
          typeof value.date !== "string" ||
          typeof value.model !== "string" ||
          typeof value.generatedAt !== "string" ||
          !Array.isArray(value.prompts)
        ) {
          return null;
        }

        const prompts = value.prompts
          .map((prompt) => (typeof prompt === "string" ? prompt.trim() : ""))
          .filter(Boolean)
          .slice(0, 2);

        if (!key.trim() || !value.reflectionId.trim() || !value.date.trim() || !prompts.length) {
          return null;
        }

        return [
          key.trim(),
          {
            reflectionId: value.reflectionId.trim(),
            date: value.date.trim(),
            prompts,
            model: value.model.trim(),
            generatedAt: value.generatedAt.trim(),
          } satisfies StoredReflectionFollowUp,
        ] as const;
      })
      .filter((entry): entry is readonly [string, StoredReflectionFollowUp] => Boolean(entry)),
  );
}

function sanitizeFavorites(
  favorites: string[] | undefined,
  dailySelections: Record<string, string>,
): string[] {
  const values = uniqueStrings(favorites);
  const migrated = values.flatMap((favorite) => {
    if (favorite.includes(":")) {
      return favorite;
    }

    const matchingDates = Object.entries(dailySelections)
      .filter(([, reflectionId]) => reflectionId === favorite)
      .map(([date, reflectionId]) => `${date}:${reflectionId}`);

    return matchingDates.length ? matchingDates : favorite;
  });

  return uniqueStrings(migrated);
}

export async function loadAppState(): Promise<AppStorageState> {
  const raw = await AsyncStorage.getItem(STORAGE_KEYS.appState);
  if (!raw) {
    return defaultAppState;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AppStorageState> & { userPreference?: string | null };
    const sanitizedCategories = sanitizeCategories(parsed.preferences?.selectedCategories);
    const sanitizedDailyNotificationTime = sanitizeTimeString(parsed.dailyNotificationTime);
    const sanitizedDailySelections = sanitizeDailySelections(parsed.dailySelections);
    const fallbackNotificationTime = parsed.preferences?.notificationTime
      ? `${`${parsed.preferences.notificationTime.hour}`.padStart(2, "0")}:${`${parsed.preferences.notificationTime.minute}`.padStart(2, "0")}`
      : null;

    return {
      ...defaultAppState,
      ...parsed,
      hasSeenTodayIntroOverlay:
        typeof parsed.hasSeenTodayIntroOverlay === "boolean"
          ? parsed.hasSeenTodayIntroOverlay
          : Boolean(parsed.hasCompletedOnboarding),
      preferredLanguage: sanitizeLanguage(parsed.preferredLanguage),
      quoteLanguages: sanitizeQuoteLanguages(parsed.quoteLanguages, parsed.preferredLanguage),
      quoteLanguageSelections: sanitizeQuoteLanguageSelections(parsed.quoteLanguageSelections),
      subscriptionModel: sanitizeSubscriptionModel(parsed.subscriptionModel),
      userName: sanitizeUserName(parsed.userName),
      userPreferences: sanitizeOnboardingPreferences(parsed.userPreferences, parsed.userPreference),
      dailyNotificationTime: sanitizedDailyNotificationTime ?? fallbackNotificationTime,
      reflectionNotes: sanitizeReflectionNotes(parsed.reflectionNotes),
      favorites: sanitizeFavorites(parsed.favorites, sanitizedDailySelections),
      viewedDates: uniqueStrings(parsed.viewedDates),
      dailySelections: sanitizedDailySelections,
      reflectionFollowUps: sanitizeReflectionFollowUps(parsed.reflectionFollowUps),
      preferences: {
        ...defaultPreferences,
        ...parsed.preferences,
        paperMode: sanitizePaperMode(parsed.preferences?.paperMode),
        paperThemeId: sanitizePaperThemeId(parsed.preferences?.paperThemeId),
        customPaperColor: sanitizeCustomPaperColor(parsed.preferences?.customPaperColor),
        noteBackgroundColor: sanitizeCustomPaperColor(parsed.preferences?.noteBackgroundColor, "#FFFFFF"),
        typographyPresetId: sanitizeTypographyPresetId(parsed.preferences?.typographyPresetId),
        pageStyleId: sanitizePageStyleId(parsed.preferences?.pageStyleId),
        selectedCategories:
          sanitizedCategories.length ? sanitizedCategories : defaultPreferences.selectedCategories,
      },
    };
  } catch {
    return defaultAppState;
  }
}

export async function saveAppState(state: AppStorageState): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(state));
}

export async function clearAppState(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEYS.appState);
}
