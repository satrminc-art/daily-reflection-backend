export function toISODate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalISODate(date = new Date()): string {
  return toISODate(date);
}

export function formatLongDate(dateString: string, locale = "en-US"): string {
  const date = new Date(`${dateString}T12:00:00`);
  return new Intl.DateTimeFormat(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatCalendarDate(
  dateString: string,
  locale = "en-US",
): {
  dayNumber: string;
  monthLabel: string;
  weekdayLabel: string;
} {
  const date = new Date(`${dateString}T12:00:00`);
  return {
    dayNumber: new Intl.DateTimeFormat(locale, { day: "2-digit" }).format(date),
    monthLabel: new Intl.DateTimeFormat(locale, { month: "long" }).format(date),
    weekdayLabel: new Intl.DateTimeFormat(locale, { weekday: "long" }).format(date),
  };
}

export function formatTimeLabel(hour: number, minute: number, locale = "en-US"): string {
  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
