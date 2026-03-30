import { isSupabaseConfigured, publicEnv } from "@/config/env";
import { AppAuthSession } from "@/types/auth";

type SupabaseRestMethod = "GET" | "POST" | "PATCH" | "DELETE";

function buildHeaders(accessToken?: string | null, extra?: Record<string, string>) {
  return {
    apikey: publicEnv.supabaseAnonKey,
    Authorization: `Bearer ${accessToken ?? publicEnv.supabaseAnonKey}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

function buildUrl(path: string) {
  return `${publicEnv.supabaseUrl}${path}`;
}

async function parseJson<T>(response: Response): Promise<T | null> {
  return response.json().catch(() => null);
}

export async function supabaseAuthRequest<TResponse>(
  path: string,
  init?: RequestInit,
): Promise<TResponse | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(buildUrl(`/auth/v1${path}`), {
    ...init,
    headers: {
      ...buildHeaders(undefined, {
        apikey: publicEnv.supabaseAnonKey,
      }),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    return null;
  }

  return parseJson<TResponse>(response);
}

export async function supabaseRestRequest<TResponse>(
  path: string,
  method: SupabaseRestMethod,
  options?: {
    accessToken?: string | null;
    body?: unknown;
    headers?: Record<string, string>;
  },
): Promise<TResponse | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const response = await fetch(buildUrl(`/rest/v1${path}`), {
    method,
    headers: buildHeaders(options?.accessToken, options?.headers),
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    return null;
  }

  return parseJson<TResponse>(response);
}

export function isSessionExpired(session: AppAuthSession | null) {
  if (!session) {
    return true;
  }

  const expiresAt = new Date(session.expiresAt).getTime();
  if (Number.isNaN(expiresAt)) {
    return true;
  }

  return expiresAt <= Date.now() + 60_000;
}
