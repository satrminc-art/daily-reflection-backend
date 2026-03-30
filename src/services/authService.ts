import { supabaseAuthRequest, supabaseRestRequest, isSessionExpired } from "@/lib/supabase";
import { clearSessionTokens, loadSessionTokens, saveSessionTokens } from "@/services/auth/sessionStorage";
import { AppAuthSession } from "@/types/auth";
import { UserProfile } from "@/types/profile";

type SupabaseAuthResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  user: {
    id: string;
    email?: string | null;
  };
};

function mapSupabaseSession(payload: SupabaseAuthResponse | null): AppAuthSession | null {
  if (!payload?.access_token || !payload?.refresh_token || !payload.user?.id) {
    return null;
  }

  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresAt: new Date(Date.now() + payload.expires_in * 1000).toISOString(),
    user: {
      id: payload.user.id,
      email: payload.user.email ?? null,
    },
  };
}

export async function signInWithPassword(email: string, password: string) {
  const payload = await supabaseAuthRequest<SupabaseAuthResponse>("/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const session = mapSupabaseSession(payload);
  if (session) {
    await saveSessionTokens(session);
  }
  return session;
}

export async function signInWithMagicLink(email: string) {
  return supabaseAuthRequest<{ sent: boolean }>("/otp", {
    method: "POST",
    body: JSON.stringify({
      email,
      create_user: true,
    }),
  });
}

export async function refreshSupabaseSession(refreshToken: string) {
  const payload = await supabaseAuthRequest<SupabaseAuthResponse>("/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  const session = mapSupabaseSession(payload);
  if (session) {
    await saveSessionTokens(session);
  }
  return session;
}

export async function getCurrentSession(): Promise<AppAuthSession | null> {
  const stored = await loadSessionTokens();
  if (!stored.accessToken || !stored.refreshToken || !stored.expiresAt || !stored.userId) {
    return null;
  }

  const session: AppAuthSession = {
    accessToken: stored.accessToken,
    refreshToken: stored.refreshToken,
    expiresAt: stored.expiresAt,
    user: {
      id: stored.userId,
      email: stored.userEmail ?? null,
    },
  };

  if (!isSessionExpired(session)) {
    return session;
  }

  return refreshSupabaseSession(stored.refreshToken);
}

export async function signOutUser() {
  await clearSessionTokens();
}

export async function fetchCurrentProfile(session: AppAuthSession): Promise<UserProfile | null> {
  const rows = await supabaseRestRequest<Array<Record<string, unknown>>>(
    `/profiles?id=eq.${session.user.id}&select=id,email,display_name,app_language,reflection_language,timezone,notification_time,subscription_tier,created_at,updated_at&limit=1`,
    "GET",
    {
      accessToken: session.accessToken,
    },
  );

  const profile = rows?.[0];
  if (!profile) {
    return null;
  }

  return {
    id: String(profile.id),
    email: (profile.email as string | null | undefined) ?? session.user.email,
    displayName: (profile.display_name as string | null | undefined) ?? null,
    appLanguage: (profile.app_language as string | null | undefined) ?? null,
    reflectionLanguage: (profile.reflection_language as string | null | undefined) ?? null,
    timezone: (profile.timezone as string | null | undefined) ?? null,
    notificationTime: (profile.notification_time as string | null | undefined) ?? null,
    subscriptionTier: ((profile.subscription_tier as string | null | undefined) ?? "Freemium") as UserProfile["subscriptionTier"],
    createdAt: (profile.created_at as string | null | undefined) ?? null,
    updatedAt: (profile.updated_at as string | null | undefined) ?? null,
  };
}

export async function upsertCurrentProfile(
  session: AppAuthSession,
  input: {
    displayName: string | null;
    appLanguage: string | null;
    reflectionLanguage: string | null;
    timezone: string | null;
    notificationTime: string | null;
    subscriptionTier: string;
  },
) {
  return supabaseRestRequest<UserProfile[]>(
    "/profiles",
    "POST",
    {
      accessToken: session.accessToken,
      headers: {
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: [
        {
          id: session.user.id,
          email: session.user.email,
          display_name: input.displayName,
          app_language: input.appLanguage,
          reflection_language: input.reflectionLanguage,
          timezone: input.timezone,
          notification_time: input.notificationTime,
          subscription_tier: input.subscriptionTier,
          updated_at: new Date().toISOString(),
        },
      ],
    },
  );
}
