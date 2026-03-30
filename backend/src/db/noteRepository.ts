import { NoteRecord } from "../domain/entities";
import { supabaseAdminRequest } from "../lib/supabaseAdmin";

type SupabaseNoteRow = {
  id: string;
  user_id: string;
  reflection_id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

function mapNote(row: SupabaseNoteRow): NoteRecord {
  return {
    id: row.id,
    userId: row.user_id,
    reflectionId: row.reflection_id,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createNote(input: {
  userId: string;
  reflectionId: string;
  content: string;
}): Promise<NoteRecord | null> {
  const timestamp = new Date().toISOString();
  const rows = await supabaseAdminRequest<SupabaseNoteRow[]>("/notes", {
    method: "POST",
    body: [
      {
        user_id: input.userId,
        reflection_id: input.reflectionId,
        content: input.content,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
  });

  return rows?.[0] ? mapNote(rows[0]) : null;
}

export async function updateNote(input: {
  userId: string;
  noteId: string;
  content: string;
}): Promise<NoteRecord | null> {
  const rows = await supabaseAdminRequest<SupabaseNoteRow[]>(
    `/notes?id=eq.${input.noteId}&user_id=eq.${input.userId}`,
    {
      method: "PATCH",
      body: {
        content: input.content,
        updated_at: new Date().toISOString(),
      },
    },
  );

  return rows?.[0] ? mapNote(rows[0]) : null;
}
