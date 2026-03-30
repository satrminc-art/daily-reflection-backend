import { useAppContext } from "@/context/AppContext";
import { getLanguageDirection, getLanguageOption, getSupportedAppLanguages, isRTLLanguage } from "@/localization/languages";

export function useAppSettings() {
  const { appState, updateLanguage } = useAppContext();
  const language = appState.preferredLanguage ?? "en";

  return {
    language,
    languageOption: getLanguageOption(language),
    direction: getLanguageDirection(language),
    isRTL: isRTLLanguage(language),
    supportedLanguages: getSupportedAppLanguages(appState.subscriptionModel),
    setLanguage: updateLanguage,
  };
}
