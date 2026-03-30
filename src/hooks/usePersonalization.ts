import { useAppContext } from "@/context/AppContext";
import { resolvePersonalizationSelection } from "@/theme/system";

export function usePersonalization() {
  const { appState } = useAppContext();

  return resolvePersonalizationSelection({
    selectedAppearancePresetId: appState.preferences.selectedAppearancePresetId,
    paperThemeId: appState.preferences.paperThemeId,
    typographyPresetId: appState.preferences.typographyPresetId,
    pageStyleId: appState.preferences.pageStyleId,
  });
}
