import { useAppContext } from "@/context/AppContext";
import { resolvePersonalizationSelection } from "@/theme/system";

export function usePersonalization() {
  const { appState } = useAppContext();

  return resolvePersonalizationSelection({
    paperThemeId: appState.preferences.paperThemeId,
    typographyPresetId: appState.preferences.typographyPresetId,
    pageStyleId: appState.preferences.pageStyleId,
  });
}
