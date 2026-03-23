import { useAppContext } from "@/context/AppContext";
import { palette } from "@/utils/theme";

export function useThemeColors() {
  const { colorScheme } = useAppContext();
  return palette[colorScheme];
}
