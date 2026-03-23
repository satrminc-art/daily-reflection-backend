import { REFLECTION_TRANSLATIONS } from "@/data/reflectionTranslations";
import { YEARLY_REFLECTIONS_BY_DATE, YEARLY_REFLECTIONS_BY_ID } from "@/data/yearly";
import {
  ManualReflectionEntry,
  ReflectionCategory,
  ReflectionItem,
  ReflectionSeedItem,
  SourceType,
  SupportedLanguage,
} from "@/types/reflection";
import { selectDailyAiSeed } from "@/utils/reflection";
import { REFLECTION_SEED } from "@/data/reflections";

type ReflectionContentEntry = ReflectionSeedItem | ManualReflectionEntry;

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

  return (
    entry.text[language] ??
    entry.text[language.split("-")[0]] ??
    entry.text.en ??
    entry.text.de ??
    Object.values(entry.text)[0] ??
    ""
  );
}

function resolveAiText(entry: ReflectionSeedItem, language?: SupportedLanguage | null): string {
  if (!language) {
    return entry.text;
  }

  return REFLECTION_TRANSLATIONS[language]?.[entry.id] ?? entry.text;
}

function buildReflectionItem(
  entry: ReflectionContentEntry,
  date: string,
  favoriteKeys: string[],
  language?: SupportedLanguage | null,
): ReflectionItem {
  const text =
    "date" in entry
      ? resolveManualText(entry, language)
      : resolveAiText(
          {
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
): ReflectionContentEntry {
  const manualEntry = getManualReflectionForDate(date);
  if (manualEntry) {
    return manualEntry;
  }

  if (persistedReflectionId) {
    const persistedEntry = getReflectionEntryById(persistedReflectionId);
    if (persistedEntry) {
      return persistedEntry;
    }
  }

  return selectDailyAiSeed(date, selectedCategories);
}

export function getReflectionIdForDate(
  date: string,
  selectedCategories: ReflectionCategory[],
  persistedReflectionId?: string,
): string {
  return resolveReflectionEntryForDate(date, selectedCategories, persistedReflectionId).id;
}

export function getReflectionForDate(
  date: string,
  selectedCategories: ReflectionCategory[],
  favorites: string[],
  dailySelections: Record<string, string>,
  language?: SupportedLanguage | null,
): ReflectionItem {
  const entry = resolveReflectionEntryForDate(date, selectedCategories, dailySelections[date]);
  return buildReflectionItem(entry, date, favorites, language);
}

export function hydrateReflectionById(
  reflectionId: string,
  date: string,
  favorites: string[],
  language?: SupportedLanguage | null,
): ReflectionItem | null {
  const entry = getReflectionEntryById(reflectionId);
  return entry ? buildReflectionItem(entry, date, favorites, language) : null;
}
