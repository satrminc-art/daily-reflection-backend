import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { NotificationPreference } from "@/types/reflection";
import { STORAGE_KEYS } from "@/storage/keys";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const messages = [
  "Your reflection for today is ready.",
  "A quiet question is waiting for you.",
  "Take a gentle minute with today’s reflection.",
];

export interface NotificationContentOptions {
  title?: string;
  body?: string;
  userName?: string | null;
}

export interface RescheduleNotificationOptions extends NotificationContentOptions {
  requestPermission?: boolean;
}

async function ensureNotificationChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("daily-reflection", {
    name: "Daily Reflection",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 180],
    lightColor: "#A18166",
    sound: "default",
  });
}

export async function hasNotificationPermission(): Promise<boolean> {
  const permissions = await Notifications.getPermissionsAsync();
  return (
    permissions.granted ||
    permissions.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
}

export async function requestNotificationPermission(): Promise<boolean> {
  const alreadyGranted = await hasNotificationPermission();
  if (alreadyGranted) {
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function buildDailyNotificationContent(
  preference: NotificationPreference,
  options?: NotificationContentOptions,
) {
  const fallbackTitle = options?.userName ? `Your page is ready, ${options.userName}.` : "Your page is ready";
  return {
    title: options?.title ?? fallbackTitle,
    body: options?.body ?? messages[(preference.hour + preference.minute) % messages.length],
  };
}

export async function rescheduleDailyNotification(
  preference: NotificationPreference,
  options?: RescheduleNotificationOptions,
): Promise<void> {
  if (options?.requestPermission) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      return;
    }
  } else {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      return;
    }
  }

  await ensureNotificationChannel();

  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.notificationId);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
  }

  const content = buildDailyNotificationContent(preference, options);
  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: preference.hour,
      minute: preference.minute,
    },
  });

  await AsyncStorage.setItem(STORAGE_KEYS.notificationId, notificationId);
}

export async function clearScheduledNotification(): Promise<void> {
  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.notificationId);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(STORAGE_KEYS.notificationId);
  }
}

export async function scheduleYearEndPremiumReminder(
  options: NotificationContentOptions,
): Promise<void> {
  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return;
  }

  await ensureNotificationChannel();

  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.premiumYearEndNotificationId);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title ?? "Your saved pages are worth keeping.",
      body: options.body ?? "Take a quiet minute to back up your saved reflections.",
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      month: 12,
      day: 31,
      hour: 18,
      minute: 0,
      repeats: true,
    },
  });

  await AsyncStorage.setItem(STORAGE_KEYS.premiumYearEndNotificationId, notificationId);
}

export async function clearYearEndPremiumReminder(): Promise<void> {
  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.premiumYearEndNotificationId);
  if (existingId) {
    await Notifications.cancelScheduledNotificationAsync(existingId);
    await AsyncStorage.removeItem(STORAGE_KEYS.premiumYearEndNotificationId);
  }
}
