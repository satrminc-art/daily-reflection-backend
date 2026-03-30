import * as Notifications from "expo-notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { getAppStrings, getFollowUpReminderBody, getFollowUpReminderTitle, getNotificationMessagePool } from "@/localization/strings";
import { NotificationPreference, SupportedLanguage } from "@/types/reflection";
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

const UPCOMING_NOTIFICATION_DAYS = 120;
const DEFAULT_ANDROID_CHANNEL_ID = "daily-reflection";
const SILENT_ANDROID_CHANNEL_ID = "daily-reflection-silent";
const DAILY_NOTIFICATION_CATEGORY_ID = "daily-reflection-entry";
const CUSTOM_NOTIFICATION_SOUND_NAME: string | null = null;

type NotificationTimeSegment = "morning" | "midday" | "evening";
type DailyReminderCopy = {
  title: string;
  body: string;
};

export interface NotificationContentOptions {
  title?: string;
  body?: string;
  userName?: string | null;
  language?: string | null;
}

export interface RescheduleNotificationOptions extends NotificationContentOptions {
  requestPermission?: boolean;
  notificationsEnabled?: boolean;
  soundEnabled?: boolean;
  silentMode?: boolean;
}

export interface ScheduledReminderBatch {
  reminderIds: string[];
  scheduledAt: string[];
}

export interface RescheduledNotificationResult {
  notificationIds: string[];
  nextMessage: string | null;
  nextDate: string | null;
  permissionGranted: boolean;
}

const DAILY_REMINDER_COPY: Record<string, DailyReminderCopy[]> = {
  de: [
    {
      title: "Deine Seite wartet.",
      body: "Nimm dir einen Moment.",
    },
    {
      title: "Ein stiller Moment.",
      body: "Heute wartet eine neue Seite auf dich.",
    },
    {
      title: "Zeit für deine Seite.",
      body: "Ein Gedanke für diesen Tag ist bereit.",
    },
  ],
  en: [
    {
      title: "Your page is waiting.",
      body: "Take a moment.",
    },
    {
      title: "A quiet moment.",
      body: "A new page is ready for today.",
    },
    {
      title: "Time for your page.",
      body: "A thought for this day is waiting.",
    },
  ],
  "pt-BR": [
    {
      title: "Sua página está esperando.",
      body: "Reserve um momento.",
    },
    {
      title: "Um momento de calma.",
      body: "Uma nova página está pronta para hoje.",
    },
    {
      title: "Hora da sua página.",
      body: "Um pensamento para este dia está esperando.",
    },
  ],
  fr: [
    {
      title: "Votre page vous attend.",
      body: "Prenez un moment.",
    },
    {
      title: "Un moment de calme.",
      body: "Une nouvelle page est prête pour aujourd'hui.",
    },
    {
      title: "L'heure de votre page.",
      body: "Une pensée pour ce jour vous attend.",
    },
  ],
  es: [
    {
      title: "Tu página te espera.",
      body: "Tómate un momento.",
    },
    {
      title: "Un momento de calma.",
      body: "Una nueva página está lista para hoy.",
    },
    {
      title: "Hora de tu página.",
      body: "Un pensamiento para este día te espera.",
    },
  ],
};

async function ensureNotificationChannel(language?: string | null): Promise<void> {
  const strings = getAppStrings(language);
  await Notifications.setNotificationCategoryAsync(DAILY_NOTIFICATION_CATEGORY_ID, []);

  if (Platform.OS !== "android") {
    return;
  }

  await Promise.all([
    Notifications.setNotificationChannelAsync(DEFAULT_ANDROID_CHANNEL_ID, {
      name: strings.reflectionTitle(),
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 180],
      lightColor: "#A18166",
      sound: CUSTOM_NOTIFICATION_SOUND_NAME ?? "default",
    }),
    Notifications.setNotificationChannelAsync(SILENT_ANDROID_CHANNEL_ID, {
      name: `${strings.reflectionTitle()} ${strings.t("settings.silentMode")}`,
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0],
      lightColor: "#A18166",
    }),
  ]);
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

function padNumber(value: number): string {
  return `${value}`.padStart(2, "0");
}

function formatDateKey(date: Date): string {
  return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
}

function addDays(date: Date, days: number): Date {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getHash(input: string): number {
  let hash = 0;
  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 31 + input.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function resolveReminderCopyLanguage(language?: string | null): keyof typeof DAILY_REMINDER_COPY {
  if (language === "de" || language === "pt-BR" || language === "fr" || language === "es") {
    return language;
  }

  return "en";
}

function getDailyReminderVariantIndex(preference: NotificationPreference, language?: string | null): number {
  const pool = DAILY_REMINDER_COPY[resolveReminderCopyLanguage(language)];
  return getHash(`${language ?? "en"}:${preference.hour}:${preference.minute}`) % pool.length;
}

function getNextReminderDate(preference: NotificationPreference, now = new Date()): Date {
  const nextDate = new Date(now);
  nextDate.setHours(preference.hour, preference.minute, 0, 0);

  if (nextDate.getTime() <= now.getTime()) {
    nextDate.setDate(nextDate.getDate() + 1);
  }

  return nextDate;
}

export function getLocalizedReminderCopy(
  language: SupportedLanguage | null | undefined,
  variantIndex = 0,
): DailyReminderCopy {
  const pool = DAILY_REMINDER_COPY[resolveReminderCopyLanguage(language)];
  return pool[variantIndex % pool.length] ?? pool[0];
}

export function getNotificationTimeSegment(preference: NotificationPreference): NotificationTimeSegment {
  const minutes = preference.hour * 60 + preference.minute;
  if (minutes >= 17 * 60) {
    return "evening";
  }
  if (minutes >= 11 * 60) {
    return "midday";
  }
  return "morning";
}

export function getContextualNotificationMessage(
  preference: NotificationPreference,
  date: Date,
  previousMessage?: string | null,
  language?: string | null,
): string {
  const segment = getNotificationTimeSegment(preference);
  const pool = getNotificationMessagePool(language, segment);
  const eligiblePool =
    previousMessage && pool.length > 1 ? pool.filter((message) => message !== previousMessage) : [...pool];
  const dateKey = formatDateKey(date);
  const selectedIndex = getHash(`${dateKey}:${preference.hour}:${preference.minute}:${segment}`) % eligiblePool.length;
  return eligiblePool[selectedIndex] ?? pool[0];
}

function resolveNotificationSound(options?: Pick<RescheduleNotificationOptions, "soundEnabled" | "silentMode">): string | null {
  if (options?.silentMode || options?.soundEnabled === false) {
    return null;
  }

  return CUSTOM_NOTIFICATION_SOUND_NAME ?? "default";
}

function resolveAndroidChannelId(options?: Pick<RescheduleNotificationOptions, "soundEnabled" | "silentMode">): string {
  return options?.silentMode || options?.soundEnabled === false
    ? SILENT_ANDROID_CHANNEL_ID
    : DEFAULT_ANDROID_CHANNEL_ID;
}

function buildNotificationDates(
  preference: NotificationPreference,
  daysAhead = UPCOMING_NOTIFICATION_DAYS,
  now = new Date(),
): Date[] {
  const scheduledDates: Date[] = [];

  for (let offset = 0; offset < daysAhead; offset += 1) {
    const date = addDays(now, offset);
    date.setHours(preference.hour, preference.minute, 0, 0);
    if (date.getTime() <= now.getTime()) {
      continue;
    }
    scheduledDates.push(date);
  }

  return scheduledDates;
}

async function clearStoredNotificationSchedule(): Promise<void> {
  const [existingId, storedScheduleIds] = await Promise.all([
    AsyncStorage.getItem(STORAGE_KEYS.notificationId),
    AsyncStorage.getItem(STORAGE_KEYS.notificationScheduleIds),
  ]);

  let scheduleIds: string[] = [];
  if (storedScheduleIds) {
    try {
      scheduleIds = (JSON.parse(storedScheduleIds) as string[]) ?? [];
    } catch (error) {
      console.warn("Failed to parse stored notification schedule ids", error);
    }
  }
  const idsToCancel = Array.from(new Set([existingId, ...scheduleIds].filter((value): value is string => Boolean(value))));

  if (idsToCancel.length > 0) {
    await cancelNotificationIds(idsToCancel);
  }

  await Promise.all([
    AsyncStorage.removeItem(STORAGE_KEYS.notificationId),
    AsyncStorage.removeItem(STORAGE_KEYS.notificationScheduleIds),
  ]);
}

export function buildDailyNotificationContent(
  preference: NotificationPreference,
  options?: RescheduleNotificationOptions,
  previousMessage?: string | null,
  date = new Date(),
) {
  const variantIndex = getDailyReminderVariantIndex(preference, options?.language);
  const localizedCopy = getLocalizedReminderCopy(options?.language, variantIndex);
  return {
    title: options?.title ?? localizedCopy.title,
    body: options?.body ?? localizedCopy.body,
  };
}

export async function rescheduleDailyNotification(
  preference: NotificationPreference,
  options?: RescheduleNotificationOptions,
): Promise<RescheduledNotificationResult> {
  if (options?.notificationsEnabled === false) {
    await clearStoredNotificationSchedule();
    return { notificationIds: [], nextMessage: null, nextDate: null, permissionGranted: false };
  }

  if (options?.requestPermission) {
    const hasPermission = await requestNotificationPermission();
    if (!hasPermission) {
      await clearStoredNotificationSchedule();
      return { notificationIds: [], nextMessage: null, nextDate: null, permissionGranted: false };
    }
  } else {
    const hasPermission = await hasNotificationPermission();
    if (!hasPermission) {
      await clearStoredNotificationSchedule();
      return { notificationIds: [], nextMessage: null, nextDate: null, permissionGranted: false };
    }
  }

  await ensureNotificationChannel(options?.language);

  await clearStoredNotificationSchedule();

  const nextReminderDate = getNextReminderDate(preference);
  const content = buildDailyNotificationContent(preference, options, null, nextReminderDate);
  const dateKey = formatDateKey(nextReminderDate);
  const segment = getNotificationTimeSegment(preference);

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: content.title,
      body: content.body,
      sound: resolveNotificationSound(options) ?? undefined,
      categoryIdentifier: DAILY_NOTIFICATION_CATEGORY_ID,
      data: {
        source: "daily-reflection",
        dateKey,
        segment,
        language: options?.language ?? "en",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: preference.hour,
      minute: preference.minute,
      repeats: true,
      channelId: Platform.OS === "android" ? resolveAndroidChannelId(options) : undefined,
    },
  });

  const notificationIds = [notificationId];
  await Promise.all([
    AsyncStorage.setItem(STORAGE_KEYS.notificationScheduleIds, JSON.stringify(notificationIds)),
    notificationId
      ? AsyncStorage.setItem(STORAGE_KEYS.notificationId, notificationId)
      : AsyncStorage.removeItem(STORAGE_KEYS.notificationId),
  ]);

  return {
    notificationIds,
    nextMessage: content.body,
    nextDate: dateKey,
    permissionGranted: true,
  };
}

export async function clearScheduledNotification(): Promise<void> {
  await clearStoredNotificationSchedule();
}

export async function cancelNotificationIds(notificationIds: string[]): Promise<void> {
  await Promise.all(
    notificationIds.map(async (notificationId) => {
      try {
        await Notifications.cancelScheduledNotificationAsync(notificationId);
      } catch (error) {
        console.warn("Failed to cancel scheduled notification", error);
      }
    }),
  );
}

export function buildFollowUpReminderMoments(
  dateKey: string,
  preference: NotificationPreference,
  now = new Date(),
): Date[] {
  const baseDate = new Date(`${dateKey}T12:00:00`);
  const firstFollowUp = new Date(baseDate);
  firstFollowUp.setHours(preference.hour + 3, preference.minute, 0, 0);

  const eveningFollowUp = new Date(baseDate);
  eveningFollowUp.setHours(19, 30, 0, 0);

  return [firstFollowUp, eveningFollowUp]
    .filter((entry) => entry.getTime() > now.getTime())
    .filter((entry, index, array) => array.findIndex((candidate) => candidate.getTime() === entry.getTime()) === index)
    .slice(0, 2);
}

export async function scheduleFollowUpRemindersForDay(
  dateKey: string,
  preference: NotificationPreference,
  options?: RescheduleNotificationOptions,
): Promise<ScheduledReminderBatch> {
  if (options?.notificationsEnabled === false) {
    return { reminderIds: [], scheduledAt: [] };
  }

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return { reminderIds: [], scheduledAt: [] };
  }

  await ensureNotificationChannel(options?.language);

  const moments = buildFollowUpReminderMoments(dateKey, preference);
  const scheduled = await Promise.all(
    moments.map(async (moment, index) => {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: options?.title ?? getFollowUpReminderTitle(options?.language, options?.userName),
          body:
            index === 0
              ? options?.body ?? getFollowUpReminderBody(options?.language, "first")
              : options?.body ?? getFollowUpReminderBody(options?.language, "final"),
          sound: resolveNotificationSound(options) ?? undefined,
          categoryIdentifier: DAILY_NOTIFICATION_CATEGORY_ID,
          data: {
            source: "daily-reflection-follow-up",
            dateKey,
            segment: getNotificationTimeSegment(preference),
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: moment,
          channelId: Platform.OS === "android" ? resolveAndroidChannelId(options) : undefined,
        },
      });

      return {
        notificationId,
        scheduledAt: moment.toISOString(),
      };
    }),
  );

  return {
    reminderIds: scheduled.map((entry) => entry.notificationId),
    scheduledAt: scheduled.map((entry) => entry.scheduledAt),
  };
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
      sound: CUSTOM_NOTIFICATION_SOUND_NAME ?? "default",
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

export async function scheduleFreemiumUpgradeReminder(
  preference: NotificationPreference,
  options: NotificationContentOptions &
    Pick<RescheduleNotificationOptions, "notificationsEnabled" | "soundEnabled" | "silentMode"> & {
      daysFromNow?: number;
    },
): Promise<boolean> {
  if (options.notificationsEnabled === false) {
    return false;
  }

  const hasPermission = await hasNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await ensureNotificationChannel(options.language);

  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.freemiumUpgradeNotificationId);
  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch (error) {
      console.warn("Failed to cancel existing freemium upgrade reminder", error);
    }
  }

  const targetDate = addDays(new Date(), options.daysFromNow ?? 7);
  targetDate.setHours(preference.hour, preference.minute, 0, 0);

  if (targetDate.getTime() <= Date.now()) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: options.title ?? "Keep what matters.",
      body: options.body ?? "Some pages are worth keeping. Premium lets them stay with you.",
      sound: resolveNotificationSound(options) ?? undefined,
      categoryIdentifier: DAILY_NOTIFICATION_CATEGORY_ID,
      data: {
        source: "freemium-upgrade-reminder",
      },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: targetDate,
      channelId: Platform.OS === "android" ? resolveAndroidChannelId(options) : undefined,
    },
  });

  await AsyncStorage.setItem(STORAGE_KEYS.freemiumUpgradeNotificationId, notificationId);
  return true;
}

export async function clearFreemiumUpgradeReminder(): Promise<void> {
  const existingId = await AsyncStorage.getItem(STORAGE_KEYS.freemiumUpgradeNotificationId);
  if (existingId) {
    try {
      await Notifications.cancelScheduledNotificationAsync(existingId);
    } catch (error) {
      console.warn("Failed to clear freemium upgrade reminder", error);
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.freemiumUpgradeNotificationId);
  }
}
