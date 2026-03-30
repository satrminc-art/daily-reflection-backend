import type { CurrentUserResponse } from "../types/api";
import { getProfileById } from "../db/profileRepository";
import { requireAuth } from "../middleware/auth";
import {
  jsonOk,
  methodNotAllowed,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../lib/http";

export default async function meRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<CurrentUserResponse> | ApiErrorResponse>,
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  const profile = await getProfileById(auth.userId);

  return jsonOk(res, {
    id: auth.userId,
    email: profile?.email ?? auth.email,
    displayName: profile?.displayName ?? null,
    appLanguage: profile?.appLanguage ?? null,
    reflectionLanguage: profile?.reflectionLanguage ?? null,
    timezone: profile?.timezone ?? null,
    notificationTime: profile?.notificationTime ?? null,
    subscriptionTier: profile?.subscriptionTier ?? "Freemium",
    createdAt: profile?.createdAt ?? new Date().toISOString(),
  });
}
