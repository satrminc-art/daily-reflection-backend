import { getReflectionForDate as getLocalReflectionForDate } from "@/services/reflectionService";
import { ReflectionCategory, ReflectionItem, SupportedLanguage } from "@/types/reflection";
import { getDisplayDatePartsForAppLanguage, getTodayKey, hasDayChanged } from "@/utils/date";

export function getCurrentDayKey(now = new Date()) {
  return getTodayKey(now);
}

export function didCurrentDayChange(previousKey: string | null | undefined, now = new Date()) {
  return hasDayChanged(previousKey, getCurrentDayKey(now));
}

export function getReflectionForDateKey(
  dateKey: string,
  categories: ReflectionCategory[],
  favorites: string[],
  dailySelections: Record<string, string>,
  language: SupportedLanguage,
): ReflectionItem {
  return getLocalReflectionForDate(dateKey, categories, favorites, dailySelections, language);
}

export function getLocalizedDatePartsForAppLanguage(dateKey: string, language: SupportedLanguage | string | null | undefined) {
  return getDisplayDatePartsForAppLanguage(dateKey, language);
}
