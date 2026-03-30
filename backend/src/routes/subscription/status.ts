import type { SubscriptionStatusResponse } from "../../types/api";
import { normalizeSubscriptionStatus } from "../../billing/subscriptionService";
import { getSubscriptionStatusForUser } from "../../db/subscriptionRepository";
import { requireAuth } from "../../middleware/auth";
import {
  jsonOk,
  methodNotAllowed,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

export default async function subscriptionStatusRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<SubscriptionStatusResponse> | ApiErrorResponse>,
) {
  if (req.method !== "GET") {
    return methodNotAllowed(res, ["GET"]);
  }

  const auth = await requireAuth(req, res);
  if (!auth) {
    return;
  }

  const record = await getSubscriptionStatusForUser(auth.userId);
  return jsonOk(res, normalizeSubscriptionStatus(record));
}
