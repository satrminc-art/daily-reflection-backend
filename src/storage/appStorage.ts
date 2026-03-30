import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import { REFLECTION_SEED } from "@/data/reflections";
import { YEARLY_REFLECTIONS_BY_ID } from "@/data/yearly";
import { getLanguageOption } from "@/localization/languages";
import { STORAGE_KEYS } from "@/storage/keys";
import { sanitizeCustomPaperColor } from "@/theme/paperColor";
import { APPEARANCE_PRESETS, PAGE_STYLE_PRESETS, PAPER_THEME_PRESETS, TYPOGRAPHY_PRESETS } from "@/theme/presets";
import {
  AppPreferences,
  DailyReminderSchedule,
  PersonalCollection,
  AppStorageState,
  OnboardingPreference,
  ReminderPreset,
  SubscriptionModel,
  SupportedLanguage,
} from "@/types/reflection";
import { StoredReflectionFollowUp } from "@/types/ai";

const defaultPreferences: AppPreferences = {
  selectedCategories: REFLECTION_CATEGORIES,
  notificationTime: { hour: 8, minute: 30 },
  reminderPreset: "morning",
  notificationsEnabled: true,
  soundEnabled: true,
  hapticsEnabled: true,
  silentMode: false,
  theme: "system",
  appearanceMode: "default",
  selectedAppearancePresetId: null,
  appBackgroundColor: "#FFFFFF",
  textColorMode: "default",
  customTextColor: "#221B15",
  paperMode: "preset",
  paperThemeId: "warm-ivory",
  customPaperColor: "#E9E2D8",
  noteBackgroundColor: "#FFFFFF",
  typographyPresetId: "editorial-serif",
  pageStyleId: "classic-tearoff",
};

function createLocalUserId() {
  return `local-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export const defaultAppState: AppStorageState = {
  hasCompletedOnboarding: false,
  hasSeenTodayIntroOverlay: false,
  hasSeenDailyReflectionPreview: false,
  hasSeenInitialPremiumOffer: false,
  hasSeenPostReflectionPremiumInvite: false,
  localUserId: createLocalUserId(),
  preferredLanguage: null,
  reflectionLanguageMode: "same_as_app",
  reflectionLanguage: null,
  reflectionLanguages: ["en"],
  quoteLanguages: ["en"],
  quoteLanguageSelections: {},
  subscriptionModel: "Freemium",
  userName: null,
  userPreferences: [],
  dailyNotificationTime: null,
  lastNotificationMessage: null,
  lastNotificationDate: null,
  reflectionNotes: {},
  favorites: [],
  shownDatesByReflectionId: {},
  dailyThemeSelections: {},
  activeReflectionId: null,
  activeReflectionDateKey: null,
  activeReflectionActivatedAt: null,
  activeReflectionViewedAtByDate: {},
  reminderScheduleByDate: {},
  lateOpenDeferredDates: [],
  personalCollections: [],
  collectionEntries: {},
  dailySelections: {},
  reflectionFollowUps: {},
  viewedDates: [],
  lastFreemiumUpgradePromptAt: null,
  lastFreemiumUpgradeNotificationAt: null,
  premiumPromptHistory: {},
  preferences: defaultPreferences,
};

async function loadSecureLocalUserId(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(STORAGE_KEYS.secureLocalUserId);
  } catch (error) {
    console.warn("Failed to read secure local user id", error);
    return null;
  }
}

async function persistSecureLocalUserId(localUserId: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(STORAGE_KEYS.secureLocalUserId, localUserId);
  } catch (error) {
    console.warn("Failed to persist secure local user id", error);
  }
}

async function loadRawAppState(): Promise<string | null> {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.appState);
  } catch (error) {
    console.warn("Failed to read app state from storage", error);
    return null;
  }
}

function sanitizeParsedState(
  parsed: Partial<AppStorageState> & { userPreference?: string | null },
  secureLocalUserId?: string | null,
): AppStorageState {
  const sanitizedCategories = sanitizeCategories(parsed.preferences?.selectedCategories);
  const sanitizedDailyNotificationTime = sanitizeTimeString(parsed.dailyNotificationTime);
  const sanitizedDailySelections = sanitizeDailySelections(parsed.dailySelections);
  const sanitizedShownDatesByReflectionId = sanitizeShownDatesByReflectionId(
    parsed.shownDatesByReflectionId,
    sanitizedDailySelections,
  );
  const sanitizedDailyThemeSelections = sanitizeDailyThemeSelections(parsed.dailyThemeSelections, sanitizedDailySelections);
  const sanitizedCollections = sanitizePersonalCollections(parsed.personalCollections);
  const sanitizedCollectionEntries = sanitizeCollectionEntries(parsed.collectionEntries, sanitizedCollections);
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
    hasSeenDailyReflectionPreview:
      typeof parsed.hasSeenDailyReflectionPreview === "boolean"
        ? parsed.hasSeenDailyReflectionPreview
        : false,
    hasSeenInitialPremiumOffer:
      typeof parsed.hasSeenInitialPremiumOffer === "boolean"
        ? parsed.hasSeenInitialPremiumOffer
        : false,
    hasSeenPostReflectionPremiumInvite:
      typeof parsed.hasSeenPostReflectionPremiumInvite === "boolean"
        ? parsed.hasSeenPostReflectionPremiumInvite
        : false,
    localUserId: sanitizeLocalUserId(secureLocalUserId ?? parsed.localUserId),
    preferredLanguage: sanitizeLanguage(parsed.preferredLanguage),
    reflectionLanguageMode: sanitizeReflectionLanguageMode(parsed.reflectionLanguageMode),
    reflectionLanguage: sanitizeLanguage(parsed.reflectionLanguage),
    reflectionLanguages: sanitizeQuoteLanguages(
      parsed.reflectionLanguages ?? parsed.quoteLanguages ?? (parsed.reflectionLanguage ? [parsed.reflectionLanguage] : undefined),
      parsed.preferredLanguage,
    ),
    quoteLanguages: sanitizeQuoteLanguages(
      parsed.reflectionLanguages ?? parsed.quoteLanguages ?? (parsed.reflectionLanguage ? [parsed.reflectionLanguage] : undefined),
      parsed.preferredLanguage,
    ),
    quoteLanguageSelections: sanitizeQuoteLanguageSelections(parsed.quoteLanguageSelections),
    subscriptionModel: sanitizeSubscriptionModel(parsed.subscriptionModel),
    userName: sanitizeUserName(parsed.userName),
    userPreferences: sanitizeOnboardingPreferences(parsed.userPreferences, parsed.userPreference),
    dailyNotificationTime: sanitizedDailyNotificationTime ?? fallbackNotificationTime,
    lastNotificationMessage:
      typeof parsed.lastNotificationMessage === "string" ? parsed.lastNotificationMessage.trim() || null : null,
    lastNotificationDate:
      typeof parsed.lastNotificationDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.lastNotificationDate)
        ? parsed.lastNotificationDate
        : null,
    reflectionNotes: sanitizeReflectionNotes(parsed.reflectionNotes),
    favorites: sanitizeFavorites(parsed.favorites, sanitizedDailySelections),
    shownDatesByReflectionId: sanitizedShownDatesByReflectionId,
    dailyThemeSelections: sanitizedDailyThemeSelections,
    activeReflectionId: typeof parsed.activeReflectionId === "string" ? parsed.activeReflectionId.trim() || null : null,
    activeReflectionDateKey:
      typeof parsed.activeReflectionDateKey === "string" && /^\d{4}-\d{2}-\d{2}$/.test(parsed.activeReflectionDateKey)
        ? parsed.activeReflectionDateKey
        : null,
    activeReflectionActivatedAt: sanitizeIsoTimestamp(parsed.activeReflectionActivatedAt),
    activeReflectionViewedAtByDate: sanitizeViewedAtByDate(parsed.activeReflectionViewedAtByDate),
    reminderScheduleByDate: sanitizeReminderScheduleByDate(parsed.reminderScheduleByDate),
    lateOpenDeferredDates: uniqueStrings(parsed.lateOpenDeferredDates),
    personalCollections: sanitizedCollections,
    collectionEntries: sanitizedCollectionEntries,
    viewedDates: uniqueStrings(parsed.viewedDates),
    lastFreemiumUpgradePromptAt: sanitizeIsoTimestamp(parsed.lastFreemiumUpgradePromptAt),
    lastFreemiumUpgradeNotificationAt: sanitizeIsoTimestamp(parsed.lastFreemiumUpgradeNotificationAt),
    premiumPromptHistory: sanitizePremiumPromptHistory(parsed.premiumPromptHistory),
    dailySelections: sanitizedDailySelections,
    reflectionFollowUps: sanitizeReflectionFollowUps(parsed.reflectionFollowUps),
    preferences: {
      ...defaultPreferences,
      ...parsed.preferences,
      reminderPreset: sanitizeReminderPreset(parsed.preferences?.reminderPreset),
      notificationsEnabled:
        typeof parsed.preferences?.notificationsEnabled === "boolean"
          ? parsed.preferences.notificationsEnabled
          : defaultPreferences.notificationsEnabled,
      soundEnabled:
        typeof parsed.preferences?.soundEnabled === "boolean"
          ? parsed.preferences.soundEnabled
          : defaultPreferences.soundEnabled,
      hapticsEnabled:
        typeof parsed.preferences?.hapticsEnabled === "boolean"
          ? parsed.preferences.hapticsEnabled
          : defaultPreferences.hapticsEnabled,
      silentMode:
        typeof parsed.preferences?.silentMode === "boolean"
          ? parsed.preferences.silentMode
          : defaultPreferences.silentMode,
      appearanceMode: sanitizeAppearanceMode(parsed.preferences?.appearanceMode),
      selectedAppearancePresetId: sanitizeAppearancePresetId(parsed.preferences?.selectedAppearancePresetId),
      appBackgroundColor: sanitizeCustomPaperColor(
        parsed.preferences?.appBackgroundColor ??
          (parsed.preferences as { appBackgroundPresetId?: string | null } | undefined)?.appBackgroundPresetId,
        "#FFFFFF",
      ),
      textColorMode: sanitizeTextColorMode(parsed.preferences?.textColorMode),
      customTextColor: sanitizeCustomPaperColor(parsed.preferences?.customTextColor, "#221B15"),
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
}

function sanitizePremiumPromptHistory(
  history: Partial<Record<string, { lastShownAt?: string | null; lastDismissedAt?: string | null; lastOpenedAt?: string | null }>> | null | undefined,
) {
  if (!history || typeof history !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(history)
      .filter(([key]) =>
        key === "general" || key === "save" || key === "collections" || key === "personalization" || key === "reengagement",
      )
      .map(([key, value]) => [
        key,
        {
          lastShownAt: sanitizeIsoTimestamp(value?.lastShownAt),
          lastDismissedAt: sanitizeIsoTimestamp(value?.lastDismissedAt),
          lastOpenedAt: sanitizeIsoTimestamp(value?.lastOpenedAt),
        },
      ]),
  );
}

function sanitizeTextColorMode(mode: string | null | undefined): AppPreferences["textColorMode"] {
  return mode === "custom" ? "custom" : "default";
}

function sanitizeAppearanceMode(mode: string | null | undefined): AppPreferences["appearanceMode"] {
  return mode === "preset" || mode === "custom" ? mode : "default";
}

function sanitizeReminderPreset(preset: string | null | undefined): ReminderPreset {
  return preset === "midday" || preset === "evening" || preset === "late" || preset === "custom"
    ? preset
    : "morning";
}

export async function loadAppStateSnapshot(): Promise<AppStorageState> {
  try {
    const raw = await loadRawAppState();
    if (!raw) {
      return defaultAppState;
    }

    const parsed = JSON.parse(raw) as Partial<AppStorageState> & { userPreference?: string | null };
    return sanitizeParsedState(parsed);
  } catch (error) {
    console.warn("Failed to load app state snapshot, using defaults", error);
    return defaultAppState;
  }
}

export async function loadDeferredLocalUserId(currentLocalUserId: string): Promise<string> {
  const secureLocalUserId = await loadSecureLocalUserId();
  const nextLocalUserId = sanitizeLocalUserId(secureLocalUserId ?? currentLocalUserId);

  if (nextLocalUserId !== secureLocalUserId) {
    await persistSecureLocalUserId(nextLocalUserId);
  }

  return nextLocalUserId;
}

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

function sanitizeShownDatesByReflectionId(
  shownDatesByReflectionId: Record<string, string> | undefined,
  dailySelections: Record<string, string>,
): Record<string, string> {
  const migratedFromDailySelections = Object.entries(dailySelections).reduce<Record<string, string>>(
    (accumulator, [date, reflectionId]) => {
      const existingDate = accumulator[reflectionId];
      if (!existingDate || existingDate < date) {
        accumulator[reflectionId] = date;
      }
      return accumulator;
    },
    {},
  );

  if (!shownDatesByReflectionId) {
    return migratedFromDailySelections;
  }

  return Object.entries(shownDatesByReflectionId).reduce<Record<string, string>>(
    (accumulator, [reflectionId, date]) => {
      const normalizedReflectionId = reflectionId.trim();
      const normalizedDate = date?.trim();

      if (!normalizedReflectionId || !normalizedDate || !/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        return accumulator;
      }

      const existingDate = accumulator[normalizedReflectionId];
      if (!existingDate || existingDate < normalizedDate) {
        accumulator[normalizedReflectionId] = normalizedDate;
      }

      return accumulator;
    },
    { ...migratedFromDailySelections },
  );
}

function resolveReflectionCategoryById(reflectionId: string) {
  return YEARLY_REFLECTIONS_BY_ID.get(reflectionId)?.category ?? REFLECTION_SEED.find((entry) => entry.id === reflectionId)?.category ?? null;
}

function sanitizeDailyThemeSelections(
  dailyThemeSelections: Record<string, string> | undefined,
  dailySelections: Record<string, string>,
): Record<string, AppStorageState["dailyThemeSelections"][string]> {
  const migratedFromSelections = Object.entries(dailySelections).reduce<Record<string, AppStorageState["dailyThemeSelections"][string]>>(
    (accumulator, [date, reflectionId]) => {
      const category = resolveReflectionCategoryById(reflectionId);
      if (category) {
        accumulator[date] = category;
      }
      return accumulator;
    },
    {},
  );

  if (!dailyThemeSelections) {
    return migratedFromSelections;
  }

  return Object.entries(dailyThemeSelections).reduce<Record<string, AppStorageState["dailyThemeSelections"][string]>>(
    (accumulator, [date, theme]) => {
      const normalizedDate = date.trim();
      const normalizedTheme = normalizeCategory(theme ?? "");

      if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
        return accumulator;
      }

      if (!REFLECTION_CATEGORIES.includes(normalizedTheme as AppStorageState["dailyThemeSelections"][string])) {
        return accumulator;
      }

      accumulator[normalizedDate] = normalizedTheme as AppStorageState["dailyThemeSelections"][string];
      return accumulator;
    },
    { ...migratedFromSelections },
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

function sanitizeReflectionLanguageMode(mode: string | null | undefined): AppStorageState["reflectionLanguageMode"] {
  return mode === "custom" ? "custom" : "same_as_app";
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

function sanitizeLocalUserId(localUserId: string | null | undefined): string {
  if (!localUserId) {
    return createLocalUserId();
  }

  const trimmed = localUserId.trim();
  return trimmed.length ? trimmed : createLocalUserId();
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

function sanitizeIsoTimestamp(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return Number.isNaN(Date.parse(trimmed)) ? null : trimmed;
}

function sanitizePaperThemeId(paperThemeId: string | null | undefined): AppPreferences["paperThemeId"] {
  const matchingTheme = PAPER_THEME_PRESETS.find((preset) => preset.id === paperThemeId);
  return matchingTheme?.id ?? defaultPreferences.paperThemeId;
}

function sanitizeAppearancePresetId(
  appearancePresetId: string | null | undefined,
): AppPreferences["selectedAppearancePresetId"] {
  if (!appearancePresetId) {
    return null;
  }

  const matchingPreset = APPEARANCE_PRESETS.find((preset) => preset.id === appearancePresetId);
  return matchingPreset?.id ?? null;
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

function sanitizeViewedAtByDate(
  viewedAtByDate: Record<string, string> | undefined,
): Record<string, string> {
  if (!viewedAtByDate) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(viewedAtByDate).filter(
      ([date, timestamp]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && !Number.isNaN(Date.parse(timestamp)),
    ),
  );
}

function sanitizeReminderScheduleByDate(
  reminderScheduleByDate: Record<string, DailyReminderSchedule> | undefined,
): Record<string, DailyReminderSchedule> {
  if (!reminderScheduleByDate) {
    return {};
  }

  return Object.entries(reminderScheduleByDate).reduce<Record<string, DailyReminderSchedule>>((accumulator, [date, value]) => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !value || typeof value !== "object") {
      return accumulator;
    }

    const reminderIds = uniqueStrings(value.reminderIds);
    const scheduledAt = uniqueStrings(value.scheduledAt).filter((entry) => !Number.isNaN(Date.parse(entry)));

    accumulator[date] = {
      reminderIds,
      followUpReminderCount: Math.min(Math.max(Number(value.followUpReminderCount) || 0, 0), 2),
      scheduledAt,
      cancelledAt: sanitizeIsoTimestamp(value.cancelledAt),
    };

    return accumulator;
  }, {});
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

function sanitizePersonalCollections(
  collections: PersonalCollection[] | undefined,
): PersonalCollection[] {
  if (!collections) {
    return [];
  }

  return collections
    .filter((collection): collection is PersonalCollection => Boolean(collection?.id && collection?.title && collection?.createdAt))
    .map((collection) => ({
      id: collection.id.trim(),
      title: collection.title.trim(),
      createdAt: collection.createdAt.trim(),
      updatedAt: collection.updatedAt?.trim() || collection.createdAt.trim(),
      description: collection.description?.trim() || null,
    }))
    .filter((collection) => collection.id.length > 0 && collection.title.length > 0 && collection.createdAt.length > 0 && collection.updatedAt.length > 0);
}

function sanitizeCollectionEntries(
  collectionEntries: Record<string, string[]> | undefined,
  collections: PersonalCollection[] = [],
): Record<string, string[]> {
  if (!collectionEntries) {
    return {};
  }

  const validCollectionIds = new Set(collections.map((collection) => collection.id));

  return Object.fromEntries(
    Object.entries(collectionEntries)
      .map(([collectionId, keys]) => [collectionId.trim(), uniqueStrings(keys)] as const)
      .filter(([collectionId, keys]) => collectionId.length > 0 && keys.length > 0)
      .filter(([collectionId]) => validCollectionIds.size === 0 || validCollectionIds.has(collectionId)),
  );
}

export async function loadAppState(): Promise<AppStorageState> {
  try {
    const raw = await loadRawAppState();
    const secureLocalUserId = await loadSecureLocalUserId();

    if (!raw) {
      const nextLocalUserId = sanitizeLocalUserId(secureLocalUserId);
      if (nextLocalUserId !== secureLocalUserId) {
        await persistSecureLocalUserId(nextLocalUserId);
      }

      return {
        ...defaultAppState,
        localUserId: nextLocalUserId,
      };
    }

    const parsed = JSON.parse(raw) as Partial<AppStorageState> & { userPreference?: string | null };
    return sanitizeParsedState(parsed, secureLocalUserId);
  } catch (error) {
    console.warn("Failed to load app state, using defaults", error);
    const secureLocalUserId = await loadSecureLocalUserId();
    return {
      ...defaultAppState,
      localUserId: sanitizeLocalUserId(secureLocalUserId),
    };
  }
}

export async function saveAppState(state: AppStorageState): Promise<void> {
  await persistSecureLocalUserId(state.localUserId);

  const { localUserId: _localUserId, ...persistedState } = state;
  await AsyncStorage.setItem(STORAGE_KEYS.appState, JSON.stringify(persistedState));
}

export async function clearAppState(): Promise<void> {
  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.appState),
    SecureStore.deleteItemAsync(STORAGE_KEYS.secureLocalUserId),
  ]);
}
