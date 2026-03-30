import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AppState, I18nManager, useColorScheme } from "react-native";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import {
  cancelNotificationIds,
  NotificationContentOptions,
  clearFreemiumUpgradeReminder,
  clearScheduledNotification,
  clearYearEndPremiumReminder,
  rescheduleDailyNotification,
  scheduleFollowUpRemindersForDay,
} from "@/services/notificationService";
import { trackAppEvent } from "@/services/analytics";
import { getCurrentDayKey, getReflectionForDateKey } from "@/services/dailyReflectionSource";
import { fetchCurrentProfile, getCurrentSession, signOutUser, upsertCurrentProfile } from "@/services/authService";
import { mergeLocalSavedReflections, getSavedReflections } from "@/services/savedReflectionsService";
import { syncPurchasesIdentity } from "@/services/purchases";
import {
  getFavoriteEntryKey,
  hydrateReflectionById,
  resolveDailyReflectionSelection,
} from "@/services/reflectionService";
import {
  clearAppState,
  defaultAppState,
  loadAppStateSnapshot,
  loadDeferredLocalUserId,
  saveAppState,
} from "@/storage/appStorage";
import { getAppStrings } from "@/localization/strings";
import { sanitizeCustomPaperColor } from "@/theme/paperColor";
import { AppearancePresetId, PageStylePresetId, PaperThemePresetId, TypographyPresetId } from "@/theme/presets";
import type { PersonalizationSelection } from "@/theme/system";
import { resolvePersonalizationSelection } from "@/theme/system";
import {
  AppPreferences,
  AppStorageState,
  NotificationPreference,
  OnboardingPreference,
  PersonalCollection,
  PersonalCollectionSummary,
  PremiumPromptContext,
  ReflectionCategory,
  ReflectionLanguageMode,
  ReflectionItem,
  SubscriptionModel,
  SupportedLanguage,
  ThemePreference,
  TextColorMode,
  AppearanceMode,
} from "@/types/reflection";
import { StoredReflectionFollowUp } from "@/types/ai";
import { AppAuthSession, AuthStatus } from "@/types/auth";
import { UserProfile } from "@/types/profile";
import { SavedReflectionUpsertInput } from "@/types/savedReflection";
import {
  getInitialLanguage,
  isRTLLanguage,
  persistLanguageSelection,
  sanitizeAppLanguageForSubscription,
  sanitizeReflectionLanguageForSubscription,
  sanitizeReflectionLanguagesForSubscription,
} from "@/localization/languages";
import { getEffectiveReflectionLanguages, todayISODate } from "@/utils/reflection";
import { AppColorScheme, setGlobalPaperThemeId } from "@/utils/theme";
import { getAdjacentISODate, getReflectionActivationTimestamp } from "@/utils/date";

type SavedReflectionsSyncState = "idle" | "syncing" | "ready" | "error";

interface AppContextValue {
  isReady: boolean;
  appBootReady: boolean;
  storageReady: boolean;
  todayReady: boolean;
  settingsReady: boolean;
  appState: AppStorageState;
  authStatus: AuthStatus;
  authSession: AppAuthSession | null;
  userProfile: UserProfile | null;
  savedReflectionsSyncState: SavedReflectionsSyncState;
  colorScheme: AppColorScheme;
  todaysReflection: ReflectionItem | null;
  archive: ReflectionItem[];
  favorites: ReflectionItem[];
  collections: PersonalCollectionSummary[];
  availableDates: string[];
  personalization: PersonalizationSelection;
  getReflectionForDate: (date: string) => ReflectionItem;
  getReflectionNote: (date: string, reflectionId: string) => string;
  getReflectionFollowUp: (date: string, reflectionId: string) => StoredReflectionFollowUp | null;
  getCollectionById: (collectionId: string) => PersonalCollection | null;
  getCollectionReflections: (collectionId: string) => ReflectionItem[];
  isReflectionInCollection: (collectionId: string, date: string, reflectionId: string) => boolean;
  completeOnboarding: (payload: {
    preferredLanguage: SupportedLanguage | null;
    userName: string | null;
    userPreferences: OnboardingPreference[];
    reminderTime: NotificationPreference;
    reminderPreset: AppPreferences["reminderPreset"];
  }) => Promise<void>;
  markTodayIntroOverlaySeen: () => Promise<void>;
  markDailyReflectionPreviewSeen: () => Promise<void>;
  markInitialPremiumOfferSeen: () => Promise<void>;
  markFreemiumUpgradePromptSeen: (options?: { postReflection?: boolean }) => Promise<void>;
  markFreemiumUpgradeNotificationScheduled: () => Promise<void>;
  markPremiumPromptShown: (context: PremiumPromptContext) => Promise<void>;
  markPremiumPromptDismissed: (context: PremiumPromptContext) => Promise<void>;
  markPremiumPromptOpened: (context: PremiumPromptContext) => Promise<void>;
  refreshAuthState: () => Promise<void>;
  signOutCurrentUser: () => Promise<void>;
  toggleFavorite: (reflectionId: string, date?: string) => Promise<void>;
  updateCategories: (categories: ReflectionCategory[]) => Promise<void>;
  updateNotificationTime: (
    preference: NotificationPreference,
    options?: {
      schedule?: boolean;
      requestPermission?: boolean;
      notificationContent?: NotificationContentOptions;
    },
  ) => Promise<void>;
  updateNotificationDeliveryPreferences: (
    preferences: Partial<
      Pick<AppPreferences, "notificationsEnabled" | "soundEnabled" | "hapticsEnabled" | "silentMode">
    >,
  ) => Promise<void>;
  updateLanguage: (language: SupportedLanguage) => Promise<void>;
  updateReflectionLanguageMode: (mode: ReflectionLanguageMode) => Promise<void>;
  updateReflectionLanguages: (languages: SupportedLanguage[]) => Promise<void>;
  setReflectionCardLanguageSelection: (date: string, language: SupportedLanguage) => Promise<void>;
  updateSubscriptionModel: (model: SubscriptionModel) => Promise<void>;
  updateTheme: (theme: ThemePreference) => Promise<void>;
  updateAppearanceMode: (mode: AppearanceMode) => Promise<void>;
  updateAppearancePreset: (appearancePresetId: AppearancePresetId) => Promise<void>;
  updateAppBackgroundColor: (appBackgroundColor: string) => Promise<void>;
  updateTextColorMode: (mode: TextColorMode) => Promise<void>;
  updateCustomTextColor: (textColor: string) => Promise<void>;
  updatePaperTheme: (paperThemeId: PaperThemePresetId) => Promise<void>;
  updateCustomPaperColor: (paperColor: string) => Promise<void>;
  updateNoteBackgroundColor: (noteBackgroundColor: string) => Promise<void>;
  resetPaperThemeToPreset: () => Promise<void>;
  updateTypographyPreset: (typographyPresetId: TypographyPresetId) => Promise<void>;
  updatePageStyle: (pageStyleId: PageStylePresetId) => Promise<void>;
  updateReflectionNote: (date: string, reflectionId: string, note: string) => Promise<void>;
  updateReflectionFollowUp: (
    date: string,
    reflectionId: string,
    followUp: StoredReflectionFollowUp | null,
  ) => Promise<void>;
  markActiveReflectionViewed: () => Promise<void>;
  deferActiveReflectionForToday: () => Promise<void>;
  createCollection: (input: { title: string; description?: string | null }) => Promise<string>;
  renameCollection: (collectionId: string, input: { title: string; description?: string | null }) => Promise<void>;
  deleteCollection: (collectionId: string) => Promise<void>;
  addReflectionToCollection: (collectionId: string, date: string, reflectionId: string) => Promise<void>;
  removeReflectionFromCollection: (collectionId: string, date: string, reflectionId: string) => Promise<void>;
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function resolveColorScheme(theme: ThemePreference, systemScheme: string | null | undefined): AppColorScheme {
  if (theme === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return theme;
}

function buildNotificationScheduleSignature(
  language: SupportedLanguage | null,
  preferences: Pick<AppPreferences, "notificationTime" | "notificationsEnabled" | "soundEnabled" | "silentMode">,
) {
  return [
    language ?? "en",
    preferences.notificationTime.hour,
    preferences.notificationTime.minute,
    preferences.notificationsEnabled ? "enabled" : "disabled",
    preferences.soundEnabled ? "sound" : "mute",
    preferences.silentMode ? "silent" : "normal",
  ].join(":");
}

function getDeviceTimezone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone ?? null;
  } catch {
    return null;
  }
}

function buildSavedReflectionSyncPayload(state: AppStorageState): SavedReflectionUpsertInput[] {
  const language = resolveStoredQuoteLanguage(state);

  return state.favorites
    .map((favoriteKey) => {
      const [dateKey, reflectionIdCandidate] = favoriteKey.includes(":")
        ? favoriteKey.split(":")
        : [state.shownDatesByReflectionId[favoriteKey] ?? "", favoriteKey];

      if (!dateKey || !reflectionIdCandidate) {
        return null;
      }

      const reflection = hydrateReflectionById(reflectionIdCandidate, dateKey, state.favorites, language);
      if (!reflection) {
        return null;
      }

      return {
        userId: "",
        reflectionId: reflection.id,
        dateKey: reflection.date,
        reflectionText: reflection.text,
        theme: String(reflection.category),
        tags: [String(reflection.category), String(reflection.tone)],
      } as SavedReflectionUpsertInput;
    })
    .filter((entry): entry is SavedReflectionUpsertInput => entry !== null);
}

function formatNotificationTime(preference: NotificationPreference): string {
  return `${`${preference.hour}`.padStart(2, "0")}:${`${preference.minute}`.padStart(2, "0")}`;
}

function getReflectionNoteKey(date: string, reflectionId: string) {
  return `${date}:${reflectionId}`;
}

function getReflectionFollowUpKey(date: string, reflectionId: string) {
  return `${date}:${reflectionId}`;
}

function createCollectionId() {
  return `collection-${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

function removeReflectionKeyFromCollections(
  collectionEntries: Record<string, string[]>,
  reflectionKey: string,
): Record<string, string[]> {
  return Object.fromEntries(
    Object.entries(collectionEntries)
      .map(([collectionId, keys]) => [collectionId, keys.filter((key) => key !== reflectionKey)] as const)
      .filter(([, keys]) => keys.length > 0),
  );
}

function resolveStoredQuoteLanguages(state: AppStorageState): SupportedLanguage[] {
  return getEffectiveReflectionLanguages({
    appLanguage: state.preferredLanguage,
    reflectionLanguageMode: state.reflectionLanguageMode,
    reflectionLanguage: state.reflectionLanguage,
    reflectionLanguages: state.reflectionLanguages,
    subscriptionModel: state.subscriptionModel,
  });
}

function resolveStoredQuoteLanguage(state: AppStorageState): SupportedLanguage {
  return resolveStoredQuoteLanguages(state)[0] ?? "en";
}

function markReflectionAsShown(
  shownDatesByReflectionId: Record<string, string>,
  reflectionId: string,
  date: string,
): Record<string, string> {
  const previousDate = shownDatesByReflectionId[reflectionId];
  if (previousDate === date) {
    return shownDatesByReflectionId;
  }

  if (previousDate && previousDate > date) {
    return shownDatesByReflectionId;
  }

  return {
    ...shownDatesByReflectionId,
    [reflectionId]: date,
  };
}

function sanitizeLanguageStateForSubscription(
  preferredLanguage: SupportedLanguage | null | undefined,
  reflectionLanguageMode: ReflectionLanguageMode,
  reflectionLanguage: SupportedLanguage | null | undefined,
  reflectionLanguages: readonly (SupportedLanguage | null | undefined)[] | null | undefined,
  subscriptionModel: SubscriptionModel,
): Pick<
  AppStorageState,
  "preferredLanguage" | "reflectionLanguageMode" | "reflectionLanguage" | "reflectionLanguages" | "quoteLanguages"
> {
  const nextPreferredLanguage = sanitizeAppLanguageForSubscription(preferredLanguage ?? "en", subscriptionModel);
  const nextReflectionLanguageMode: ReflectionLanguageMode =
    subscriptionModel === "Freemium" ? "same_as_app" : reflectionLanguageMode === "custom" ? "custom" : "same_as_app";
  const nextReflectionLanguages =
    nextReflectionLanguageMode === "custom"
      ? sanitizeReflectionLanguagesForSubscription(reflectionLanguages, nextPreferredLanguage, subscriptionModel)
      : [nextPreferredLanguage];
  const nextReflectionLanguage = sanitizeReflectionLanguageForSubscription(
    nextReflectionLanguages[0] ?? (nextReflectionLanguageMode === "custom" ? reflectionLanguage : nextPreferredLanguage),
    nextPreferredLanguage,
    subscriptionModel,
  );

  return {
    preferredLanguage: nextPreferredLanguage,
    reflectionLanguageMode: nextReflectionLanguageMode,
    reflectionLanguage: nextReflectionLanguage,
    reflectionLanguages: nextReflectionLanguages,
    quoteLanguages: nextReflectionLanguages,
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [appState, setAppState] = useState<AppStorageState>(defaultAppState);
  const [appBootReady, setAppBootReady] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [todayReady, setTodayReady] = useState(false);
  const [settingsReady, setSettingsReady] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState(getCurrentDayKey());
  const [authStatus, setAuthStatus] = useState<AuthStatus>("loading");
  const [authSession, setAuthSession] = useState<AppAuthSession | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [savedReflectionsSyncState, setSavedReflectionsSyncState] = useState<SavedReflectionsSyncState>("idle");
  const notificationScheduleSignatureRef = useRef<string | null>(null);
  const savedReflectionsSyncSignatureRef = useRef<string | null>(null);

  useEffect(() => {
    try {
      I18nManager.allowRTL(true);
      I18nManager.swapLeftAndRightInRTL(false);
    } catch (error) {
      console.warn("[BOOT] unable to prepare RTL support", error);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapCritical() {
      console.info("[BOOT] app shell start");
      try {
        const storedState = await loadAppStateSnapshot();
        const initialLanguage = storedState.preferredLanguage ?? (await getInitialLanguage());
        if (!isMounted) {
          return;
        }

        const sanitizedLanguageState = sanitizeLanguageStateForSubscription(
          storedState.preferredLanguage ?? initialLanguage,
          storedState.reflectionLanguageMode,
          storedState.reflectionLanguage ?? storedState.reflectionLanguages[0] ?? storedState.quoteLanguages[0] ?? initialLanguage,
          storedState.reflectionLanguages ?? storedState.quoteLanguages,
          storedState.subscriptionModel,
        );

        setAppState({
          ...storedState,
          ...sanitizedLanguageState,
        });
        console.info("[BOOT] local state loaded");
      } catch (error) {
        console.warn("[BOOT] failed to load critical local state, falling back to defaults", error);
        if (isMounted) {
          void getInitialLanguage()
            .then((initialLanguage) => {
              setAppState({
                ...defaultAppState,
                preferredLanguage: initialLanguage,
                reflectionLanguage: initialLanguage,
                reflectionLanguages: [initialLanguage],
                quoteLanguages: [initialLanguage],
              });
            })
            .catch(() => {
              setAppState(defaultAppState);
            });
        }
      } finally {
        if (isMounted) {
          setCurrentDateKey(getCurrentDayKey());
          setStorageReady(true);
          setSettingsReady(true);
          setAppBootReady(true);
          console.info("[BOOT] shell ready");
        }
      }
    }

    async function bootstrapDeferred() {
      try {
        const nextLocalUserId = await loadDeferredLocalUserId(defaultAppState.localUserId);
        if (!isMounted) {
          return;
        }

        setAppState((previous) =>
          previous.localUserId === nextLocalUserId
            ? previous
            : {
                ...previous,
                localUserId: nextLocalUserId,
              },
        );
        console.info("[BOOT] deferred identifiers ready");
      } catch (error) {
        console.warn("[BOOT] deferred identifier setup failed, continuing with local fallback", error);
      }
    }

    bootstrapCritical()
      .catch((error) => {
        console.warn("[BOOT] unexpected critical bootstrap failure", error);
        if (isMounted) {
          setCurrentDateKey(getCurrentDayKey());
          setStorageReady(true);
          setSettingsReady(true);
          setAppBootReady(true);
        }
      })
      .finally(() => {
        void bootstrapDeferred();
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setCurrentDateKey(getCurrentDayKey());
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    setCurrentDateKey(getCurrentDayKey());
  }, [appState.hasCompletedOnboarding]);

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    saveAppState(appState).catch((error) => {
      console.warn("Failed to persist app state", error);
    });
  }, [appState, storageReady]);

  const todaysReflection = useMemo(() => {
    if (!appState.hasCompletedOnboarding) {
      return null;
    }

    const quoteLanguage = resolveStoredQuoteLanguage(appState);

    return getReflectionForDateKey(
      currentDateKey,
      appState.preferences.selectedCategories,
      appState.favorites,
      appState.dailySelections,
      quoteLanguage,
    );
  }, [
    currentDateKey,
    appState.dailySelections,
    appState.favorites,
    appState.hasCompletedOnboarding,
    appState.preferences.selectedCategories,
    appState.reflectionLanguage,
    appState.reflectionLanguageMode,
    appState.reflectionLanguages,
    appState.preferredLanguage,
    appState.subscriptionModel,
  ]);

  const archive = useMemo(() => {
    return Object.entries(appState.dailySelections)
      .filter(([date, reflectionId]) => {
        const hydrated = hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState),
        );

        return date < currentDateKey || Boolean(hydrated?.isFavorite);
      })
      .map(([date, reflectionId]) => {
        return hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState),
        );
      })
      .filter((item): item is ReflectionItem => Boolean(item))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [
    currentDateKey,
    appState.dailySelections,
    appState.favorites,
    appState.preferredLanguage,
    appState.reflectionLanguage,
    appState.reflectionLanguageMode,
    appState.reflectionLanguages,
    appState.subscriptionModel,
  ]);

  const favorites = useMemo(() => {
    return Object.entries(appState.dailySelections)
      .map(([date, reflectionId]) =>
        hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState),
        ),
      )
      .filter((item): item is ReflectionItem => Boolean(item))
      .filter((item) => item.isFavorite)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [
    appState.dailySelections,
    appState.favorites,
    appState.preferredLanguage,
    appState.reflectionLanguage,
    appState.reflectionLanguageMode,
    appState.reflectionLanguages,
    appState.subscriptionModel,
  ]);

  const collections = useMemo(() => {
    return appState.personalCollections
      .map((collection) => ({
        ...collection,
        reflectionCount: appState.collectionEntries[collection.id]?.length ?? 0,
      }))
      .sort((a, b) => ((a.updatedAt || a.createdAt) < (b.updatedAt || b.createdAt) ? 1 : -1));
  }, [appState.collectionEntries, appState.personalCollections]);

  const availableDates = useMemo(() => {
    const priorDates = archive.map((item) => item.date);
    return todaysReflection ? Array.from(new Set([currentDateKey, ...priorDates])) : priorDates;
  }, [archive, currentDateKey, todaysReflection]);

  const personalization = useMemo(() => {
    return resolvePersonalizationSelection({
      selectedAppearancePresetId: appState.preferences.selectedAppearancePresetId,
      paperThemeId: appState.preferences.paperThemeId,
      typographyPresetId: appState.preferences.typographyPresetId,
      pageStyleId: appState.preferences.pageStyleId,
    });
  }, [
    appState.preferences.selectedAppearancePresetId,
    appState.preferences.pageStyleId,
    appState.preferences.paperThemeId,
    appState.preferences.typographyPresetId,
  ]);

  function lookupReflectionForDate(date: string) {
    return getReflectionForDateKey(
      date,
      appState.preferences.selectedCategories,
      appState.favorites,
      appState.dailySelections,
      resolveStoredQuoteLanguage(appState),
    );
  }

  function getReflectionNote(date: string, reflectionId: string) {
    return appState.reflectionNotes[getReflectionNoteKey(date, reflectionId)] ?? "";
  }

  function getReflectionFollowUp(date: string, reflectionId: string) {
    return appState.reflectionFollowUps[getReflectionFollowUpKey(date, reflectionId)] ?? null;
  }

  function getCollectionById(collectionId: string) {
    return appState.personalCollections.find((collection) => collection.id === collectionId) ?? null;
  }

  function isReflectionInCollection(collectionId: string, date: string, reflectionId: string) {
    return (appState.collectionEntries[collectionId] ?? []).includes(getFavoriteEntryKey(date, reflectionId));
  }

  function getCollectionReflections(collectionId: string) {
    const keys = appState.collectionEntries[collectionId] ?? [];

    return keys
      .map((key) => {
        const [date, reflectionId] = key.split(":");
        if (!date || !reflectionId) {
          return null;
        }

        return hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState),
        );
      })
      .filter((item): item is ReflectionItem => Boolean(item))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }

  useEffect(() => {
    if (!storageReady || !appState.hasCompletedOnboarding) {
      return;
    }

    setAppState((previous) => {
      const currentLanguage = resolveStoredQuoteLanguage(previous);
      const previousDateKey = getAdjacentISODate(currentDateKey, -1);
      const persistedReflectionId = previous.dailySelections[currentDateKey];
      const selection = resolveDailyReflectionSelection(
        currentDateKey,
        previous.preferences.selectedCategories,
        persistedReflectionId,
        {
          shownDatesByReflectionId: previous.shownDatesByReflectionId,
          previousReflectionId: previous.dailySelections[previousDateKey] ?? null,
          dailyThemeSelections: previous.dailyThemeSelections,
          persistedTheme: previous.dailyThemeSelections[currentDateKey] ?? null,
          language: currentLanguage,
        },
      );
      const reflectionId = selection.entry.id;

      if (
        persistedReflectionId === reflectionId &&
        previous.dailyThemeSelections[currentDateKey] === selection.theme &&
        previous.activeReflectionId === reflectionId &&
        previous.activeReflectionDateKey === currentDateKey
      ) {
        return previous;
      }
      return {
        ...previous,
        dailySelections: {
          ...previous.dailySelections,
          [currentDateKey]: reflectionId,
        },
        dailyThemeSelections: {
          ...previous.dailyThemeSelections,
          [currentDateKey]: selection.theme,
        },
        activeReflectionId: reflectionId,
        activeReflectionDateKey: currentDateKey,
        activeReflectionActivatedAt: getReflectionActivationTimestamp(currentDateKey, previous.preferences.notificationTime),
        shownDatesByReflectionId: markReflectionAsShown(
          previous.shownDatesByReflectionId,
          reflectionId,
          currentDateKey,
        ),
      };
    });
  }, [
    currentDateKey,
    storageReady,
    appState.hasCompletedOnboarding,
    appState.preferences.selectedCategories,
    appState.preferredLanguage,
    appState.reflectionLanguage,
    appState.reflectionLanguageMode,
    appState.reflectionLanguages,
    appState.subscriptionModel,
  ]);

  useEffect(() => {
    if (!storageReady || !appState.hasCompletedOnboarding || !appState.activeReflectionDateKey) {
      return;
    }

    if (appState.activeReflectionDateKey !== todayISODate()) {
      return;
    }

    if (appState.activeReflectionViewedAtByDate[appState.activeReflectionDateKey]) {
      return;
    }

    const reminderSchedule = appState.reminderScheduleByDate[appState.activeReflectionDateKey];
    if (reminderSchedule?.followUpReminderCount) {
      return;
    }

    scheduleFollowUpRemindersForDay(appState.activeReflectionDateKey, appState.preferences.notificationTime, {
      title: getAppStrings(appState.preferredLanguage).notificationReadyTitle(appState.userName),
      userName: appState.userName,
      language: appState.preferredLanguage,
      notificationsEnabled: appState.preferences.notificationsEnabled,
      soundEnabled: appState.preferences.soundEnabled,
      silentMode: appState.preferences.silentMode,
    })
      .then((scheduledBatch) => {
        if (!scheduledBatch.reminderIds.length) {
          return;
        }

        setAppState((previous) => ({
          ...previous,
          reminderScheduleByDate: {
            ...previous.reminderScheduleByDate,
            [appState.activeReflectionDateKey as string]: {
              reminderIds: scheduledBatch.reminderIds,
              followUpReminderCount: scheduledBatch.reminderIds.length,
              scheduledAt: scheduledBatch.scheduledAt,
              cancelledAt: null,
            },
          },
        }));
      })
      .catch((error) => {
        console.warn("Failed to schedule follow-up reminders", error);
      });
  }, [
    storageReady,
    appState.activeReflectionDateKey,
    appState.activeReflectionViewedAtByDate,
    appState.hasCompletedOnboarding,
    appState.preferences.notificationTime,
    appState.preferences.notificationsEnabled,
    appState.preferences.silentMode,
    appState.preferences.soundEnabled,
    appState.preferredLanguage,
    appState.reminderScheduleByDate,
    appState.userName,
  ]);

  useEffect(() => {
    if (!appBootReady) {
      return;
    }

    if (!appState.hasCompletedOnboarding) {
      setTodayReady(true);
      return;
    }

    if (todaysReflection) {
      console.info("[TODAY] reflection ready");
      setTodayReady(true);
      return;
    }

    setTodayReady(false);
  }, [appBootReady, appState.hasCompletedOnboarding, todaysReflection]);

  useEffect(() => {
    if (!appState.preferredLanguage) {
      return;
    }

    console.info(
      `[BOOT] language ready (${appState.preferredLanguage}${isRTLLanguage(appState.preferredLanguage) ? ", rtl" : ", ltr"})`,
    );
  }, [appState.preferredLanguage]);

  async function refreshAuthState() {
    try {
      const session = await getCurrentSession();

      if (!session) {
        setAuthSession(null);
        setUserProfile(null);
        setAuthStatus("guest");
        setSavedReflectionsSyncState("idle");
        savedReflectionsSyncSignatureRef.current = null;
        return;
      }

      const existingProfile = await fetchCurrentProfile(session);
      if (!existingProfile) {
        await upsertCurrentProfile(session, {
          displayName: appState.userName,
          appLanguage: appState.preferredLanguage,
          reflectionLanguage: appState.reflectionLanguage,
          timezone: getDeviceTimezone(),
          notificationTime: appState.dailyNotificationTime,
          subscriptionTier: appState.subscriptionModel,
        });
      }

      const hydratedProfile = (await fetchCurrentProfile(session)) ?? existingProfile;

      setAuthSession(session);
      setUserProfile(hydratedProfile);
      setAuthStatus("authenticated");
    } catch (error) {
      console.warn("Failed to hydrate auth state", error);
      setAuthSession(null);
      setUserProfile(null);
      setAuthStatus("guest");
      setSavedReflectionsSyncState("error");
      savedReflectionsSyncSignatureRef.current = null;
    }
  }

  async function signOutCurrentUser() {
    await signOutUser();
    setAuthSession(null);
    setUserProfile(null);
    setAuthStatus("guest");
    setSavedReflectionsSyncState("idle");
    savedReflectionsSyncSignatureRef.current = null;
  }

  useEffect(() => {
    if (!storageReady) {
      return;
    }

    void refreshAuthState();
  }, [storageReady]);

  useEffect(() => {
    const revenueCatIdentity = authSession?.user.id ?? appState.localUserId;
    syncPurchasesIdentity(revenueCatIdentity).catch((error) => {
      console.warn("Failed to sync RevenueCat identity", error);
    });
  }, [authSession?.user.id, appState.localUserId]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !authSession) {
      return;
    }

    upsertCurrentProfile(authSession, {
      displayName: appState.userName,
      appLanguage: appState.preferredLanguage,
      reflectionLanguage: appState.reflectionLanguage,
      timezone: getDeviceTimezone(),
      notificationTime: appState.dailyNotificationTime,
      subscriptionTier: appState.subscriptionModel,
    }).catch((error) => {
      console.warn("Failed to sync user profile", error);
    });
  }, [
    appState.dailyNotificationTime,
    appState.preferredLanguage,
    appState.reflectionLanguage,
    appState.subscriptionModel,
    appState.userName,
    authSession,
    authStatus,
  ]);

  useEffect(() => {
    if (authStatus !== "authenticated" || !authSession) {
      return;
    }

    const localPayload = buildSavedReflectionSyncPayload(appState).map((entry) => ({
      ...entry,
      userId: authSession.user.id,
    }));
    const signature = JSON.stringify({
      userId: authSession.user.id,
      favorites: localPayload.map((entry) => `${entry.dateKey}:${entry.reflectionId}`).sort(),
    });

    if (savedReflectionsSyncSignatureRef.current === signature) {
      return;
    }

    setSavedReflectionsSyncState("syncing");

    mergeLocalSavedReflections(authSession, localPayload)
      .then(() => getSavedReflections(authSession))
      .then((remoteSaved) => {
        const syncedFavorites = remoteSaved
          .map((entry) => `${entry.dateKey}:${entry.reflectionId}`)
          .sort((a, b) => (a < b ? 1 : -1));
        savedReflectionsSyncSignatureRef.current = JSON.stringify({
          userId: authSession.user.id,
          favorites: syncedFavorites,
        });
        setSavedReflectionsSyncState("ready");
        setAppState((previous) => ({
          ...previous,
          favorites: syncedFavorites,
        }));
      })
      .catch((error) => {
        console.warn("Failed to sync saved reflections", error);
        setSavedReflectionsSyncState("error");
      });
  }, [
    appState.dailySelections,
    appState.favorites,
    appState.preferredLanguage,
    appState.reflectionLanguage,
    appState.reflectionLanguageMode,
    appState.reflectionLanguages,
    appState.shownDatesByReflectionId,
    appState.subscriptionModel,
    authSession,
    authStatus,
  ]);

  useEffect(() => {
    if (!storageReady || !appState.hasCompletedOnboarding || !appState.preferredLanguage) {
      return;
    }

    const signature = buildNotificationScheduleSignature(appState.preferredLanguage, appState.preferences);
    if (notificationScheduleSignatureRef.current === signature) {
      return;
    }

    rescheduleDailyNotification(appState.preferences.notificationTime, {
      language: appState.preferredLanguage,
      notificationsEnabled: appState.preferences.notificationsEnabled,
      soundEnabled: appState.preferences.soundEnabled,
      silentMode: appState.preferences.silentMode,
    })
      .then((scheduleResult) => {
        notificationScheduleSignatureRef.current = signature;
        setAppState((previous) => ({
          ...previous,
          preferences:
            previous.preferences.notificationsEnabled && !scheduleResult.permissionGranted
              ? {
                  ...previous.preferences,
                  notificationsEnabled: false,
                }
              : previous.preferences,
          lastNotificationMessage: scheduleResult.nextMessage,
          lastNotificationDate: scheduleResult.nextDate,
        }));
      })
      .catch((error) => {
        console.warn("Failed to sync daily reflection reminder", error);
      });
  }, [
    appState.hasCompletedOnboarding,
    appState.preferences,
    appState.preferredLanguage,
    storageReady,
  ]);

  async function completeOnboarding(payload: {
    preferredLanguage: SupportedLanguage | null;
    userName: string | null;
    userPreferences: OnboardingPreference[];
    reminderTime: NotificationPreference;
    reminderPreset: AppPreferences["reminderPreset"];
  }) {
    const preferenceCategoryMap: Record<OnboardingPreference, ReflectionCategory[]> = {
      clarity: ["clarity"],
      calm: ["calm"],
      direction: ["purpose"],
      focus: ["focus"],
    };
    const nextCategories = payload.userPreferences.length
      ? Array.from(new Set(payload.userPreferences.flatMap((preference) => preferenceCategoryMap[preference])))
      : REFLECTION_CATEGORIES;
    const nextPreferences: AppPreferences = {
      ...appState.preferences,
      selectedCategories: nextCategories,
      notificationTime: payload.reminderTime,
      reminderPreset: payload.reminderPreset,
    };
    const nextLanguage = sanitizeAppLanguageForSubscription(
      payload.preferredLanguage ?? (await getInitialLanguage()),
      "Freemium",
    );
    const selection = resolveDailyReflectionSelection(
      currentDateKey,
      nextCategories,
      appState.dailySelections[currentDateKey],
      {
        shownDatesByReflectionId: appState.shownDatesByReflectionId,
        previousReflectionId: appState.dailySelections[getAdjacentISODate(currentDateKey, -1)] ?? null,
        dailyThemeSelections: appState.dailyThemeSelections,
        persistedTheme: appState.dailyThemeSelections[currentDateKey] ?? null,
        language: nextLanguage,
      },
    );
    const selectedReflectionId = selection.entry.id;

    await persistLanguageSelection(nextLanguage);
    trackAppEvent("onboarding_completed", {
      language: nextLanguage,
      selectedPreferencesCount: payload.userPreferences.length,
      hasName: Boolean(payload.userName?.trim()),
    });

    setAppState((previous) => ({
      ...previous,
      hasCompletedOnboarding: true,
      hasSeenTodayIntroOverlay: false,
      hasSeenDailyReflectionPreview: false,
      hasSeenInitialPremiumOffer: false,
      hasSeenPostReflectionPremiumInvite: false,
      preferredLanguage: nextLanguage,
      reflectionLanguageMode: "same_as_app",
      reflectionLanguage: nextLanguage,
      reflectionLanguages: [nextLanguage],
      quoteLanguages: [nextLanguage],
      userName: payload.userName?.trim() || null,
      userPreferences: payload.userPreferences,
      dailyNotificationTime: formatNotificationTime(payload.reminderTime),
      dailySelections: previous.dailySelections[currentDateKey]
        ? previous.dailySelections
        : {
            ...previous.dailySelections,
            [currentDateKey]: selectedReflectionId,
          },
      dailyThemeSelections: previous.dailySelections[currentDateKey]
        ? previous.dailyThemeSelections
        : {
            ...previous.dailyThemeSelections,
            [currentDateKey]: selection.theme,
          },
      activeReflectionId: selectedReflectionId,
      activeReflectionDateKey: currentDateKey,
      activeReflectionActivatedAt: getReflectionActivationTimestamp(currentDateKey, payload.reminderTime),
      shownDatesByReflectionId: previous.dailySelections[currentDateKey]
        ? previous.shownDatesByReflectionId
        : markReflectionAsShown(previous.shownDatesByReflectionId, selectedReflectionId, currentDateKey),
      preferences: nextPreferences,
    }));
  }

  async function markTodayIntroOverlaySeen() {
    setAppState((previous) => ({
      ...previous,
      hasSeenTodayIntroOverlay: true,
    }));
  }

  async function markDailyReflectionPreviewSeen() {
    trackAppEvent("reflection_preview_seen");
    setAppState((previous) => ({
      ...previous,
      hasSeenDailyReflectionPreview: true,
    }));
  }

  async function markInitialPremiumOfferSeen() {
    setAppState((previous) => ({
      ...previous,
      hasSeenInitialPremiumOffer: true,
    }));
  }

  async function markFreemiumUpgradePromptSeen(options?: { postReflection?: boolean }) {
    setAppState((previous) => ({
      ...previous,
      hasSeenPostReflectionPremiumInvite:
        options?.postReflection === true ? true : previous.hasSeenPostReflectionPremiumInvite,
      lastFreemiumUpgradePromptAt: new Date().toISOString(),
    }));
  }

  async function markFreemiumUpgradeNotificationScheduled() {
    setAppState((previous) => ({
      ...previous,
      lastFreemiumUpgradeNotificationAt: new Date().toISOString(),
    }));
  }

  async function markPremiumPromptShown(context: PremiumPromptContext) {
    const now = new Date().toISOString();
    setAppState((previous) => ({
      ...previous,
      lastFreemiumUpgradePromptAt: now,
      premiumPromptHistory: {
        ...previous.premiumPromptHistory,
        [context]: {
          lastShownAt: now,
          lastDismissedAt: previous.premiumPromptHistory[context]?.lastDismissedAt ?? null,
          lastOpenedAt: previous.premiumPromptHistory[context]?.lastOpenedAt ?? null,
        },
      },
    }));
  }

  async function markPremiumPromptDismissed(context: PremiumPromptContext) {
    const now = new Date().toISOString();
    setAppState((previous) => ({
      ...previous,
      lastFreemiumUpgradePromptAt: now,
      premiumPromptHistory: {
        ...previous.premiumPromptHistory,
        [context]: {
          lastShownAt: previous.premiumPromptHistory[context]?.lastShownAt ?? now,
          lastDismissedAt: now,
          lastOpenedAt: previous.premiumPromptHistory[context]?.lastOpenedAt ?? null,
        },
      },
    }));
  }

  async function markPremiumPromptOpened(context: PremiumPromptContext) {
    const now = new Date().toISOString();
    setAppState((previous) => ({
      ...previous,
      lastFreemiumUpgradePromptAt: now,
      premiumPromptHistory: {
        ...previous.premiumPromptHistory,
        [context]: {
          lastShownAt: previous.premiumPromptHistory[context]?.lastShownAt ?? now,
          lastDismissedAt: previous.premiumPromptHistory[context]?.lastDismissedAt ?? null,
          lastOpenedAt: now,
        },
      },
    }));
  }

  async function markActiveReflectionViewed() {
    const activeDateKey = appState.activeReflectionDateKey ?? currentDateKey;
    const reminderSchedule = appState.reminderScheduleByDate[activeDateKey];

    if (reminderSchedule?.reminderIds.length) {
      await cancelNotificationIds(reminderSchedule.reminderIds);
    }

    setAppState((previous) => ({
      ...previous,
      activeReflectionViewedAtByDate: {
        ...previous.activeReflectionViewedAtByDate,
        [activeDateKey]: new Date().toISOString(),
      },
      viewedDates: previous.viewedDates.includes(activeDateKey)
        ? previous.viewedDates
        : [activeDateKey, ...previous.viewedDates],
      reminderScheduleByDate: reminderSchedule
        ? {
            ...previous.reminderScheduleByDate,
            [activeDateKey]: {
              ...reminderSchedule,
              cancelledAt: new Date().toISOString(),
            },
          }
        : previous.reminderScheduleByDate,
      lateOpenDeferredDates: previous.lateOpenDeferredDates.filter((date) => date !== activeDateKey),
    }));
  }

  async function deferActiveReflectionForToday() {
    const activeDateKey = appState.activeReflectionDateKey ?? currentDateKey;
    setAppState((previous) => ({
      ...previous,
      lateOpenDeferredDates: previous.lateOpenDeferredDates.includes(activeDateKey)
        ? previous.lateOpenDeferredDates
        : [activeDateKey, ...previous.lateOpenDeferredDates],
    }));
  }

  async function toggleFavorite(reflectionId: string, date = currentDateKey) {
    const favoriteKey = getFavoriteEntryKey(date, reflectionId);
    setAppState((previous) => {
      const exists = previous.favorites.includes(favoriteKey) || previous.favorites.includes(reflectionId);
      const nextFavorites = previous.favorites.filter((id) => id !== reflectionId && id !== favoriteKey);

      return {
        ...previous,
        favorites: exists ? nextFavorites : [favoriteKey, ...nextFavorites],
        collectionEntries: exists
          ? removeReflectionKeyFromCollections(previous.collectionEntries, favoriteKey)
          : previous.collectionEntries,
      };
    });
  }

  async function updateCategories(categories: ReflectionCategory[]) {
    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        selectedCategories: categories.length ? categories : REFLECTION_CATEGORIES,
      },
    }));
  }

  async function updateNotificationTime(
    preference: NotificationPreference,
    options?: {
      schedule?: boolean;
      requestPermission?: boolean;
      notificationContent?: NotificationContentOptions;
    },
  ) {
    setAppState((previous) => ({
      ...previous,
      dailyNotificationTime: formatNotificationTime(preference),
      preferences: {
        ...previous.preferences,
        notificationTime: preference,
      },
    }));

    if (options?.schedule === false) {
      return;
    }

    const nextPreferences = {
      ...appState.preferences,
      notificationTime: preference,
    };
    const scheduleResult = await rescheduleDailyNotification(preference, {
      requestPermission: options?.requestPermission,
      language: appState.preferredLanguage,
      notificationsEnabled: nextPreferences.notificationsEnabled,
      soundEnabled: nextPreferences.soundEnabled,
      silentMode: nextPreferences.silentMode,
      ...options?.notificationContent,
      userName: options?.notificationContent?.userName ?? appState.userName,
    });

    notificationScheduleSignatureRef.current = buildNotificationScheduleSignature(
      appState.preferredLanguage,
      nextPreferences,
    );

    setAppState((previous) => ({
      ...previous,
      preferences:
        previous.preferences.notificationsEnabled && !scheduleResult.permissionGranted
          ? {
              ...previous.preferences,
              notificationsEnabled: false,
            }
          : previous.preferences,
      lastNotificationMessage: scheduleResult.nextMessage,
      lastNotificationDate: scheduleResult.nextDate,
    }));
  }

  async function updateNotificationDeliveryPreferences(
    preferences: Partial<
      Pick<AppPreferences, "notificationsEnabled" | "soundEnabled" | "hapticsEnabled" | "silentMode">
    >,
  ) {
    const nextPreferences: AppPreferences = {
      ...appState.preferences,
      ...preferences,
    };

    if (preferences.silentMode === true) {
      nextPreferences.soundEnabled = false;
      nextPreferences.hapticsEnabled = false;
    }

    if (preferences.soundEnabled === true || preferences.hapticsEnabled === true) {
      nextPreferences.silentMode = false;
    }

    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        ...preferences,
        soundEnabled:
          preferences.silentMode === true
            ? false
            : preferences.soundEnabled ?? previous.preferences.soundEnabled,
        hapticsEnabled:
          preferences.silentMode === true
            ? false
            : preferences.hapticsEnabled ?? previous.preferences.hapticsEnabled,
        silentMode:
          preferences.soundEnabled === true || preferences.hapticsEnabled === true
            ? false
            : preferences.silentMode ?? previous.preferences.silentMode,
      },
      lastNotificationMessage: preferences.notificationsEnabled === false ? null : previous.lastNotificationMessage,
      lastNotificationDate: preferences.notificationsEnabled === false ? null : previous.lastNotificationDate,
    }));

    if (!nextPreferences.notificationsEnabled) {
      await clearScheduledNotification();
      return;
    }

    const scheduleResult = await rescheduleDailyNotification(nextPreferences.notificationTime, {
      requestPermission:
        preferences.notificationsEnabled === true && appState.preferences.notificationsEnabled === false,
      userName: appState.userName,
      language: appState.preferredLanguage,
      notificationsEnabled: nextPreferences.notificationsEnabled,
      soundEnabled: nextPreferences.soundEnabled,
      silentMode: nextPreferences.silentMode,
    });

    notificationScheduleSignatureRef.current = buildNotificationScheduleSignature(
      appState.preferredLanguage,
      {
        notificationTime: nextPreferences.notificationTime,
        notificationsEnabled:
          nextPreferences.notificationsEnabled && scheduleResult.permissionGranted,
        soundEnabled: nextPreferences.soundEnabled,
        silentMode: nextPreferences.silentMode,
      },
    );

    setAppState((previous) => ({
      ...previous,
      preferences:
        previous.preferences.notificationsEnabled && !scheduleResult.permissionGranted
          ? {
              ...previous.preferences,
              notificationsEnabled: false,
            }
          : previous.preferences,
      lastNotificationMessage: scheduleResult.nextMessage,
      lastNotificationDate: scheduleResult.nextDate,
    }));
  }

  async function updateLanguage(language: SupportedLanguage) {
    const nextLanguage = await persistLanguageSelection(
      sanitizeAppLanguageForSubscription(language, appState.subscriptionModel),
    );
    setAppState((previous) => ({
      ...previous,
      ...sanitizeLanguageStateForSubscription(
        nextLanguage,
        previous.reflectionLanguageMode,
        previous.reflectionLanguage,
        previous.reflectionLanguages,
        previous.subscriptionModel,
      ),
    }));
  }

  async function updateReflectionLanguageMode(mode: ReflectionLanguageMode) {
    setAppState((previous) => ({
      ...previous,
      ...sanitizeLanguageStateForSubscription(
        previous.preferredLanguage,
        mode,
        previous.reflectionLanguage,
        previous.reflectionLanguages,
        previous.subscriptionModel,
      ),
    }));
  }

  async function updateReflectionLanguages(languages: SupportedLanguage[]) {
    setAppState((previous) => ({
      ...previous,
      ...sanitizeLanguageStateForSubscription(
        previous.preferredLanguage,
        previous.reflectionLanguageMode,
        languages[0] ?? previous.preferredLanguage,
        languages,
        previous.subscriptionModel,
      ),
    }));
  }

  async function setReflectionCardLanguageSelection(date: string, language: SupportedLanguage) {
    setAppState((previous) => ({
      ...previous,
      quoteLanguageSelections: {
        ...previous.quoteLanguageSelections,
        [date]: language,
      },
    }));
  }

  async function updateSubscriptionModel(model: SubscriptionModel) {
    setAppState((previous) => ({
      ...previous,
      subscriptionModel: model,
      ...sanitizeLanguageStateForSubscription(
        previous.preferredLanguage,
        previous.reflectionLanguageMode,
        previous.reflectionLanguage,
        previous.reflectionLanguages,
        model,
      ),
    }));
  }

  async function updateTheme(theme: ThemePreference) {
    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        theme,
      },
    }));
  }

  async function updateAppearanceMode(mode: AppearanceMode) {
    setAppState((previous) => {
      if (previous.preferences.appearanceMode === mode) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          appearanceMode: mode,
          selectedAppearancePresetId:
            mode === "preset"
              ? previous.preferences.selectedAppearancePresetId ?? "classic-paper"
              : previous.preferences.selectedAppearancePresetId,
        },
      };
    });
  }

  async function updateAppearancePreset(appearancePresetId: AppearancePresetId) {
    setAppState((previous) => {
      if (
        previous.preferences.appearanceMode === "preset" &&
        previous.preferences.selectedAppearancePresetId === appearancePresetId
      ) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          appearanceMode: "preset",
          selectedAppearancePresetId: appearancePresetId,
        },
      };
    });
  }

  async function updateAppBackgroundColor(appBackgroundColor: string) {
    const nextAppBackgroundColor = sanitizeCustomPaperColor(appBackgroundColor, "#FFFFFF");
    setAppState((previous) => {
      if (
        previous.preferences.appBackgroundColor === nextAppBackgroundColor &&
        previous.preferences.appearanceMode === "custom"
      ) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          appearanceMode: "custom",
          appBackgroundColor: nextAppBackgroundColor,
        },
      };
    });
  }

  async function updateTextColorMode(mode: TextColorMode) {
    setAppState((previous) => {
      if (
        previous.preferences.textColorMode === mode &&
        (mode === "default" || previous.preferences.appearanceMode === "custom")
      ) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          appearanceMode: mode === "custom" ? "custom" : previous.preferences.appearanceMode,
          textColorMode: mode,
        },
      };
    });
  }

  async function updateCustomTextColor(textColor: string) {
    const nextTextColor = sanitizeCustomPaperColor(textColor, "#221B15");
    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        appearanceMode: "custom",
        textColorMode: "custom",
        customTextColor: nextTextColor,
      },
    }));
  }

  async function updatePaperTheme(paperThemeId: PaperThemePresetId) {
    setAppState((previous) => {
      if (previous.preferences.paperThemeId === paperThemeId && previous.preferences.paperMode === "preset") {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          appearanceMode: "custom",
          paperMode: "preset",
          paperThemeId,
        },
      };
    });
  }

  async function updateCustomPaperColor(paperColor: string) {
    const nextPaperColor = sanitizeCustomPaperColor(paperColor);
    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        appearanceMode: "custom",
        paperMode: "custom",
        customPaperColor: nextPaperColor,
      },
    }));
  }

  async function updateNoteBackgroundColor(noteBackgroundColor: string) {
    const nextNoteBackgroundColor = sanitizeCustomPaperColor(noteBackgroundColor, "#FFFFFF");
    setAppState((previous) => {
      if (previous.preferences.noteBackgroundColor === nextNoteBackgroundColor) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          noteBackgroundColor: nextNoteBackgroundColor,
        },
      };
    });
  }

  async function resetPaperThemeToPreset() {
    setAppState((previous) => ({
      ...previous,
      preferences: {
        ...previous.preferences,
        paperMode: "preset",
      },
    }));
  }

  async function updateTypographyPreset(typographyPresetId: TypographyPresetId) {
    setAppState((previous) => {
      if (previous.preferences.typographyPresetId === typographyPresetId) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          typographyPresetId,
        },
      };
    });
  }

  async function updatePageStyle(pageStyleId: PageStylePresetId) {
    setAppState((previous) => {
      if (previous.preferences.pageStyleId === pageStyleId) {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
          pageStyleId,
        },
      };
    });
  }

  async function updateReflectionNote(date: string, reflectionId: string, note: string) {
    const nextNote = note.trim();
    const noteKey = getReflectionNoteKey(date, reflectionId);

    setAppState((previous) => {
      if (!nextNote) {
        if (!previous.reflectionNotes[noteKey]) {
          return previous;
        }

        const nextNotes = { ...previous.reflectionNotes };
        delete nextNotes[noteKey];
        return {
          ...previous,
          reflectionNotes: nextNotes,
        };
      }

      if (previous.reflectionNotes[noteKey] === nextNote) {
        return previous;
      }

      return {
        ...previous,
        reflectionNotes: {
          ...previous.reflectionNotes,
          [noteKey]: nextNote,
        },
      };
    });
  }

  async function updateReflectionFollowUp(
    date: string,
    reflectionId: string,
    followUp: StoredReflectionFollowUp | null,
  ) {
    const followUpKey = getReflectionFollowUpKey(date, reflectionId);

    setAppState((previous) => {
      if (!followUp) {
        if (!previous.reflectionFollowUps[followUpKey]) {
          return previous;
        }

        const nextFollowUps = { ...previous.reflectionFollowUps };
        delete nextFollowUps[followUpKey];

        return {
          ...previous,
          reflectionFollowUps: nextFollowUps,
        };
      }

      return {
        ...previous,
        reflectionFollowUps: {
          ...previous.reflectionFollowUps,
          [followUpKey]: followUp,
        },
      };
    });
  }

  async function createCollection(input: { title: string; description?: string | null }) {
    const title = input.title.trim();
    const description = input.description?.trim() || null;
    const collectionId = createCollectionId();
    const timestamp = new Date().toISOString();

    if (!title) {
      return collectionId;
    }

    setAppState((previous) => ({
      ...previous,
      personalCollections: [
        {
          id: collectionId,
          title,
          description,
          createdAt: timestamp,
          updatedAt: timestamp,
        },
        ...previous.personalCollections,
      ],
    }));

    return collectionId;
  }

  async function renameCollection(collectionId: string, input: { title: string; description?: string | null }) {
    const title = input.title.trim();
    const description = input.description?.trim() || null;

    if (!title) {
      return;
    }

    setAppState((previous) => ({
      ...previous,
      personalCollections: previous.personalCollections.map((collection) =>
        collection.id === collectionId
          ? {
              ...collection,
              title,
              description,
              updatedAt: new Date().toISOString(),
            }
          : collection,
      ),
    }));
  }

  async function deleteCollection(collectionId: string) {
    setAppState((previous) => {
      const nextEntries = { ...previous.collectionEntries };
      delete nextEntries[collectionId];

      return {
        ...previous,
        personalCollections: previous.personalCollections.filter((collection) => collection.id !== collectionId),
        collectionEntries: nextEntries,
      };
    });
  }

  async function addReflectionToCollection(collectionId: string, date: string, reflectionId: string) {
    const reflectionKey = getFavoriteEntryKey(date, reflectionId);

    setAppState((previous) => {
      if (!previous.favorites.includes(reflectionKey) && !previous.favorites.includes(reflectionId)) {
        return previous;
      }

      const currentKeys = previous.collectionEntries[collectionId] ?? [];
      if (currentKeys.includes(reflectionKey)) {
        return previous;
      }

      return {
        ...previous,
        personalCollections: previous.personalCollections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
        collectionEntries: {
          ...previous.collectionEntries,
          [collectionId]: [reflectionKey, ...currentKeys],
        },
      };
    });
  }

  async function removeReflectionFromCollection(collectionId: string, date: string, reflectionId: string) {
    const reflectionKey = getFavoriteEntryKey(date, reflectionId);

    setAppState((previous) => {
      const currentKeys = previous.collectionEntries[collectionId] ?? [];
      if (!currentKeys.includes(reflectionKey)) {
        return previous;
      }

      const nextKeys = currentKeys.filter((key) => key !== reflectionKey);
      const nextEntries = { ...previous.collectionEntries };

      if (nextKeys.length) {
        nextEntries[collectionId] = nextKeys;
      } else {
        delete nextEntries[collectionId];
      }

      return {
        ...previous,
        personalCollections: previous.personalCollections.map((collection) =>
          collection.id === collectionId
            ? {
                ...collection,
                updatedAt: new Date().toISOString(),
              }
            : collection,
        ),
        collectionEntries: nextEntries,
      };
    });
  }

  async function resetAllData() {
    await clearScheduledNotification();
    await clearFreemiumUpgradeReminder();
    await clearYearEndPremiumReminder();
    await clearAppState();
    setAppState(defaultAppState);
  }

  setGlobalPaperThemeId({
    appearanceMode:
      appState.subscriptionModel === "Freemium" ? "default" : appState.preferences.appearanceMode,
    appearancePresetId:
      appState.subscriptionModel === "Freemium" ? null : appState.preferences.selectedAppearancePresetId,
    appBackgroundColor:
      appState.subscriptionModel === "Freemium" ? "#FFFFFF" : appState.preferences.appBackgroundColor,
    textColorMode:
      appState.subscriptionModel === "Freemium" ? "default" : appState.preferences.textColorMode,
    customTextColor: appState.preferences.customTextColor,
    mode: appState.preferences.paperMode,
    paperThemeId: appState.preferences.paperThemeId,
    customPaperColor: appState.preferences.customPaperColor,
  });

  return (
    <AppContext.Provider
      value={{
        isReady: appBootReady,
        appBootReady,
        storageReady,
        todayReady,
        settingsReady,
        appState,
        authStatus,
        authSession,
        userProfile,
        savedReflectionsSyncState,
        colorScheme: resolveColorScheme(appState.preferences.theme, systemScheme),
        todaysReflection,
        archive,
        favorites,
        collections,
        availableDates,
        personalization,
        getReflectionForDate: lookupReflectionForDate,
        getReflectionNote,
        getReflectionFollowUp,
        getCollectionById,
        getCollectionReflections,
        isReflectionInCollection,
        completeOnboarding,
        markTodayIntroOverlaySeen,
        markDailyReflectionPreviewSeen,
        markInitialPremiumOfferSeen,
        markFreemiumUpgradePromptSeen,
        markFreemiumUpgradeNotificationScheduled,
        markPremiumPromptShown,
        markPremiumPromptDismissed,
        markPremiumPromptOpened,
        refreshAuthState,
        signOutCurrentUser,
        markActiveReflectionViewed,
        deferActiveReflectionForToday,
        toggleFavorite,
        updateCategories,
        updateNotificationTime,
        updateNotificationDeliveryPreferences,
        updateLanguage,
        updateReflectionLanguageMode,
        updateReflectionLanguages,
        setReflectionCardLanguageSelection,
        updateSubscriptionModel,
        updateTheme,
        updateAppearanceMode,
        updateAppearancePreset,
        updateAppBackgroundColor,
        updateTextColorMode,
        updateCustomTextColor,
        updatePaperTheme,
        updateCustomPaperColor,
        updateNoteBackgroundColor,
        resetPaperThemeToPreset,
        updateTypographyPreset,
        updatePageStyle,
        updateReflectionNote,
        updateReflectionFollowUp,
        createCollection,
        renameCollection,
        deleteCollection,
        addReflectionToCollection,
        removeReflectionFromCollection,
        resetAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider");
  }
  return context;
}
