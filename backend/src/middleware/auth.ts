import { getServerEnv } from "../config/serverEnv";
import { getHeader, jsonError, type ApiRouteRequest, type ApiRouteResponse } from "../lib/http";

export interface AuthenticatedRequestContext {
  userId: string;
  email: string | null;
}

export async function getCurrentUserFromRequest(req: ApiRouteRequest): Promise<AuthenticatedRequestContext | null> {
  const env = getServerEnv();
  const authorization = getHeader(req, "authorization");

  if (!authorization || !authorization.startsWith("Bearer ") || !env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  const accessToken = authorization.slice("Bearer ".length).trim();
  const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: env.supabaseServiceRoleKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json().catch(() => null)) as { id?: string; email?: string | null } | null;
  if (!payload?.id) {
    return null;
  }

  return {
    userId: payload.id,
    email: payload.email ?? null,
  };
}

export async function requireAuth(
  req: ApiRouteRequest,
  res: ApiRouteResponse<any>,
): Promise<AuthenticatedRequestContext | null> {
  const auth = await getCurrentUserFromRequest(req);
  if (!auth) {
    jsonError(res, 401, "unauthorized", "Authentication is required for this endpoint.");
    return null;
  }

  return auth;
}
