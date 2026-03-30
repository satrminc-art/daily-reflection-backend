import { supabaseRestRequest } from "@/lib/supabase";
import { AppAuthSession } from "@/types/auth";
import { SavedReflectionRecord, SavedReflectionUpsertInput } from "@/types/savedReflection";

export async function getSavedReflections(session: AppAuthSession): Promise<SavedReflectionRecord[]> {
  const rows = await supabaseRestRequest<SavedReflectionRecord[]>(
    `/saved_reflections?user_id=eq.${session.user.id}&select=id,user_id,reflection_id,date_key,reflection_text,theme,tags,created_at,updated_at&order=updated_at.desc`,
    "GET",
    { accessToken: session.accessToken },
  );

  return rows ?? [];
}

export async function saveReflection(session: AppAuthSession, reflection: SavedReflectionUpsertInput) {
  return supabaseRestRequest<SavedReflectionRecord[]>(
    "/saved_reflections",
    "POST",
    {
      accessToken: session.accessToken,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: [
        {
          user_id: reflection.userId,
          reflection_id: reflection.reflectionId,
          date_key: reflection.dateKey,
          reflection_text: reflection.reflectionText,
          theme: reflection.theme,
          tags: reflection.tags,
          updated_at: new Date().toISOString(),
        },
      ],
    },
  );
}

export async function removeSavedReflection(session: AppAuthSession, input: { reflectionId: string; dateKey: string }) {
  return supabaseRestRequest<unknown>(
    `/saved_reflections?user_id=eq.${session.user.id}&reflection_id=eq.${input.reflectionId}&date_key=eq.${input.dateKey}`,
    "DELETE",
    {
      accessToken: session.accessToken,
    },
  );
}

export async function mergeLocalSavedReflections(session: AppAuthSession, reflections: SavedReflectionUpsertInput[]) {
  if (!reflections.length) {
    return [];
  }

  return supabaseRestRequest<SavedReflectionRecord[]>(
    "/saved_reflections",
    "POST",
    {
      accessToken: session.accessToken,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: reflections.map((reflection) => ({
        user_id: reflection.userId,
        reflection_id: reflection.reflectionId,
        date_key: reflection.dateKey,
        reflection_text: reflection.reflectionText,
        theme: reflection.theme,
        tags: reflection.tags,
        updated_at: new Date().toISOString(),
      })),
    },
  );
}
