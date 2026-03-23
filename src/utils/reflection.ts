import { ReflectionCategory, ReflectionSeedItem, SupportedLanguage } from "@/types/reflection";
import { REFLECTION_SEED } from "@/data/reflections";
import { getLocalISODate } from "@/utils/date";

export function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function selectDailyAiSeed(
  date: string,
  selectedCategories: ReflectionCategory[],
): ReflectionSeedItem {
  const pool = REFLECTION_SEED.filter((item) => selectedCategories.includes(item.category));
  const eligiblePool = pool.length ? pool : REFLECTION_SEED;
  const index = hashString(date) % eligiblePool.length;
  const seed = eligiblePool[index];

  return {
    ...seed,
    sourceType: "ai",
  };
}

export function todayISODate(): string {
  return getLocalISODate(new Date());
}

function getRecentQuoteLanguageHistory(
  date: string,
  selectedLanguages: string[],
  history: Record<string, SupportedLanguage>,
) {
  return Object.entries(history)
    .filter(([entryDate, language]) => entryDate < date && selectedLanguages.includes(language))
    .sort(([leftDate], [rightDate]) => (leftDate < rightDate ? 1 : -1))
    .map(([, language]) => language)
    .slice(0, Math.max(selectedLanguages.length * 4, 12));
}

export function getDailyReflectionLanguage(
  date: string,
  languages: string[],
  history: Record<string, SupportedLanguage> = {},
  fallbackLanguage?: string | null,
) {
  const pool = languages.length ? languages : fallbackLanguage ? [fallbackLanguage] : ["en"];

  if (pool.length === 1) {
    return pool[0];
  }

  const recentHistory = getRecentQuoteLanguageHistory(date, pool, history);
  const lastLanguage = recentHistory[0] ?? null;

  const ranked = [...pool].sort((left, right) => {
    const leftCount = recentHistory.filter((language) => language === left).length;
    const rightCount = recentHistory.filter((language) => language === right).length;
    if (leftCount !== rightCount) {
      return leftCount - rightCount;
    }

    const leftRepeatPenalty = lastLanguage === left ? 1 : 0;
    const rightRepeatPenalty = lastLanguage === right ? 1 : 0;
    if (leftRepeatPenalty !== rightRepeatPenalty) {
      return leftRepeatPenalty - rightRepeatPenalty;
    }

    const leftDistance = recentHistory.indexOf(left);
    const rightDistance = recentHistory.indexOf(right);
    const normalizedLeftDistance = leftDistance === -1 ? Number.MAX_SAFE_INTEGER : leftDistance;
    const normalizedRightDistance = rightDistance === -1 ? Number.MAX_SAFE_INTEGER : rightDistance;
    if (normalizedLeftDistance !== normalizedRightDistance) {
      return normalizedRightDistance - normalizedLeftDistance;
    }

    const leftHash = hashString(`${date}:${left}`);
    const rightHash = hashString(`${date}:${right}`);
    return leftHash - rightHash;
  });

  return ranked[0];
}

export function resolveQuoteLanguageForDate(
  date: string,
  languages: string[],
  fallbackLanguage?: string | null,
) {
  return getDailyReflectionLanguage(date, languages, {}, fallbackLanguage);
}
