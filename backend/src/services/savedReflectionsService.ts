import { SavedReflectionRecord } from "../domain/entities";

export function buildSavedReflectionRecord(input: {
  userId: string;
  reflectionId: string;
  dateKey: string;
  reflectionText: string;
  theme: string;
  tags: string[];
}): SavedReflectionRecord {
  const now = new Date().toISOString();
  return {
    id: `${input.userId}:${input.dateKey}:${input.reflectionId}`,
    userId: input.userId,
    reflectionId: input.reflectionId,
    dateKey: input.dateKey,
    reflectionText: input.reflectionText,
    theme: input.theme,
    tags: input.tags,
    createdAt: now,
    updatedAt: now,
  };
}
