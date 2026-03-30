import { Platform, Vibration } from "react-native";

type HapticsModule = {
  ImpactFeedbackStyle: {
    Light: unknown;
    Soft?: unknown;
    Medium: unknown;
  };
  NotificationFeedbackType: {
    Success: unknown;
  };
  impactAsync: (style: unknown) => Promise<void>;
  notificationAsync: (type: unknown) => Promise<void>;
  selectionAsync: () => Promise<void>;
};

let cachedHapticsModule: HapticsModule | null | undefined;

function vibrate(pattern: number | number[]) {
  try {
    Vibration.vibrate(pattern);
  } catch (error) {
    console.warn("Failed to trigger haptic feedback", error);
  }
}

function getHapticsModule(): HapticsModule | null {
  if (cachedHapticsModule !== undefined) {
    return cachedHapticsModule;
  }

  try {
    const requiredModule = (globalThis as { require?: (moduleName: string) => unknown }).require?.("expo-haptics");
    cachedHapticsModule = (requiredModule ?? null) as HapticsModule | null;
  } catch {
    cachedHapticsModule = null;
  }

  return cachedHapticsModule;
}

export function triggerSoftSelectionHaptic(enabled = true): void {
  if (!enabled) {
    return;
  }

  const haptics = getHapticsModule();
  if (haptics) {
    void haptics.selectionAsync().catch(() => {
      if (Platform.OS === "android") {
        vibrate([0, 12]);
      } else {
        vibrate(8);
      }
    });
    return;
  }

  if (Platform.OS === "android") {
    vibrate([0, 12]);
    return;
  }

  vibrate(8);
}

export function triggerSoftConfirmationHaptic(enabled = true): void {
  if (!enabled) {
    return;
  }

  const haptics = getHapticsModule();
  if (haptics) {
    void haptics
      .notificationAsync(haptics.NotificationFeedbackType.Success)
      .catch(() => {
        if (Platform.OS === "android") {
          vibrate([0, 18, 24, 14]);
        } else {
          vibrate(18);
        }
      });
    return;
  }

  if (Platform.OS === "android") {
    vibrate([0, 18, 24, 14]);
    return;
  }

  vibrate(18);
}

export function triggerDailyEntryHaptic(segment: "morning" | "midday" | "evening", enabled = true): void {
  if (!enabled) {
    return;
  }

  const haptics = getHapticsModule();
  if (haptics) {
    const style =
      segment === "evening"
        ? haptics.ImpactFeedbackStyle.Soft ?? haptics.ImpactFeedbackStyle.Light
        : haptics.ImpactFeedbackStyle.Light;
    void haptics.impactAsync(style).catch(() => {
      if (Platform.OS === "android") {
        vibrate(segment === "evening" ? [0, 14] : [0, 10]);
      } else {
        vibrate(segment === "evening" ? 14 : 10);
      }
    });
    return;
  }

  if (Platform.OS === "android") {
    vibrate(segment === "evening" ? [0, 14] : [0, 10]);
    return;
  }

  vibrate(segment === "evening" ? 14 : 10);
}
