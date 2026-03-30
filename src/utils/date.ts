import { resolveLocale } from "@/localization/languages";
import { SupportedLanguage } from "@/types/reflection";

export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalISODate(date = new Date()): string {
  return toISODate(date);
}

export function getTodayKey(now = new Date()): string {
  return getLocalISODate(now);
}

export function hasDayChanged(previousKey: string | null | undefined, nextKey: string): boolean {
  if (!previousKey) {
    return true;
  }

  return previousKey !== nextKey;
}

export function getAdjacentISODate(dateString: string, dayOffset: number): string {
  const date = new Date(`${dateString}T12:00:00`);
  date.setDate(date.getDate() + dayOffset);
  return toISODate(date);
}

export function getReflectionActivationDateKey(
  preference: { hour: number; minute: number },
  now = new Date(),
): string {
  const today = toISODate(now);
  const activationDate = new Date(now);
  activationDate.setHours(preference.hour, preference.minute, 0, 0);

  if (now.getTime() >= activationDate.getTime()) {
    return today;
  }

  return getAdjacentISODate(today, -1);
}

export function getReflectionActivationTimestamp(
  dateKey: string,
  preference: { hour: number; minute: number },
): string {
  const activationDate = new Date(`${dateKey}T12:00:00`);
  activationDate.setHours(preference.hour, preference.minute, 0, 0);
  return activationDate.toISOString();
}

type LocalizedDateVariant = "long" | "calendar" | "time" | "relative";

function resolveDateLocale(languageOrLocale?: SupportedLanguage | string | null): string {
  if (!languageOrLocale) {
    return "en-US";
  }

  return resolveLocale(languageOrLocale as SupportedLanguage);
}

export function formatLocalizedDate(
  dateValue: string | Date,
  languageOrLocale: SupportedLanguage | string | null | undefined,
  variant: "long",
): string;
export function formatLocalizedDate(
  dateValue: string | Date,
  languageOrLocale: SupportedLanguage | string | null | undefined,
  variant: "calendar",
): { dayNumber: string; monthLabel: string; weekdayLabel: string };
export function formatLocalizedDate(
  dateValue: string | Date,
  languageOrLocale: SupportedLanguage | string | null | undefined,
  variant: "time",
): string;
export function formatLocalizedDate(
  dateValue: string | Date,
  languageOrLocale: SupportedLanguage | string | null | undefined,
  variant: "relative",
): { days: number; label: string };
export function formatLocalizedDate(
  dateValue: string | Date,
  languageOrLocale: SupportedLanguage | string | null | undefined,
  variant: LocalizedDateVariant,
) {
  const locale = resolveDateLocale(languageOrLocale);

  if (variant === "time") {
    const date = dateValue instanceof Date ? new Date(dateValue) : new Date();
    if (!(dateValue instanceof Date)) {
      const [hour = "0", minute = "0"] = String(dateValue).split(":");
      date.setHours(Number(hour), Number(minute), 0, 0);
    }

    return new Intl.DateTimeFormat(locale, {
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  }

  if (variant === "relative") {
    const target = dateValue instanceof Date ? dateValue : new Date(dateValue);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (typeof Intl === "undefined" || typeof Intl.RelativeTimeFormat !== "function") {
      return {
        days,
        label: formatRelativeDaysFallback(days, locale),
      };
    }

    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    return {
      days,
      label: formatter.format(days, "day"),
    };
  }

  const isoDate = dateValue instanceof Date ? dateValue : new Date(`${dateValue}T12:00:00`);

  if (variant === "calendar") {
    return {
      dayNumber: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(isoDate),
      monthLabel: new Intl.DateTimeFormat(locale, { month: "long" }).format(isoDate),
      weekdayLabel: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(isoDate),
    };
  }

  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(isoDate);
}

export function formatLongDate(dateString: string, locale = "en-US"): string {
  return formatLocalizedDate(dateString, locale, "long");
}

export function formatCalendarDate(
  dateString: string,
  locale = "en-US",
): {
  dayNumber: string;
  monthLabel: string;
  weekdayLabel: string;
} {
  return formatLocalizedDate(dateString, locale, "calendar");
}

export function toLocaleDisplayUppercase(
  value: string,
  languageOrLocale: SupportedLanguage | string | null | undefined,
): string {
  return value.toLocaleUpperCase(resolveDateLocale(languageOrLocale));
}

export function getDisplayDatePartsForAppLanguage(
  dateString: string,
  languageOrLocale: SupportedLanguage | string | null | undefined,
): {
  dayNumber: string;
  monthLabel: string;
  weekdayLabel: string;
  monthDisplayLabel: string;
  weekdayDisplayLabel: string;
} {
  const formatted = formatCalendarDate(dateString, resolveDateLocale(languageOrLocale));

  return {
    ...formatted,
    monthDisplayLabel: toLocaleDisplayUppercase(formatted.monthLabel, languageOrLocale),
    weekdayDisplayLabel: toLocaleDisplayUppercase(formatted.weekdayLabel, languageOrLocale),
  };
}

export function getLocalizedWeekday(
  dateString: string,
  locale = "en-US",
): string {
  return formatCalendarDate(dateString, locale).weekdayLabel;
}

export function getLocalizedMonth(
  dateString: string,
  locale = "en-US",
): string {
  return formatCalendarDate(dateString, locale).monthLabel;
}

export function formatTimeLabel(hour: number, minute: number, locale = "en-US"): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return formatLocalizedDate(date, locale, "time");
}

export function formatRelativeDaysFromNow(
  dateString: string,
  locale = "en-US",
): { days: number; label: string } {
  return formatLocalizedDate(dateString, locale, "relative");
}

function formatRelativeDaysFallback(days: number, locale = "en-US") {
  const language = locale.toLowerCase();

  if (language.startsWith("de")) {
    if (days === 0) {
      return "Heute";
    }
    if (days < 0) {
      return `vor ${Math.abs(days)} Tagen`;
    }
    return `in ${days} Tagen`;
  }

  if (language.startsWith("pt")) {
    if (days === 0) {
      return "Hoje";
    }
    if (days < 0) {
      return `há ${Math.abs(days)} dias`;
    }
    return `em ${days} dias`;
  }

  if (days === 0) {
    return "Today";
  }
  if (days < 0) {
    return `${Math.abs(days)} days ago`;
  }
  return `in ${days} days`;
}
