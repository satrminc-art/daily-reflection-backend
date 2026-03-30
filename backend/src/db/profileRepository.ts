import { UserRecord } from "../domain/entities";
import { supabaseAdminRequest } from "../lib/supabaseAdmin";

type SupabaseProfileRow = {
  id: string;
  email: string | null;
  display_name: string | null;
  app_language: string | null;
  reflection_language: string | null;
  timezone: string | null;
  notification_time: string | null;
  subscription_tier: "Freemium" | "Premium" | "Lifelong" | null;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: SupabaseProfileRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    appLanguage: row.app_language,
    reflectionLanguage: row.reflection_language,
    timezone: row.timezone,
    notificationTime: row.notification_time,
    subscriptionTier: row.subscription_tier ?? "Freemium",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfileById(userId: string): Promise<UserRecord | null> {
  const rows = await supabaseAdminRequest<SupabaseProfileRow[]>(
    `/profiles?id=eq.${userId}&select=id,email,display_name,app_language,reflection_language,timezone,notification_time,subscription_tier,created_at,updated_at&limit=1`,
  );

  if (!rows?.[0]) {
    return null;
  }

  return mapProfile(rows[0]);
}
