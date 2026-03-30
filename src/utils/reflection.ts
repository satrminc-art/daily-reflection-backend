import {
  ReflectionCategory,
  ReflectionLanguageMode,
  ReflectionSeedItem,
  ReflectionTone,
  SubscriptionModel,
  SupportedLanguage,
} from "@/types/reflection";
import { REFLECTION_SEED } from "@/data/reflections";
import { CALENDAR_INFLUENCES, CalendarInfluence } from "@/data/calendarInfluences";
import { REFLECTION_TRANSLATIONS } from "@/data/reflectionTranslations";
import { getAdjacentISODate, getLocalISODate } from "@/utils/date";
import { hasFeature, normalizeMembershipTier } from "@/utils/membershipHelpers";

interface SeedSelectionOptions {
  shownDatesByReflectionId?: Record<string, string>;
  previousReflectionId?: string | null;
  language?: SupportedLanguage | null;
}

interface ThemeRotationOptions {
  dailyThemeSelections?: Record<string, ReflectionCategory>;
  shownDatesByReflectionId?: Record<string, string>;
  language?: SupportedLanguage | null;
}

interface SeedSelectionDebugSnapshot {
  influence: CalendarInfluence | null;
  totalEligiblePoolSize: number;
  influencedPoolSize: number;
  unseenInfluencedPoolSize: number;
  unseenEligiblePoolSize: number;
  usedBias: boolean;
  usedFallbackPool: boolean;
  usedRecycle: boolean;
  matchedSeedIds: string[];
}

interface ThemeRotationDebugSnapshot {
  theme: ReflectionCategory;
  primaryTheme: ReflectionCategory;
  usedFallbackTheme: boolean;
  availableThemes: ReflectionCategory[];
  unseenCountsByTheme: Record<ReflectionCategory, number>;
}

export function hashString(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash << 5) - hash + input.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

const CATEGORY_THEME_MAP: Record<ReflectionCategory, string[]> = {
  calm: ["stillness", "rest", "quiet", "inner-warmth", "openness"],
  clarity: ["clarity", "elegant-order", "reflection", "honesty", "beginning"],
  discipline: ["intention", "beginning", "focus", "courage", "structure"],
  "self-respect": ["honesty", "letting-go", "care", "beginning", "grounding"],
  purpose: ["meaning", "beginning", "renewal", "reflection", "openness"],
  relationships: ["connection", "care", "tenderness", "gratitude", "presence"],
  courage: ["courage", "change", "release", "honesty", "openness"],
  creativity: ["joy", "wonder", "playfulness", "curiosity", "light"],
  healing: ["tenderness", "memory", "stillness", "care", "hope"],
  focus: ["focus", "clarity", "elegant-order", "attention", "grounding"],
};

const TONE_THEME_MAP: Record<ReflectionTone, string[]> = {
  gentle: ["gentle", "tenderness", "care", "stillness"],
  "clear-eyed": ["clear-eyed", "clarity", "honesty", "elegant-order"],
  steady: ["steady", "grounding", "presence", "reflection"],
  curious: ["curiosity", "wonder", "playfulness", "openness"],
  grounded: ["grounded", "rest", "gratitude", "connection"],
  expansive: ["expansive", "light", "renewal", "joy"],
};

const THEME_ROTATION_LOOKBACK_DAYS = 14;

function seedSupportsLanguage(entry: ReflectionSeedItem, language?: SupportedLanguage | null): boolean {
  if (!language || language === "en") {
    return true;
  }

  const baseLanguage = language.split("-")[0];
  return Boolean(
    entry.translations?.[language] ??
      entry.translations?.[baseLanguage] ??
      REFLECTION_TRANSLATIONS[language]?.[entry.id] ??
      REFLECTION_TRANSLATIONS[baseLanguage]?.[entry.id],
  );
}

function getEligibleSeedEntries(language?: SupportedLanguage | null): ReflectionSeedItem[] {
  return REFLECTION_SEED.filter((entry) => seedSupportsLanguage(entry, language));
}

function getAllThemeCategories(language?: SupportedLanguage | null): ReflectionCategory[] {
  const localizedEntries = getEligibleSeedEntries(language);
  const sourceEntries = localizedEntries.length ? localizedEntries : REFLECTION_SEED;
  return Array.from(new Set(sourceEntries.map((item) => item.category))).sort() as ReflectionCategory[];
}

export function getAvailableThemes(
  selectedCategories: ReflectionCategory[],
  language?: SupportedLanguage | null,
): ReflectionCategory[] {
  const available = getAllThemeCategories(language);
  const filtered = available.filter((theme) => selectedCategories.includes(theme));
  return filtered.length ? filtered : available;
}

function toMonthDay(date: string | Date): string {
  if (date instanceof Date) {
    return `${`${date.getMonth() + 1}`.padStart(2, "0")}-${`${date.getDate()}`.padStart(2, "0")}`;
  }

  const trimmed = date.trim();
  if (/^\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed.slice(5);
  }

  return "";
}

export function getCalendarInfluenceForDate(date: string | Date): CalendarInfluence | null {
  const monthDay = toMonthDay(date);
  if (!monthDay) {
    return null;
  }

  const matches = CALENDAR_INFLUENCES.filter((entry) => entry.date === monthDay);
  if (!matches.length) {
    return null;
  }

  return [...matches].sort((left, right) => {
    const leftPriority = left.priority ?? 0;
    const rightPriority = right.priority ?? 0;
    if (leftPriority !== rightPriority) {
      return rightPriority - leftPriority;
    }

    const leftWeight = left.weight ?? 0;
    const rightWeight = right.weight ?? 0;
    return rightWeight - leftWeight;
  })[0];
}

function getInfluenceScore(entry: ReflectionSeedItem, influence: CalendarInfluence): number {
  const themes = influence.themes.map((theme) => theme.toLowerCase());
  const tones = (influence.tones ?? []).map((tone) => tone.toLowerCase());
  const categoryThemes = CATEGORY_THEME_MAP[entry.category] ?? [];
  const toneThemes = TONE_THEME_MAP[entry.tone] ?? [];
  const categoryMatches = categoryThemes.filter((theme) => themes.includes(theme)).length;
  const toneThemeMatches = toneThemes.filter((theme) => themes.includes(theme)).length;
  const toneMatches = tones.includes(entry.tone.toLowerCase()) ? 1 : 0;

  return categoryMatches * 2 + toneThemeMatches + toneMatches;
}

function getThemeInfluenceScore(theme: ReflectionCategory, influence: CalendarInfluence | null): number {
  if (!influence) {
    return 0;
  }

  const themes = influence.themes.map((themeEntry) => themeEntry.toLowerCase());
  const tones = (influence.tones ?? []).map((tone) => tone.toLowerCase());
  const categoryThemes = CATEGORY_THEME_MAP[theme] ?? [];
  const categoryMatches = categoryThemes.filter((themeEntry) => themes.includes(themeEntry)).length;
  const toneMatches = tones.filter((toneEntry) => toneEntry.includes("light") && categoryThemes.includes("light")).length;

  return categoryMatches * 2 + toneMatches;
}

function getThemeCompatibilityScore(primaryTheme: ReflectionCategory, candidateTheme: ReflectionCategory): number {
  if (primaryTheme === candidateTheme) {
    return 100;
  }

  const primaryThemes = CATEGORY_THEME_MAP[primaryTheme] ?? [];
  const candidateThemes = CATEGORY_THEME_MAP[candidateTheme] ?? [];
  return primaryThemes.filter((theme) => candidateThemes.includes(theme)).length;
}

function getThemeUseCountInWindow(
  theme: ReflectionCategory,
  date: string,
  dailyThemeSelections: Record<string, ReflectionCategory>,
  lookbackDays = THEME_ROTATION_LOOKBACK_DAYS,
): number {
  let count = 0;
  for (let offset = 1; offset <= lookbackDays; offset += 1) {
    const lookbackDate = getAdjacentISODate(date, -offset);
    if (dailyThemeSelections[lookbackDate] === theme) {
      count += 1;
    }
  }
  return count;
}

function getLastThemeDate(
  theme: ReflectionCategory,
  date: string,
  dailyThemeSelections: Record<string, ReflectionCategory>,
  lookbackDays = 90,
): string | null {
  for (let offset = 1; offset <= lookbackDays; offset += 1) {
    const lookbackDate = getAdjacentISODate(date, -offset);
    if (dailyThemeSelections[lookbackDate] === theme) {
      return lookbackDate;
    }
  }
  return null;
}

function getThemePool(theme: ReflectionCategory, language?: SupportedLanguage | null): ReflectionSeedItem[] {
  const localizedEntries = getEligibleSeedEntries(language);
  const sourceEntries = localizedEntries.length ? localizedEntries : REFLECTION_SEED;
  return sourceEntries.filter((item) => item.category === theme);
}

function getUnseenThemeCount(
  theme: ReflectionCategory,
  shownDatesByReflectionId: Record<string, string>,
  language?: SupportedLanguage | null,
): number {
  return getThemePool(theme, language).filter((entry) => !shownDatesByReflectionId[entry.id]).length;
}

function rankThemesForPrimarySelection(
  themes: ReflectionCategory[],
  date: string,
  dailyThemeSelections: Record<string, ReflectionCategory>,
  influence: CalendarInfluence | null,
): ReflectionCategory[] {
  const yesterdayTheme = dailyThemeSelections[getAdjacentISODate(date, -1)] ?? null;

  return [...themes].sort((left, right) => {
    const leftYesterdayPenalty = left === yesterdayTheme ? 1 : 0;
    const rightYesterdayPenalty = right === yesterdayTheme ? 1 : 0;
    if (leftYesterdayPenalty !== rightYesterdayPenalty) {
      return leftYesterdayPenalty - rightYesterdayPenalty;
    }

    const leftRecentCount = getThemeUseCountInWindow(left, date, dailyThemeSelections);
    const rightRecentCount = getThemeUseCountInWindow(right, date, dailyThemeSelections);
    if (leftRecentCount !== rightRecentCount) {
      return leftRecentCount - rightRecentCount;
    }

    const leftInfluence = getThemeInfluenceScore(left, influence);
    const rightInfluence = getThemeInfluenceScore(right, influence);
    if (leftInfluence !== rightInfluence) {
      return rightInfluence - leftInfluence;
    }

    const leftLastSeenDate = getLastThemeDate(left, date, dailyThemeSelections);
    const rightLastSeenDate = getLastThemeDate(right, date, dailyThemeSelections);
    if (leftLastSeenDate !== rightLastSeenDate) {
      if (!leftLastSeenDate) {
        return -1;
      }
      if (!rightLastSeenDate) {
        return 1;
      }
      return leftLastSeenDate < rightLastSeenDate ? -1 : 1;
    }

    return hashString(`${date}:${left}`) - hashString(`${date}:${right}`);
  });
}

function rankFallbackThemes(
  themes: ReflectionCategory[],
  date: string,
  dailyThemeSelections: Record<string, ReflectionCategory>,
  primaryTheme: ReflectionCategory,
  influence: CalendarInfluence | null,
): ReflectionCategory[] {
  const yesterdayTheme = dailyThemeSelections[getAdjacentISODate(date, -1)] ?? null;

  return [...themes].sort((left, right) => {
    const leftYesterdayPenalty = left === yesterdayTheme ? 1 : 0;
    const rightYesterdayPenalty = right === yesterdayTheme ? 1 : 0;
    if (leftYesterdayPenalty !== rightYesterdayPenalty) {
      return leftYesterdayPenalty - rightYesterdayPenalty;
    }

    const leftCompatibility = getThemeCompatibilityScore(primaryTheme, left);
    const rightCompatibility = getThemeCompatibilityScore(primaryTheme, right);
    if (leftCompatibility !== rightCompatibility) {
      return rightCompatibility - leftCompatibility;
    }

    const leftInfluence = getThemeInfluenceScore(left, influence);
    const rightInfluence = getThemeInfluenceScore(right, influence);
    if (leftInfluence !== rightInfluence) {
      return rightInfluence - leftInfluence;
    }

    const leftRecentCount = getThemeUseCountInWindow(left, date, dailyThemeSelections);
    const rightRecentCount = getThemeUseCountInWindow(right, date, dailyThemeSelections);
    if (leftRecentCount !== rightRecentCount) {
      return leftRecentCount - rightRecentCount;
    }

    const leftLastSeenDate = getLastThemeDate(left, date, dailyThemeSelections);
    const rightLastSeenDate = getLastThemeDate(right, date, dailyThemeSelections);
    if (leftLastSeenDate !== rightLastSeenDate) {
      if (!leftLastSeenDate) {
        return -1;
      }
      if (!rightLastSeenDate) {
        return 1;
      }
      return leftLastSeenDate < rightLastSeenDate ? -1 : 1;
    }

    return hashString(`${date}:${primaryTheme}:${left}`) - hashString(`${date}:${primaryTheme}:${right}`);
  });
}

export function getDailyThemeForUser(
  date: string,
  selectedCategories: ReflectionCategory[],
  options: ThemeRotationOptions = {},
): ReflectionCategory {
  const debug = getDailyThemeDebugSnapshot(date, selectedCategories, options);
  return debug.theme;
}

export function getDailyThemeDebugSnapshot(
  date: string,
  selectedCategories: ReflectionCategory[],
  options: ThemeRotationOptions = {},
): ThemeRotationDebugSnapshot {
  const dailyThemeSelections = options.dailyThemeSelections ?? {};
  const shownDatesByReflectionId = options.shownDatesByReflectionId ?? {};
  const availableThemes = getAvailableThemes(selectedCategories, options.language);
  const influence = getCalendarInfluenceForDate(date);
  const primaryTheme = rankThemesForPrimarySelection(availableThemes, date, dailyThemeSelections, influence)[0];
  const unseenCountsByTheme = Object.fromEntries(
    availableThemes.map((theme) => [theme, getUnseenThemeCount(theme, shownDatesByReflectionId, options.language)]),
  ) as Record<ReflectionCategory, number>;

  if ((unseenCountsByTheme[primaryTheme] ?? 0) > 0) {
    return {
      theme: primaryTheme,
      primaryTheme,
      usedFallbackTheme: false,
      availableThemes,
      unseenCountsByTheme,
    };
  }

  const fallbackThemes = rankFallbackThemes(
    availableThemes.filter((theme) => theme !== primaryTheme && (unseenCountsByTheme[theme] ?? 0) > 0),
    date,
    dailyThemeSelections,
    primaryTheme,
    influence,
  );

  if (fallbackThemes.length) {
    return {
      theme: fallbackThemes[0],
      primaryTheme,
      usedFallbackTheme: true,
      availableThemes,
      unseenCountsByTheme,
    };
  }

  const recycleThemes = rankFallbackThemes(availableThemes, date, dailyThemeSelections, primaryTheme, influence);
  return {
    theme: recycleThemes[0] ?? primaryTheme,
    primaryTheme,
    usedFallbackTheme: recycleThemes[0] !== primaryTheme,
    availableThemes,
    unseenCountsByTheme,
  };
}

export function getCalendarInfluenceDebugSnapshot(
  date: string,
  selectedCategories: ReflectionCategory[],
  options: SeedSelectionOptions = {},
): SeedSelectionDebugSnapshot {
  const shownDatesByReflectionId = options.shownDatesByReflectionId ?? {};
  const { influence, eligiblePool, influencedPool, usedBias } = buildInfluencedPool(
    date,
    selectedCategories,
    options.language,
  );
  const unseenInfluencedPool = influencedPool.filter((entry) => !shownDatesByReflectionId[entry.id]);
  const unseenEligiblePool = eligiblePool.filter((entry) => !shownDatesByReflectionId[entry.id]);
  const matchedSeedIds =
    influence && usedBias
      ? influencedPool
          .map((entry) => ({ id: entry.id, score: getInfluenceScore(entry, influence) }))
          .filter((entry) => entry.score > 0)
          .sort((left, right) => right.score - left.score)
          .slice(0, 6)
          .map((entry) => entry.id)
      : [];

  return {
    influence,
    totalEligiblePoolSize: eligiblePool.length,
    influencedPoolSize: influencedPool.length,
    unseenInfluencedPoolSize: unseenInfluencedPool.length,
    unseenEligiblePoolSize: unseenEligiblePool.length,
    usedBias,
    usedFallbackPool: unseenInfluencedPool.length === 0 && unseenEligiblePool.length > 0,
    usedRecycle: unseenEligiblePool.length === 0,
    matchedSeedIds,
  };
}

function buildInfluencedPool(
  date: string,
  selectedCategories: ReflectionCategory[],
  language?: SupportedLanguage | null,
): {
  influence: CalendarInfluence | null;
  eligiblePool: ReflectionSeedItem[];
  influencedPool: ReflectionSeedItem[];
  usedBias: boolean;
  scoreFloor: number | null;
} {
  const localizedSeedEntries = getEligibleSeedEntries(language);
  const fallbackSeedEntries = localizedSeedEntries.length ? localizedSeedEntries : REFLECTION_SEED;
  const pool = fallbackSeedEntries.filter((item) => selectedCategories.includes(item.category));
  const eligiblePool = pool.length ? pool : fallbackSeedEntries;
  const influence = getCalendarInfluenceForDate(date);

  if (!influence) {
    return {
      influence: null,
      eligiblePool,
      influencedPool: eligiblePool,
      usedBias: false,
      scoreFloor: null,
    };
  }

  const scored = eligiblePool.map((entry) => ({
    entry,
    score: getInfluenceScore(entry, influence),
  }));
  const strongestScore = Math.max(...scored.map((entry) => entry.score), 0);

  if (strongestScore <= 0) {
    return {
      influence,
      eligiblePool,
      influencedPool: eligiblePool,
      usedBias: false,
      scoreFloor: null,
    };
  }

  const influenceWeight = Math.min(Math.max(influence.weight ?? 0.65, 0), 1);
  const scoreFloor = influenceWeight >= 0.75 || strongestScore <= 1 ? strongestScore : strongestScore - 1;

  return {
    influence,
    eligiblePool,
    influencedPool: scored.filter((entry) => entry.score >= scoreFloor).map((entry) => entry.entry),
    usedBias: true,
    scoreFloor,
  };
}

function sortPoolForRecycle(
  pool: ReflectionSeedItem[],
  shownDatesByReflectionId: Record<string, string>,
  tieBreakerKey: string,
): ReflectionSeedItem[] {
  return [...pool].sort((left, right) => {
    const leftSeenDate = shownDatesByReflectionId[left.id] ?? "";
    const rightSeenDate = shownDatesByReflectionId[right.id] ?? "";
    if (leftSeenDate !== rightSeenDate) {
      return leftSeenDate < rightSeenDate ? -1 : 1;
    }

    return hashString(`${tieBreakerKey}:${left.id}`) - hashString(`${tieBreakerKey}:${right.id}`);
  });
}

export function selectDailyAiSeed(
  date: string,
  selectedCategories: ReflectionCategory[],
  options: SeedSelectionOptions = {},
): ReflectionSeedItem {
  const shownDatesByReflectionId = options.shownDatesByReflectionId ?? {};
  const previousReflectionId = options.previousReflectionId ?? null;
  const { influence, eligiblePool, influencedPool, scoreFloor } = buildInfluencedPool(
    date,
    selectedCategories,
    options.language,
  );

  const unseenInfluencedPool = influencedPool.filter((entry) => !shownDatesByReflectionId[entry.id]);
  const unseenEligiblePool = eligiblePool.filter((entry) => !shownDatesByReflectionId[entry.id]);

  let candidatePool = unseenInfluencedPool;
  let tieBreakerKey = `${date}:unseen`;

  if (!candidatePool.length) {
    candidatePool = unseenEligiblePool;
    tieBreakerKey = `${date}:fallback-unseen`;
  }

  if (!candidatePool.length) {
    const recyclablePool = eligiblePool.filter((entry) => entry.id !== previousReflectionId);
    const recycleSource = recyclablePool.length ? recyclablePool : eligiblePool;
    candidatePool = sortPoolForRecycle(recycleSource, shownDatesByReflectionId, `${date}:recycle`);
    tieBreakerKey = `${date}:recycle`;
  }

  const index = hashString(
    `${tieBreakerKey}:${influence?.id ?? "default"}:${scoreFloor ?? "all"}:${candidatePool.length}`,
  ) % candidatePool.length;
  const seed = candidatePool[index];

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

export function getEffectiveReflectionLanguage(params: {
  appLanguage: SupportedLanguage | null | undefined;
  reflectionLanguageMode: ReflectionLanguageMode | null | undefined;
  reflectionLanguage: SupportedLanguage | null | undefined;
  reflectionLanguages?: readonly (SupportedLanguage | null | undefined)[] | null | undefined;
  subscriptionModel: SubscriptionModel;
}): SupportedLanguage {
  return getEffectiveReflectionLanguages(params)[0] ?? params.appLanguage ?? "en";
}

export function getEffectiveReflectionLanguages(params: {
  appLanguage: SupportedLanguage | null | undefined;
  reflectionLanguageMode: ReflectionLanguageMode | null | undefined;
  reflectionLanguage: SupportedLanguage | null | undefined;
  reflectionLanguages?: readonly (SupportedLanguage | null | undefined)[] | null | undefined;
  subscriptionModel: SubscriptionModel;
}): SupportedLanguage[] {
  const appLanguage = params.appLanguage ?? "en";
  const membershipTier = normalizeMembershipTier(params.subscriptionModel);
  const canChooseReflectionLanguage = hasFeature(membershipTier, "quote-language-choice");

  if (!canChooseReflectionLanguage) {
    return [appLanguage];
  }

  if (params.reflectionLanguageMode !== "custom") {
    return [appLanguage];
  }

  const selected = Array.from(
    new Set(
      (params.reflectionLanguages?.length ? params.reflectionLanguages : [params.reflectionLanguage])
        .filter(Boolean)
        .map((language) => language ?? appLanguage),
    ),
  );

  return selected.length ? selected : [appLanguage];
}
