import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "@/storage/keys";
import { SubscriptionModel } from "@/types/reflection";

function isSubscriptionModel(value: string | null): value is SubscriptionModel {
  return value === "Freemium" || value === "Premium" || value === "Lifelong";
}

export async function loadDevSubscriptionOverride(): Promise<SubscriptionModel | null> {
  if (!__DEV__) {
    return null;
  }

  const stored = await AsyncStorage.getItem(STORAGE_KEYS.devSubscriptionOverride);
  return isSubscriptionModel(stored) ? stored : null;
}

export async function saveDevSubscriptionOverride(model: SubscriptionModel): Promise<void> {
  if (!__DEV__) {
    return;
  }

  await AsyncStorage.setItem(STORAGE_KEYS.devSubscriptionOverride, model);
}

export async function clearDevSubscriptionOverride(): Promise<void> {
  if (!__DEV__) {
    return;
  }

  await AsyncStorage.removeItem(STORAGE_KEYS.devSubscriptionOverride);
}
