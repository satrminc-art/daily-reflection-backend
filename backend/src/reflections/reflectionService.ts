import { ReflectionRecord } from "../domain/entities";

function getUtcDateKey(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export function getReflectionByDate(dateKey: string, language = "en"): ReflectionRecord | null {
  void dateKey;
  void language;
  return null;
}

export function getTodayReflection(language = "en", now = new Date()) {
  const dateKey = getUtcDateKey(now);
  return getReflectionByDate(dateKey, language);
}
