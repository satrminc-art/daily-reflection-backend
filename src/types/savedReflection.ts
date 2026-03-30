export interface SavedReflectionRecord {
  id?: string;
  userId: string;
  reflectionId: string;
  dateKey: string;
  reflectionText: string;
  theme: string;
  tags: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface SavedReflectionUpsertInput {
  userId: string;
  reflectionId: string;
  dateKey: string;
  reflectionText: string;
  theme: string;
  tags: string[];
}
