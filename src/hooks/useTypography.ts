import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { resolveTypographyRoles } from "@/utils/typography";

export function useTypography() {
  const { appState } = useAppContext();

  return useMemo(
    () => resolveTypographyRoles(appState.preferences.typographyPresetId),
    [appState.preferences.typographyPresetId],
  );
}
