import { useMemo } from "react";
import { useAppContext } from "@/context/AppContext";
import { getAppStrings } from "@/localization/strings";

export function useAppStrings(overrideLanguage?: string | null) {
  const { appState } = useAppContext();

  return useMemo(
    () => getAppStrings(overrideLanguage ?? appState.preferredLanguage),
    [appState.preferredLanguage, overrideLanguage],
  );
}
