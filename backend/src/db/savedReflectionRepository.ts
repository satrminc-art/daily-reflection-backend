import { SavedReflectionRecord } from "../domain/entities";
import { supabaseAdminRequest } from "../lib/supabaseAdmin";

type SupabaseSavedReflectionRow = {
  id: string;
  user_id: string;
  reflection_id: string;
  date_key: string;
  reflection_text: string;
  theme: string;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
};

function mapSavedReflection(row: SupabaseSavedReflectionRow): SavedReflectionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    reflectionId: row.reflection_id,
    dateKey: row.date_key,
    reflectionText: row.reflection_text,
    theme: row.theme,
    tags: row.tags ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listSavedReflectionsByUser(userId: string): Promise<SavedReflectionRecord[]> {
  const rows = await supabaseAdminRequest<SupabaseSavedReflectionRow[]>(
    `/saved_reflections?user_id=eq.${userId}&select=id,user_id,reflection_id,date_key,reflection_text,theme,tags,created_at,updated_at&order=updated_at.desc`,
  );

  return rows?.map(mapSavedReflection) ?? [];
}

export async function upsertSavedReflection(input: {
  userId: string;
  reflectionId: string;
  dateKey: string;
  reflectionText: string;
  theme: string;
  tags: string[];
}) {
  const rows = await supabaseAdminRequest<SupabaseSavedReflectionRow[]>(
    "/saved_reflections?on_conflict=id",
    {
      method: "POST",
      body: [
        {
          id: `${input.userId}:${input.dateKey}:${input.reflectionId}`,
          user_id: input.userId,
          reflection_id: input.reflectionId,
          date_key: input.dateKey,
          reflection_text: input.reflectionText,
          theme: input.theme,
          tags: input.tags,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
    },
  );

  return rows?.[0] ? mapSavedReflection(rows[0]) : null;
}

export async function deleteSavedReflection(userId: string, recordId: string) {
  const response = await supabaseAdminRequest<unknown>(
    `/saved_reflections?id=eq.${recordId}&user_id=eq.${userId}`,
    {
      method: "DELETE",
    },
  );

  return response !== null;
}
