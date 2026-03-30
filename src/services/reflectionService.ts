import { REFLECTION_TRANSLATIONS } from "@/data/reflectionTranslations";
import { YEARLY_REFLECTIONS_BY_DATE, YEARLY_REFLECTIONS_BY_ID } from "@/data/yearly";
import {
  LocalizedReflectionContent,
  ManualReflectionEntry,
  ReflectionCategory,
  ReflectionItem,
  ReflectionSeedItem,
  SourceType,
  SupportedLanguage,
} from "@/types/reflection";
import {
  getCalendarInfluenceDebugSnapshot,
  getDailyThemeDebugSnapshot,
  getDailyThemeForUser,
  selectDailyAiSeed,
} from "@/utils/reflection";
import { REFLECTION_SEED } from "@/data/reflections";

type ReflectionContentEntry = ReflectionSeedItem | ManualReflectionEntry;
export interface DailyReflectionSelection {
  entry: ReflectionContentEntry;
  theme: ReflectionCategory;
}

export interface ResolvedReflectionTextOption {
  requestedLanguage: SupportedLanguage;
  resolvedLanguage: SupportedLanguage;
  text: string;
  usedFallback: boolean;
}

const AI_REFLECTIONS_BY_ID = new Map(REFLECTION_SEED.map((item) => [item.id, item]));

export function getFavoriteEntryKey(date: string, reflectionId: string) {
  return `${date}:${reflectionId}`;
}

function isFavoriteEntry(favoriteKeys: string[], date: string, reflectionId: string) {
  const entryKey = getFavoriteEntryKey(date, reflectionId);
  return favoriteKeys.includes(entryKey) || favoriteKeys.includes(reflectionId);
}

function normalizeSourceType(sourceType: SourceType): SourceType {
  return sourceType === "original_reflection" ? "ai" : sourceType;
}

function resolveManualText(entry: ManualReflectionEntry, language?: SupportedLanguage | null): string {
  if (typeof entry.text === "string") {
    return entry.text;
  }

  if (!language) {
    return entry.text.en ?? entry.text.de ?? Object.values(entry.text)[0] ?? "";
  }

  const resolved =
    entry.text[language] ??
    entry.text[language.split("-")[0]] ??
    entry.text.en ??
    entry.text.de ??
    Object.values(entry.text)[0] ??
    "";

  if (__DEV__ && !entry.text[language] && !entry.text[language.split("-")[0]]) {
    console.warn(`[i18n] Missing manual reflection translation for "${entry.id}" in ${language}. Falling back.`);
  }

  return resolved;
}

function resolveAiText(entry: ReflectionSeedItem, language?: SupportedLanguage | null): string {
  if (!language) {
    return entry.text;
  }

  const baseLanguage = language.split("-")[0];
  const localizedContent = entry.translations?.[language] ?? entry.translations?.[baseLanguage];
  const localizedText =
    typeof localizedContent === "string"
      ? localizedContent
      : (localizedContent as LocalizedReflectionContent | undefined)?.text;

  const resolved =
    localizedText ??
    REFLECTION_TRANSLATIONS[language]?.[entry.id] ??
    REFLECTION_TRANSLATIONS[baseLanguage]?.[entry.id] ??
    entry.text;

  if (
    __DEV__ &&
    language !== "en" &&
    baseLanguage !== "en" &&
    !localizedText &&
    !REFLECTION_TRANSLATIONS[language]?.[entry.id] &&
    !REFLECTION_TRANSLATIONS[baseLanguage]?.[entry.id]
  ) {
    console.warn(`[i18n] Missing reflection translation for "${entry.id}" in ${language}. Falling back to English.`);
  }

  return resolved;
}

export function hasLocalizedReflectionText(entry: ReflectionContentEntry, language?: SupportedLanguage | null): boolean {
  if (!language || language === "en") {
    return true;
  }

  if ("date" in entry) {
    if (typeof entry.text === "string") {
      return language === "en";
    }

    const baseLanguage = language.split("-")[0];
    return Boolean(entry.text[language] ?? entry.text[baseLanguage]);
  }

  const baseLanguage = language.split("-")[0];
  return Boolean(
    entry.translations?.[language] ??
      entry.translations?.[baseLanguage] ??
      REFLECTION_TRANSLATIONS[language]?.[entry.id] ??
      REFLECTION_TRANSLATIONS[baseLanguage]?.[entry.id],
  );
}

export function resolveReflectionText(entry: ReflectionContentEntry, language?: SupportedLanguage | null): string {
  return "date" in entry ? resolveManualText(entry, language) : resolveAiText(entry, language);
}

export function resolveReflectionTexts(
  entry: ReflectionContentEntry,
  languages: readonly (SupportedLanguage | null | undefined)[],
): ResolvedReflectionTextOption[] {
  const requestedLanguages = Array.from(new Set(languages.filter(Boolean))) as SupportedLanguage[];
  const safeLanguages = requestedLanguages.length ? requestedLanguages : ["en"];

  return safeLanguages.map((requestedLanguage) => {
    const usedFallback = !hasLocalizedReflectionText(entry, requestedLanguage);
    return {
      requestedLanguage,
      resolvedLanguage: usedFallback ? "en" : requestedLanguage,
      text: resolveReflectionText(entry, requestedLanguage),
      usedFallback,
    };
  });
}

function buildReflectionItem(
  entry: ReflectionContentEntry,
  date: string,
  favoriteKeys: string[],
  language?: SupportedLanguage | null,
): ReflectionItem {
  const text = resolveReflectionText(
    "date" in entry
      ? entry
      : {
          ...entry,
          sourceType: normalizeSourceType(entry.sourceType),
        },
    language,
  );

  return {
    ...entry,
    sourceType: normalizeSourceType(entry.sourceType),
    text,
    date,
    isFavorite: isFavoriteEntry(favoriteKeys, date, entry.id),
  };
}

export function getReflectionEntryById(id: string): ReflectionContentEntry | undefined {
  return YEARLY_REFLECTIONS_BY_ID.get(id) ?? AI_REFLECTIONS_BY_ID.get(id);
}

export function getManualReflectionForDate(date: string): ManualReflectionEntry | null {
  return YEARLY_REFLECTIONS_BY_DATE.get(date) ?? null;
}

export function resolveReflectionEntryForDate(
  date: string,
  selectedCategories: ReflectionCategory[],
  persistedReflectionId?: string,
  options?: {
    shownDatesByReflectionId?: Record<string, string>;
    previousReflectionId?: string | null;
    dailyThemeSelections?: Record<string, ReflectionCategory>;
    persistedTheme?: ReflectionCategory | null;
    language?: SupportedLanguage | null;
  },
): ReflectionContentEntry {
  return resolveDailyReflectionSelection(date, selectedCategories, persistedReflectionId, options).entry;
}

export function resolveDailyReflectionSelection(
  date: string,
  selectedCategories: ReflectionCategory[],
  persistedReflectionId?: string,
  options?: {
    shownDatesByReflectionId?: Record<string, string>;
    previousReflectionId?: string | null;
    dailyThemeSelections?: Record<string, ReflectionCategory>;
    persistedTheme?: ReflectionCategory | null;
    language?: SupportedLanguage | null;
  },
): DailyReflectionSelection {
  const manualEntry = getManualReflectionForDate(date);
  if (manualEntry && hasLocalizedReflectionText(manualEntry, options?.language)) {
    return { entry: manualEntry, theme: manualEntry.category };
  }

  if (persistedReflectionId) {
    const persistedEntry = getReflectionEntryById(persistedReflectionId);
    if (persistedEntry && hasLocalizedReflectionText(persistedEntry, options?.language)) {
      return {
        entry: persistedEntry,
        theme: options?.persistedTheme ?? persistedEntry.category,
      };
    }
  }

  const theme = getDailyThemeForUser(date, selectedCategories, {
    dailyThemeSelections: options?.dailyThemeSelections,
    shownDatesByReflectionId: options?.shownDatesByReflectionId,
    language: options?.language,
  });

  if (__DEV__) {
    const debugSnapshot = getCalendarInfluenceDebugSnapshot(date, selectedCategories, options);
    const themeDebugSnapshot = getDailyThemeDebugSnapshot(date, selectedCategories, {
      dailyThemeSelections: options?.dailyThemeSelections,
      shownDatesByReflectionId: options?.shownDatesByReflectionId,
      language: options?.language,
    });
    if (debugSnapshot.influence && debugSnapshot.usedBias) {
      console.info(
        `[REFLECTION] calendar influence matched ${debugSnapshot.influence.internalName} for ${date} -> ${debugSnapshot.matchedSeedIds.join(", ")}`,
      );
    }
    if (themeDebugSnapshot.usedFallbackTheme) {
      console.info(
        `[REFLECTION] theme fallback ${themeDebugSnapshot.primaryTheme} -> ${themeDebugSnapshot.theme} for ${date}`,
      );
    }
    if (debugSnapshot.usedRecycle) {
      console.info(
        `[REFLECTION] recycled from shown pool for ${date} (eligible=${debugSnapshot.totalEligiblePoolSize}, unseen=${debugSnapshot.unseenEligiblePoolSize})`,
      );
    }
  }

  return {
    theme,
    entry: selectDailyAiSeed(date, [theme], options),
  };
}

export function getReflectionIdForDate(
  date: string,
  selectedCategories: ReflectionCategory[],
  persistedReflectionId?: string,
  options?: {
    shownDatesByReflectionId?: Record<string, string>;
    previousReflectionId?: string | null;
    language?: SupportedLanguage | null;
  },
): string {
  return resolveDailyReflectionSelection(date, selectedCategories, persistedReflectionId, options).entry.id;
}

export function getReflectionForDate(
  date: string,
  selectedCategories: ReflectionCategory[],
  favorites: string[],
  dailySelections: Record<string, string>,
  language?: SupportedLanguage | null,
): ReflectionItem {
  const entry = resolveReflectionEntryForDate(date, selectedCategories, dailySelections[date], {
    language,
  });
  return buildReflectionItem(entry, date, favorites, language);
}

export function hydrateReflectionById(
  reflectionId: string,
  date: string,
  favorites: string[],
  language?: SupportedLanguage | null,
): ReflectionItem | null {
  const entry = getReflectionEntryById(reflectionId);
  if (!entry || !hasLocalizedReflectionText(entry, language)) {
    return null;
  }

  return buildReflectionItem(entry, date, favorites, language);
}
