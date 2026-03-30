import {
  CollectionItemRecord,
  CollectionRecord,
  NoteRecord,
  ReflectionRecord,
  SavedReflectionRecord,
  SubscriptionStatusRecord,
  UserRecord,
} from "../domain/entities";

export interface UserRepository {
  findById(userId: string): Promise<UserRecord | null>;
}

export interface ReflectionRepository {
  getTodayReflection(input: { dateKey: string; language: string }): Promise<ReflectionRecord | null>;
  getReflectionByDate(input: { dateKey: string; language: string }): Promise<ReflectionRecord | null>;
}

export interface CollectionRepository {
  listForUser(userId: string): Promise<CollectionRecord[]>;
  create(input: { userId: string; name: string }): Promise<CollectionRecord | null>;
  listItems(collectionId: string): Promise<CollectionItemRecord[]>;
}

export interface SavedReflectionRepository {
  listForUser(userId: string): Promise<SavedReflectionRecord[]>;
  upsert(input: {
    userId: string;
    reflectionId: string;
    dateKey: string;
    reflectionText: string;
    theme: string;
    tags: string[];
  }): Promise<SavedReflectionRecord | null>;
  remove(userId: string, id: string): Promise<boolean>;
}

export interface NoteRepository {
  listForUser(userId: string): Promise<NoteRecord[]>;
  create(input: { userId: string; reflectionId: string; content: string }): Promise<NoteRecord | null>;
  update(input: { userId: string; noteId: string; content: string }): Promise<NoteRecord | null>;
}

export interface SubscriptionRepository {
  getStatusForUser(userId: string): Promise<SubscriptionStatusRecord | null>;
  upsert(record: SubscriptionStatusRecord): Promise<SubscriptionStatusRecord | null>;
}
