import { getServerEnv } from "../config/serverEnv";

function buildHeaders() {
  const env = getServerEnv();
  if (!env.supabaseServiceRoleKey) {
    return null;
  }

  return {
    apikey: env.supabaseServiceRoleKey,
    Authorization: `Bearer ${env.supabaseServiceRoleKey}`,
  };
}

export function isSupabaseAdminConfigured() {
  const env = getServerEnv();
  return Boolean(env.supabaseUrl && env.supabaseServiceRoleKey);
}

export async function supabaseAdminRequest<TResponse>(
  path: string,
  options?: { method?: "GET" | "POST" | "PATCH" | "DELETE"; body?: unknown },
): Promise<TResponse | null> {
  const env = getServerEnv();
  const headers = buildHeaders();

  if (!env.supabaseUrl || !headers) {
    return null;
  }

  const response = await fetch(`${env.supabaseUrl}/rest/v1${path}`, {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options?.method && options.method !== "GET" ? { Prefer: "return=representation" } : undefined),
      ...headers,
    },
    body: options?.body === undefined ? undefined : JSON.stringify(options.body),
  });

  if (!response.ok) {
    return null;
  }

  return response.json().catch(() => null);
}
