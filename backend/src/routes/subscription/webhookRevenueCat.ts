import { mapRevenueCatWebhookToSubscription, validateRevenueCatWebhookPayload, verifyRevenueCatWebhookRequest } from "../../billing/revenuecatWebhook";
import { upsertSubscriptionStatus } from "../../db/subscriptionRepository";
import { trackBackendEvent } from "../../lib/analytics";
import { captureBackendError } from "../../lib/monitoring";
import {
  jsonError,
  jsonOk,
  methodNotAllowed,
  parseJsonBody,
  type ApiErrorResponse,
  type ApiResponse,
  type ApiRouteRequest,
  type ApiRouteResponse,
} from "../../lib/http";

export default async function revenueCatWebhookRoute(
  req: ApiRouteRequest,
  res: ApiRouteResponse<ApiResponse<{ received: true; userId: string | null; tier: string | null }> | ApiErrorResponse>,
) {
  if (req.method !== "POST") {
    return methodNotAllowed(res, ["POST"]);
  }

  if (!verifyRevenueCatWebhookRequest(req)) {
    return jsonError(res, 401, "invalid_webhook_signature", "The RevenueCat webhook signature could not be verified.");
  }

  const payload = parseJsonBody(req.body);
  if (!validateRevenueCatWebhookPayload(payload)) {
    return jsonError(res, 400, "invalid_webhook_payload", "The RevenueCat webhook payload is missing required fields.");
  }

  const subscriptionRecord = mapRevenueCatWebhookToSubscription(payload);
  if (!subscriptionRecord) {
    return jsonError(res, 400, "unmapped_user", "The RevenueCat event could not be linked to a user.");
  }

  try {
    await upsertSubscriptionStatus(subscriptionRecord);
    trackBackendEvent("revenuecat_webhook_processed", {
      type: payload.event.type,
      userId: subscriptionRecord.userId,
      tier: subscriptionRecord.tier,
      productId: subscriptionRecord.productId,
    });
  } catch (error) {
    captureBackendError(error, {
      route: "subscription/webhook/revenuecat",
      userId: subscriptionRecord.userId,
      type: payload.event.type,
    });
    return jsonError(res, 500, "webhook_persistence_failed", "The RevenueCat event could not be persisted.");
  }

  return jsonOk(
    res,
    {
      received: true,
      userId: subscriptionRecord.userId,
      tier: subscriptionRecord.tier,
    },
    202,
  );
}
