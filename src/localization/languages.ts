import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import { STORAGE_KEYS } from "@/storage/keys";
import { SubscriptionModel, SupportedLanguage } from "@/types/reflection";

type LanguageDirection = "ltr" | "rtl";

interface LanguageRegistryEntry {
  code: SupportedLanguage;
  englishLabel: string;
  nativeLabel: string;
  locale: string;
  rtl: boolean;
  premium?: boolean;
}

export type LanguageOption = LanguageRegistryEntry;

export const OFFICIALLY_SUPPORTED_LANGUAGE_CODES = ["de", "en", "pt-BR", "fr", "es"] as const;
export const FREEMIUM_APP_LANGUAGE_CODES = ["de", "en"] as const;
export const PREMIUM_APP_LANGUAGE_CODES = OFFICIALLY_SUPPORTED_LANGUAGE_CODES;
export const FREEMIUM_REFLECTION_LANGUAGE_CODES = ["same_as_app"] as const;
export const PREMIUM_REFLECTION_LANGUAGE_CODES = ["same_as_app", ...OFFICIALLY_SUPPORTED_LANGUAGE_CODES] as const;
export const OFFICIAL_LANGUAGE_DISPLAY_LABELS: Record<(typeof OFFICIALLY_SUPPORTED_LANGUAGE_CODES)[number], string> = {
  de: "Deutsch",
  en: "English",
  "pt-BR": "Português (Brasil)",
  fr: "Français",
  es: "Español",
};

const LANGUAGE_REGISTRY: LanguageRegistryEntry[] = [
  { code: "af", englishLabel: "Afrikaans", nativeLabel: "Afrikaans", locale: "af-ZA", rtl: false },
  { code: "am", englishLabel: "Amharic", nativeLabel: "አማርኛ", locale: "am-ET", rtl: false },
  { code: "ar", englishLabel: "Arabic", nativeLabel: "العربية", locale: "ar-SA", rtl: true },
  { code: "az", englishLabel: "Azerbaijani", nativeLabel: "Azərbaycanca", locale: "az-AZ", rtl: false },
  { code: "be", englishLabel: "Belarusian", nativeLabel: "Беларуская", locale: "be-BY", rtl: false },
  { code: "bg", englishLabel: "Bulgarian", nativeLabel: "Български", locale: "bg-BG", rtl: false },
  { code: "bn", englishLabel: "Bengali", nativeLabel: "বাংলা", locale: "bn-BD", rtl: false },
  { code: "bs", englishLabel: "Bosnian", nativeLabel: "Bosanski", locale: "bs-BA", rtl: false },
  { code: "ca", englishLabel: "Catalan", nativeLabel: "Català", locale: "ca-ES", rtl: false },
  { code: "cs", englishLabel: "Czech", nativeLabel: "Čeština", locale: "cs-CZ", rtl: false },
  { code: "cy", englishLabel: "Welsh", nativeLabel: "Cymraeg", locale: "cy-GB", rtl: false },
  { code: "da", englishLabel: "Danish", nativeLabel: "Dansk", locale: "da-DK", rtl: false },
  { code: "de", englishLabel: "German", nativeLabel: "Deutsch", locale: "de-DE", rtl: false },
  { code: "el", englishLabel: "Greek", nativeLabel: "Ελληνικά", locale: "el-GR", rtl: false },
  { code: "en", englishLabel: "English", nativeLabel: "English", locale: "en-US", rtl: false },
  { code: "es", englishLabel: "Spanish", nativeLabel: "Español", locale: "es-ES", rtl: false },
  { code: "et", englishLabel: "Estonian", nativeLabel: "Eesti", locale: "et-EE", rtl: false },
  { code: "eu", englishLabel: "Basque", nativeLabel: "Euskara", locale: "eu-ES", rtl: false },
  { code: "fa", englishLabel: "Persian", nativeLabel: "فارسی", locale: "fa-IR", rtl: true },
  { code: "fi", englishLabel: "Finnish", nativeLabel: "Suomi", locale: "fi-FI", rtl: false },
  { code: "fil", englishLabel: "Filipino", nativeLabel: "Filipino", locale: "fil-PH", rtl: false },
  { code: "fr", englishLabel: "French", nativeLabel: "Français", locale: "fr-FR", rtl: false },
  { code: "ga", englishLabel: "Irish", nativeLabel: "Gaeilge", locale: "ga-IE", rtl: false },
  { code: "gl", englishLabel: "Galician", nativeLabel: "Galego", locale: "gl-ES", rtl: false },
  { code: "gu", englishLabel: "Gujarati", nativeLabel: "ગુજરાતી", locale: "gu-IN", rtl: false },
  { code: "ha", englishLabel: "Hausa", nativeLabel: "Hausa", locale: "ha-NG", rtl: false },
  { code: "he", englishLabel: "Hebrew", nativeLabel: "עברית", locale: "he-IL", rtl: true },
  { code: "hi", englishLabel: "Hindi", nativeLabel: "हिन्दी", locale: "hi-IN", rtl: false },
  { code: "hr", englishLabel: "Croatian", nativeLabel: "Hrvatski", locale: "hr-HR", rtl: false },
  { code: "hu", englishLabel: "Hungarian", nativeLabel: "Magyar", locale: "hu-HU", rtl: false },
  { code: "hy", englishLabel: "Armenian", nativeLabel: "Հայերեն", locale: "hy-AM", rtl: false },
  { code: "id", englishLabel: "Indonesian", nativeLabel: "Bahasa Indonesia", locale: "id-ID", rtl: false },
  { code: "ig", englishLabel: "Igbo", nativeLabel: "Igbo", locale: "ig-NG", rtl: false },
  { code: "is", englishLabel: "Icelandic", nativeLabel: "Íslenska", locale: "is-IS", rtl: false },
  { code: "it", englishLabel: "Italian", nativeLabel: "Italiano", locale: "it-IT", rtl: false },
  { code: "ja", englishLabel: "Japanese", nativeLabel: "日本語", locale: "ja-JP", rtl: false },
  { code: "ka", englishLabel: "Georgian", nativeLabel: "ქართული", locale: "ka-GE", rtl: false },
  { code: "kk", englishLabel: "Kazakh", nativeLabel: "Қазақша", locale: "kk-KZ", rtl: false },
  { code: "km", englishLabel: "Khmer", nativeLabel: "ខ្មែរ", locale: "km-KH", rtl: false },
  { code: "kn", englishLabel: "Kannada", nativeLabel: "ಕನ್ನಡ", locale: "kn-IN", rtl: false },
  { code: "ko", englishLabel: "Korean", nativeLabel: "한국어", locale: "ko-KR", rtl: false },
  { code: "ku", englishLabel: "Kurdish", nativeLabel: "Kurdî", locale: "ku-TR", rtl: true },
  { code: "ky", englishLabel: "Kyrgyz", nativeLabel: "Кыргызча", locale: "ky-KG", rtl: false },
  { code: "lo", englishLabel: "Lao", nativeLabel: "ລາວ", locale: "lo-LA", rtl: false },
  { code: "lt", englishLabel: "Lithuanian", nativeLabel: "Lietuvių", locale: "lt-LT", rtl: false },
  { code: "lv", englishLabel: "Latvian", nativeLabel: "Latviešu", locale: "lv-LV", rtl: false },
  { code: "mk", englishLabel: "Macedonian", nativeLabel: "Македонски", locale: "mk-MK", rtl: false },
  { code: "ml", englishLabel: "Malayalam", nativeLabel: "മലയാളം", locale: "ml-IN", rtl: false },
  { code: "mn", englishLabel: "Mongolian", nativeLabel: "Монгол", locale: "mn-MN", rtl: false },
  { code: "mr", englishLabel: "Marathi", nativeLabel: "मराठी", locale: "mr-IN", rtl: false },
  { code: "ms", englishLabel: "Malay", nativeLabel: "Bahasa Melayu", locale: "ms-MY", rtl: false },
  { code: "mt", englishLabel: "Maltese", nativeLabel: "Malti", locale: "mt-MT", rtl: false },
  { code: "my", englishLabel: "Burmese", nativeLabel: "မြန်မာ", locale: "my-MM", rtl: false },
  { code: "ne", englishLabel: "Nepali", nativeLabel: "नेपाली", locale: "ne-NP", rtl: false },
  { code: "nl", englishLabel: "Dutch", nativeLabel: "Nederlands", locale: "nl-NL", rtl: false },
  { code: "no", englishLabel: "Norwegian", nativeLabel: "Norsk", locale: "nb-NO", rtl: false },
  { code: "or", englishLabel: "Odia", nativeLabel: "ଓଡ଼ିଆ", locale: "or-IN", rtl: false },
  { code: "pa", englishLabel: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ", locale: "pa-IN", rtl: false },
  { code: "pl", englishLabel: "Polish", nativeLabel: "Polski", locale: "pl-PL", rtl: false },
  { code: "ps", englishLabel: "Pashto", nativeLabel: "پښتو", locale: "ps-AF", rtl: true },
  { code: "pt", englishLabel: "Portuguese", nativeLabel: "Português", locale: "pt-PT", rtl: false },
  { code: "pt-BR", englishLabel: "Portuguese (Brazil)", nativeLabel: "Português (Brasil)", locale: "pt-BR", rtl: false },
  { code: "ro", englishLabel: "Romanian", nativeLabel: "Română", locale: "ro-RO", rtl: false },
  { code: "ru", englishLabel: "Russian", nativeLabel: "Русский", locale: "ru-RU", rtl: false },
  { code: "si", englishLabel: "Sinhala", nativeLabel: "සිංහල", locale: "si-LK", rtl: false },
  { code: "sk", englishLabel: "Slovak", nativeLabel: "Slovenčina", locale: "sk-SK", rtl: false },
  { code: "sl", englishLabel: "Slovenian", nativeLabel: "Slovenščina", locale: "sl-SI", rtl: false },
  { code: "so", englishLabel: "Somali", nativeLabel: "Soomaali", locale: "so-SO", rtl: false },
  { code: "sq", englishLabel: "Albanian", nativeLabel: "Shqip", locale: "sq-AL", rtl: false },
  { code: "sr", englishLabel: "Serbian", nativeLabel: "Српски", locale: "sr-RS", rtl: false },
  { code: "sv", englishLabel: "Swedish", nativeLabel: "Svenska", locale: "sv-SE", rtl: false },
  { code: "sw", englishLabel: "Swahili", nativeLabel: "Kiswahili", locale: "sw-KE", rtl: false },
  { code: "ta", englishLabel: "Tamil", nativeLabel: "தமிழ்", locale: "ta-IN", rtl: false },
  { code: "te", englishLabel: "Telugu", nativeLabel: "తెలుగు", locale: "te-IN", rtl: false },
  { code: "th", englishLabel: "Thai", nativeLabel: "ไทย", locale: "th-TH", rtl: false },
  { code: "tr", englishLabel: "Turkish", nativeLabel: "Türkçe", locale: "tr-TR", rtl: false },
  { code: "uk", englishLabel: "Ukrainian", nativeLabel: "Українська", locale: "uk-UA", rtl: false },
  { code: "ur", englishLabel: "Urdu", nativeLabel: "اردو", locale: "ur-PK", rtl: true },
  { code: "uz", englishLabel: "Uzbek", nativeLabel: "Oʻzbek", locale: "uz-UZ", rtl: false },
  { code: "vi", englishLabel: "Vietnamese", nativeLabel: "Tiếng Việt", locale: "vi-VN", rtl: false },
  { code: "xh", englishLabel: "Xhosa", nativeLabel: "isiXhosa", locale: "xh-ZA", rtl: false },
  { code: "yo", englishLabel: "Yoruba", nativeLabel: "Yorùbá", locale: "yo-NG", rtl: false },
  { code: "zh", englishLabel: "Chinese (Simplified)", nativeLabel: "简体中文", locale: "zh-CN", rtl: false },
  { code: "zh-HK", englishLabel: "Chinese (Hong Kong)", nativeLabel: "繁體中文（香港）", locale: "zh-HK", rtl: false },
  { code: "zh-TW", englishLabel: "Chinese (Traditional)", nativeLabel: "繁體中文", locale: "zh-TW", rtl: false },
  { code: "zu", englishLabel: "Zulu", nativeLabel: "isiZulu", locale: "zu-ZA", rtl: false },
];

const compareLanguageOptions = (left: LanguageOption, right: LanguageOption) =>
  left.nativeLabel.localeCompare(right.nativeLabel, undefined, { sensitivity: "base" });

const officialLanguageCodeSet = new Set<string>(OFFICIALLY_SUPPORTED_LANGUAGE_CODES.map((code) => code.toLowerCase()));

export const ALL_LANGUAGE_OPTIONS: LanguageOption[] = [...LANGUAGE_REGISTRY].sort(compareLanguageOptions);

export const SUPPORTED_LANGUAGES: LanguageOption[] = ALL_LANGUAGE_OPTIONS.filter((language) =>
  officialLanguageCodeSet.has(language.code.toLowerCase()),
);

export const LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LANGUAGES;
export const QUOTE_LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LANGUAGES;

const languageMap = new Map(SUPPORTED_LANGUAGES.map((language) => [language.code.toLowerCase(), language]));
const officialLanguageAliases = new Map<string, SupportedLanguage>([["pt", "pt-BR"]]);

function normalizeLanguageCode(code: string | null | undefined): string | null {
  if (!code) {
    return null;
  }

  const trimmed = code.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.toLowerCase();
}

function resolveSupportedLanguageCode(code: string | null | undefined): SupportedLanguage | null {
  const normalized = normalizeLanguageCode(code);
  if (!normalized) {
    return null;
  }

  const direct = languageMap.get(normalized);
  if (direct) {
    return direct.code;
  }

  const alias = officialLanguageAliases.get(normalized);
  if (alias) {
    return alias;
  }

  const baseCode = normalized.split("-")[0];
  const baseAlias = officialLanguageAliases.get(baseCode);
  if (baseAlias) {
    return baseAlias;
  }

  return languageMap.get(baseCode)?.code ?? null;
}

export function getLanguageOption(code: SupportedLanguage | null | undefined): LanguageOption | null {
  const resolvedCode = resolveSupportedLanguageCode(code);
  if (!resolvedCode) {
    return null;
  }

  return languageMap.get(resolvedCode.toLowerCase()) ?? null;
}

export function isRTLLanguage(code: SupportedLanguage | null | undefined): boolean {
  return Boolean(getLanguageOption(code)?.rtl);
}

export function getLanguageDirection(code: SupportedLanguage | null | undefined): LanguageDirection {
  return isRTLLanguage(code) ? "rtl" : "ltr";
}

export function resolveLocale(code: SupportedLanguage | null | undefined): string {
  return getLanguageOption(code)?.locale ?? "en-US";
}

export function filterLanguageOptions(
  query: string,
  options: readonly LanguageOption[] = SUPPORTED_LANGUAGES,
): LanguageOption[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return [...options];
  }

  return options.filter((language) =>
    [language.nativeLabel, language.englishLabel, language.code]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(normalized)),
  );
}

export function getSupportedLanguages(): LanguageOption[] {
  return [...SUPPORTED_LANGUAGES];
}

function getLanguageTier(subscriptionModel?: SubscriptionModel | null): "free" | "premium" {
  return subscriptionModel === "Premium" || subscriptionModel === "Lifelong" ? "premium" : "free";
}

export function getAvailableAppLanguageCodes(subscriptionModel?: SubscriptionModel | null): SupportedLanguage[] {
  return [...(getLanguageTier(subscriptionModel) === "premium" ? PREMIUM_APP_LANGUAGE_CODES : FREEMIUM_APP_LANGUAGE_CODES)];
}

export function getAvailableReflectionLanguageCodes(subscriptionModel?: SubscriptionModel | null): SupportedLanguage[] {
  const codes =
    getLanguageTier(subscriptionModel) === "premium"
      ? PREMIUM_REFLECTION_LANGUAGE_CODES
      : FREEMIUM_REFLECTION_LANGUAGE_CODES;
  return codes.filter((code) => code !== "same_as_app");
}

export function getSupportedAppLanguages(subscriptionModel?: SubscriptionModel | null): LanguageOption[] {
  const allowed = new Set(getAvailableAppLanguageCodes(subscriptionModel).map((code) => code.toLowerCase()));
  return getSupportedLanguages().filter((language) => allowed.has(language.code.toLowerCase()));
}

export function getSupportedReflectionLanguages(subscriptionModel?: SubscriptionModel | null): LanguageOption[] {
  const allowed = new Set(getAvailableReflectionLanguageCodes(subscriptionModel).map((code) => code.toLowerCase()));
  return getSupportedLanguages().filter((language) => allowed.has(language.code.toLowerCase()));
}

export function canChooseIndependentReflectionLanguage(subscriptionModel?: SubscriptionModel | null): boolean {
  return getLanguageTier(subscriptionModel) === "premium";
}

export function sanitizeAppLanguageForSubscription(
  code: SupportedLanguage | null | undefined,
  subscriptionModel?: SubscriptionModel | null,
): SupportedLanguage {
  const resolved = sanitizeAppLanguage(code);
  const allowed = getAvailableAppLanguageCodes(subscriptionModel);
  return allowed.includes(resolved) ? resolved : "en";
}

export function sanitizeReflectionLanguageForSubscription(
  language: SupportedLanguage | null | undefined,
  appLanguage: SupportedLanguage,
  subscriptionModel?: SubscriptionModel | null,
): SupportedLanguage {
  if (!canChooseIndependentReflectionLanguage(subscriptionModel)) {
    return appLanguage;
  }

  const resolved = sanitizeAppLanguage(language);
  const allowed = getAvailableReflectionLanguageCodes(subscriptionModel);
  return allowed.includes(resolved) ? resolved : appLanguage;
}

export function sanitizeReflectionLanguagesForSubscription(
  languages: readonly (SupportedLanguage | null | undefined)[] | null | undefined,
  appLanguage: SupportedLanguage,
  subscriptionModel?: SubscriptionModel | null,
): SupportedLanguage[] {
  if (!canChooseIndependentReflectionLanguage(subscriptionModel)) {
    return [appLanguage];
  }

  const allowed = new Set(getAvailableReflectionLanguageCodes(subscriptionModel));
  const sanitized = Array.from(
    new Set(
      (languages ?? [])
        .map((language) => sanitizeAppLanguage(language))
        .filter((language) => allowed.has(language)),
    ),
  );

  return sanitized.length ? sanitized : [appLanguage];
}

export function getOfficialLanguageDisplayLabel(code: SupportedLanguage | null | undefined): string {
  const resolved = getLanguageOption(code)?.code;
  if (!resolved) {
    return OFFICIAL_LANGUAGE_DISPLAY_LABELS.en;
  }

  return (
    OFFICIAL_LANGUAGE_DISPLAY_LABELS[resolved as keyof typeof OFFICIAL_LANGUAGE_DISPLAY_LABELS] ??
    getLanguageOption(resolved)?.nativeLabel ??
    OFFICIAL_LANGUAGE_DISPLAY_LABELS.en
  );
}

export function isSupportedAppLanguage(code: SupportedLanguage | null | undefined): boolean {
  return Boolean(resolveSupportedLanguageCode(code));
}

export function sanitizeAppLanguage(code: SupportedLanguage | null | undefined): SupportedLanguage {
  const resolved = resolveSupportedLanguageCode(code);
  return resolved ?? "en";
}

export function getDeviceLanguage(): SupportedLanguage {
  const locales = getLocales();

  for (const locale of locales) {
    const candidates = [
      locale.languageTag,
      `${locale.languageCode ?? ""}${locale.regionCode ? `-${locale.regionCode}` : ""}`,
      locale.languageCode,
    ].filter(Boolean) as string[];

    for (const candidate of candidates) {
      const resolved = resolveSupportedLanguageCode(candidate);
      if (resolved) {
        return resolved;
      }
    }
  }

  return "en";
}

export async function getInitialLanguage(): Promise<SupportedLanguage> {
  try {
    const storedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.preferredLanguage);
    const sanitizedStoredLanguage = sanitizeAppLanguage(resolveSupportedLanguageCode(storedLanguage));
    if (sanitizedStoredLanguage) {
      return sanitizedStoredLanguage;
    }
  } catch (error) {
    console.warn("Failed to read preferred language from storage", error);
  }

  return sanitizeAppLanguage(getDeviceLanguage());
}

export async function persistLanguageSelection(languageCode: SupportedLanguage): Promise<SupportedLanguage> {
  const sanitizedLanguage = sanitizeAppLanguage(languageCode);

  try {
    await AsyncStorage.setItem(STORAGE_KEYS.preferredLanguage, sanitizedLanguage);
  } catch (error) {
    console.warn("Failed to persist preferred language", error);
  }

  return sanitizedLanguage;
}
