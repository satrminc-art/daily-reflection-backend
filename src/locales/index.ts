import { localeMessages as de } from "@/locales/de";
import { localeMessages as en } from "@/locales/en";
import { localeMessages as es } from "@/locales/es";
import { localeMessages as fr } from "@/locales/fr";
import { localeMessages as ptBR } from "@/locales/pt-BR";
import { englishMessages, Messages } from "@/localization/strings";

export const MANUAL_UI_TRANSLATIONS: Record<string, Messages> = {
  en,
  de,
  fr,
  es,
  "pt-BR": ptBR,
};

export const FULLY_LOCALIZED_UI_LANGUAGES = ["en", "de", "pt-BR", "fr", "es"] as const;

export function getManualUiMessages(languageCode: string | null | undefined): Messages {
  if (!languageCode) {
    return englishMessages;
  }

  return (
    MANUAL_UI_TRANSLATIONS[languageCode] ??
    MANUAL_UI_TRANSLATIONS[languageCode.split("-")[0]] ??
    englishMessages
  );
}

export function hasManualUiTranslations(languageCode: string | null | undefined): boolean {
  if (!languageCode) {
    return false;
  }

  const exact = MANUAL_UI_TRANSLATIONS[languageCode];
  if (exact) {
    return true;
  }

  const prefix = languageCode.split("-")[0];
  return Boolean(MANUAL_UI_TRANSLATIONS[prefix]);
}

export function isFullyLocalizedUiLanguage(languageCode: string | null | undefined): boolean {
  if (!languageCode) {
    return false;
  }

  const normalized = languageCode.split("-")[0];
  return FULLY_LOCALIZED_UI_LANGUAGES.some(
    (supportedLanguage) =>
      supportedLanguage === languageCode || supportedLanguage.split("-")[0] === normalized,
  );
}
