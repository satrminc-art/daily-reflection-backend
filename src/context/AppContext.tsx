import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AppState, useColorScheme } from "react-native";
import { REFLECTION_CATEGORIES } from "@/data/categories";
import {
  NotificationContentOptions,
  clearScheduledNotification,
  rescheduleDailyNotification,
} from "@/services/notificationService";
import {
  getFavoriteEntryKey,
  getReflectionForDate,
  getReflectionIdForDate,
  hydrateReflectionById,
} from "@/services/reflectionService";
import { clearAppState, defaultAppState, loadAppState, saveAppState } from "@/storage/appStorage";
import { getAppStrings } from "@/localization/strings";
import { sanitizeCustomPaperColor } from "@/theme/paperColor";
import { PageStylePresetId, PaperThemePresetId, TypographyPresetId } from "@/theme/presets";
import type { PersonalizationSelection } from "@/theme/system";
import { resolvePersonalizationSelection } from "@/theme/system";
import {
  AppPreferences,
  AppStorageState,
  NotificationPreference,
  OnboardingPreference,
  ReflectionCategory,
  ReflectionItem,
  SubscriptionModel,
  SupportedLanguage,
  ThemePreference,
} from "@/types/reflection";
import { StoredReflectionFollowUp } from "@/types/ai";
import { getDailyReflectionLanguage, todayISODate } from "@/utils/reflection";
import { AppColorScheme, setGlobalPaperThemeId } from "@/utils/theme";

interface AppContextValue {
  isReady: boolean;
  appState: AppStorageState;
  colorScheme: AppColorScheme;
  todaysReflection: ReflectionItem | null;
  archive: ReflectionItem[];
  favorites: ReflectionItem[];
  availableDates: string[];
  personalization: PersonalizationSelection;
  getReflectionForDate: (date: string) => ReflectionItem;
  getReflectionNote: (date: string, reflectionId: string) => string;
  getReflectionFollowUp: (date: string, reflectionId: string) => StoredReflectionFollowUp | null;
  completeOnboarding: (payload: {
    preferredLanguage: SupportedLanguage | null;
    userName: string | null;
    userPreferences: OnboardingPreference[];
  }) => Promise<void>;
  markTodayIntroOverlaySeen: () => Promise<void>;
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
  updateLanguage: (language: SupportedLanguage) => Promise<void>;
  updateQuoteLanguages: (languages: SupportedLanguage[]) => Promise<void>;
  updateSubscriptionModel: (model: SubscriptionModel) => Promise<void>;
  updateTheme: (theme: ThemePreference) => Promise<void>;
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
  resetAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

function resolveColorScheme(theme: ThemePreference, systemScheme: string | null | undefined): AppColorScheme {
  if (theme === "system") {
    return systemScheme === "dark" ? "dark" : "light";
  }
  return theme;
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

function resolveStoredQuoteLanguage(state: AppStorageState, date: string): SupportedLanguage {
  const existing = state.quoteLanguageSelections[date];
  if (existing) {
    return existing;
  }

  return getDailyReflectionLanguage(
    date,
    state.quoteLanguages,
    state.quoteLanguageSelections,
    state.preferredLanguage,
  );
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [appState, setAppState] = useState<AppStorageState>(defaultAppState);
  const [isReady, setIsReady] = useState(false);
  const [currentDateKey, setCurrentDateKey] = useState(todayISODate());

  useEffect(() => {
    async function bootstrap() {
      const storedState = await loadAppState();
      setAppState(storedState);
      setCurrentDateKey(todayISODate());
      setIsReady(true);
    }

    bootstrap();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        setCurrentDateKey(todayISODate());
      }
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }

    saveAppState(appState).catch((error) => {
      console.warn("Failed to persist app state", error);
    });
  }, [appState, isReady]);

  const todaysReflection = useMemo(() => {
    if (!appState.hasCompletedOnboarding) {
      return null;
    }

    const quoteLanguage = resolveStoredQuoteLanguage(appState, currentDateKey);

    return getReflectionForDate(
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
    appState.quoteLanguageSelections,
    appState.quoteLanguages,
    appState.preferredLanguage,
  ]);

  useEffect(() => {
    if (!isReady || !appState.hasCompletedOnboarding) {
      return;
    }

    const dates = Object.keys(appState.dailySelections).sort();
    const missingDates = dates.filter((date) => !appState.quoteLanguageSelections[date]);

    if (!missingDates.length) {
      return;
    }

    setAppState((previous) => {
      const nextSelections = { ...previous.quoteLanguageSelections };

      for (const date of dates) {
        if (!nextSelections[date]) {
          nextSelections[date] = getDailyReflectionLanguage(
            date,
            previous.quoteLanguages,
            nextSelections,
            previous.preferredLanguage,
          );
        }
      }

      return {
        ...previous,
        quoteLanguageSelections: nextSelections,
      };
    });
  }, [
    isReady,
    appState.hasCompletedOnboarding,
    appState.dailySelections,
    appState.preferredLanguage,
    appState.quoteLanguageSelections,
    appState.quoteLanguages,
  ]);

  const archive = useMemo(() => {
    return Object.entries(appState.dailySelections)
      .filter(([date, reflectionId]) => {
        const hydrated = hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState, date),
        );

        return date < currentDateKey || Boolean(hydrated?.isFavorite);
      })
      .map(([date, reflectionId]) => {
        return hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState, date),
        );
      })
      .filter((item): item is ReflectionItem => Boolean(item))
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [
    currentDateKey,
    appState.dailySelections,
    appState.favorites,
    appState.preferredLanguage,
    appState.quoteLanguageSelections,
    appState.quoteLanguages,
  ]);

  const favorites = useMemo(() => {
    return Object.entries(appState.dailySelections)
      .map(([date, reflectionId]) =>
        hydrateReflectionById(
          reflectionId,
          date,
          appState.favorites,
          resolveStoredQuoteLanguage(appState, date),
        ),
      )
      .filter((item): item is ReflectionItem => Boolean(item))
      .filter((item) => item.isFavorite)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [appState.dailySelections, appState.favorites, appState.quoteLanguageSelections]);

  const availableDates = useMemo(() => {
    const priorDates = archive.map((item) => item.date);
    return todaysReflection ? Array.from(new Set([currentDateKey, ...priorDates])) : priorDates;
  }, [archive, currentDateKey, todaysReflection]);

  const personalization = useMemo(() => {
    return resolvePersonalizationSelection({
      paperThemeId: appState.preferences.paperThemeId,
      typographyPresetId: appState.preferences.typographyPresetId,
      pageStyleId: appState.preferences.pageStyleId,
    });
  }, [
    appState.preferences.pageStyleId,
    appState.preferences.paperThemeId,
    appState.preferences.typographyPresetId,
  ]);

  function lookupReflectionForDate(date: string) {
    return getReflectionForDate(
      date,
      appState.preferences.selectedCategories,
      appState.favorites,
      appState.dailySelections,
      resolveStoredQuoteLanguage(appState, date),
    );
  }

  function getReflectionNote(date: string, reflectionId: string) {
    return appState.reflectionNotes[getReflectionNoteKey(date, reflectionId)] ?? "";
  }

  function getReflectionFollowUp(date: string, reflectionId: string) {
    return appState.reflectionFollowUps[getReflectionFollowUpKey(date, reflectionId)] ?? null;
  }

  useEffect(() => {
    if (!isReady || !appState.hasCompletedOnboarding) {
      return;
    }

    setAppState((previous) => {
      if (previous.dailySelections[currentDateKey]) {
        return previous;
      }

      const reflectionId = getReflectionIdForDate(
        currentDateKey,
        previous.preferences.selectedCategories,
        previous.dailySelections[currentDateKey],
      );
      const quoteLanguage = resolveStoredQuoteLanguage(previous, currentDateKey);
      return {
        ...previous,
        dailySelections: {
          ...previous.dailySelections,
          [currentDateKey]: reflectionId,
        },
        quoteLanguageSelections: {
          ...previous.quoteLanguageSelections,
          [currentDateKey]: quoteLanguage,
        },
        viewedDates: previous.viewedDates.includes(currentDateKey)
          ? previous.viewedDates
          : [currentDateKey, ...previous.viewedDates],
      };
    });
  }, [currentDateKey, isReady, appState.hasCompletedOnboarding, appState.preferences.selectedCategories]);

  async function completeOnboarding(payload: {
    preferredLanguage: SupportedLanguage | null;
    userName: string | null;
    userPreferences: OnboardingPreference[];
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
    const nextNotificationTime = appState.dailyNotificationTime
      ? {
          hour: Number(appState.dailyNotificationTime.split(":")[0] ?? 8),
          minute: Number(appState.dailyNotificationTime.split(":")[1] ?? 30),
        }
      : appState.preferences.notificationTime;
    const nextPreferences: AppPreferences = {
      ...appState.preferences,
      selectedCategories: nextCategories,
      notificationTime: nextNotificationTime,
    };
    const selectedReflectionId = getReflectionIdForDate(
      currentDateKey,
      nextCategories,
      appState.dailySelections[currentDateKey],
    );

    setAppState((previous) => ({
      ...previous,
      hasCompletedOnboarding: true,
      hasSeenTodayIntroOverlay: false,
      preferredLanguage: payload.preferredLanguage,
      quoteLanguages: payload.preferredLanguage ? [payload.preferredLanguage] : previous.quoteLanguages,
      userName: payload.userName?.trim() || null,
      userPreferences: payload.userPreferences,
      dailySelections: previous.dailySelections[currentDateKey]
        ? previous.dailySelections
        : {
            ...previous.dailySelections,
            [currentDateKey]: selectedReflectionId,
          },
      quoteLanguageSelections: previous.quoteLanguageSelections[currentDateKey]
        ? previous.quoteLanguageSelections
        : {
            ...previous.quoteLanguageSelections,
            [currentDateKey]: getDailyReflectionLanguage(
              currentDateKey,
              payload.preferredLanguage ? [payload.preferredLanguage] : previous.quoteLanguages,
              previous.quoteLanguageSelections,
              payload.preferredLanguage ?? previous.preferredLanguage,
            ),
          },
      viewedDates: previous.viewedDates.includes(currentDateKey)
        ? previous.viewedDates
        : [currentDateKey, ...previous.viewedDates],
      preferences: nextPreferences,
    }));
  }

  async function markTodayIntroOverlaySeen() {
    setAppState((previous) => ({
      ...previous,
      hasSeenTodayIntroOverlay: true,
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

    await rescheduleDailyNotification(preference, {
      requestPermission: options?.requestPermission,
      title: options?.notificationContent?.title ?? getAppStrings(appState.preferredLanguage).notificationReadyTitle(appState.userName),
      body: options?.notificationContent?.body ?? getAppStrings(appState.preferredLanguage).notificationReadyBody(),
      ...options?.notificationContent,
      userName: options?.notificationContent?.userName ?? appState.userName,
    });
  }

  async function updateLanguage(language: SupportedLanguage) {
    setAppState((previous) => ({
      ...previous,
      preferredLanguage: language,
    }));
  }

  async function updateQuoteLanguages(languages: SupportedLanguage[]) {
    setAppState((previous) => ({
      ...previous,
      quoteLanguages: languages.length ? Array.from(new Set(languages)) : previous.quoteLanguages,
    }));
  }

  async function updateSubscriptionModel(model: SubscriptionModel) {
    setAppState((previous) => ({
      ...previous,
      subscriptionModel: model,
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

  async function updatePaperTheme(paperThemeId: PaperThemePresetId) {
    setAppState((previous) => {
      if (previous.preferences.paperThemeId === paperThemeId && previous.preferences.paperMode === "preset") {
        return previous;
      }

      return {
        ...previous,
        preferences: {
          ...previous.preferences,
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

  async function resetAllData() {
    await clearScheduledNotification();
    await clearAppState();
    setAppState(defaultAppState);
  }

  setGlobalPaperThemeId({
    mode: appState.preferences.paperMode,
    paperThemeId: appState.preferences.paperThemeId,
    customPaperColor: appState.preferences.customPaperColor,
  });

  return (
    <AppContext.Provider
      value={{
        isReady,
        appState,
        colorScheme: resolveColorScheme(appState.preferences.theme, systemScheme),
        todaysReflection,
        archive,
        favorites,
        availableDates,
        personalization,
        getReflectionForDate: lookupReflectionForDate,
        getReflectionNote,
        getReflectionFollowUp,
        completeOnboarding,
        markTodayIntroOverlaySeen,
        toggleFavorite,
        updateCategories,
        updateNotificationTime,
        updateLanguage,
        updateQuoteLanguages,
        updateSubscriptionModel,
        updateTheme,
        updatePaperTheme,
        updateCustomPaperColor,
        updateNoteBackgroundColor,
        resetPaperThemeToPreset,
        updateTypographyPreset,
        updatePageStyle,
        updateReflectionNote,
        updateReflectionFollowUp,
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
