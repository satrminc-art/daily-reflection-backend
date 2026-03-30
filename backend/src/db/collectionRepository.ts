import { CollectionRecord } from "../domain/entities";
import { supabaseAdminRequest } from "../lib/supabaseAdmin";

type SupabaseCollectionRow = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

function mapCollection(row: SupabaseCollectionRow): CollectionRecord {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listCollectionsByUser(userId: string): Promise<CollectionRecord[]> {
  const rows = await supabaseAdminRequest<SupabaseCollectionRow[]>(
    `/collections?user_id=eq.${userId}&select=id,user_id,name,created_at,updated_at&order=updated_at.desc`,
  );

  return rows?.map(mapCollection) ?? [];
}

export async function createCollection(input: { userId: string; name: string }): Promise<CollectionRecord | null> {
  const timestamp = new Date().toISOString();
  const rows = await supabaseAdminRequest<SupabaseCollectionRow[]>("/collections", {
    method: "POST",
    body: [
      {
        user_id: input.userId,
        name: input.name,
        created_at: timestamp,
        updated_at: timestamp,
      },
    ],
  });

  return rows?.[0] ? mapCollection(rows[0]) : null;
}
