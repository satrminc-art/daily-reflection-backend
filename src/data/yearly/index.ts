import { YEARLY_REFLECTIONS_2026 } from "@/data/yearly/reflections-2026";
import { ManualReflectionEntry } from "@/types/reflection";

export const YEARLY_REFLECTION_FILES: Record<number, readonly ManualReflectionEntry[]> = {
  2026: YEARLY_REFLECTIONS_2026,
};

export const YEARLY_REFLECTIONS = Object.values(YEARLY_REFLECTION_FILES).flat();

export const YEARLY_REFLECTIONS_BY_DATE = new Map(
  YEARLY_REFLECTIONS.map((entry) => [entry.date, entry]),
);

export const YEARLY_REFLECTIONS_BY_ID = new Map(
  YEARLY_REFLECTIONS.map((entry) => [entry.id, entry]),
);
