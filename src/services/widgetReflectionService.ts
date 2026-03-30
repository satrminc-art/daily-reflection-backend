import { ReflectionItem } from "@/types/reflection";
import { formatCalendarDate } from "@/utils/date";

export interface WidgetReflectionSnapshot {
  monthLabel: string;
  dayNumber: string;
  question: string;
}

export function buildWidgetReflectionSnapshot(
  reflection: ReflectionItem,
  locale = "en-US",
): WidgetReflectionSnapshot {
  const { monthLabel, dayNumber } = formatCalendarDate(reflection.date, locale);

  return {
    monthLabel,
    dayNumber,
    question: reflection.text,
  };
}
