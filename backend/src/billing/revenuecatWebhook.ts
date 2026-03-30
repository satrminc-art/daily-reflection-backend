import { SubscriptionStatusRecord } from "../domain/entities";
import { getServerEnv } from "../config/serverEnv";
import { getHeader, type ApiRouteRequest } from "../lib/http";
import { buildSubscriptionStatusRecord } from "../services/subscriptionStatusService";
import { RevenueCatWebhookEvent } from "../types/revenuecat";

export function validateRevenueCatWebhookPayload(payload: unknown): payload is RevenueCatWebhookEvent {
  const event = (payload as RevenueCatWebhookEvent | null)?.event;
  return Boolean(event && typeof event.type === "string");
}

export function verifyRevenueCatWebhookRequest(req: ApiRouteRequest) {
  const env = getServerEnv();
  if (!env.revenueCatWebhookSecret) {
    return true;
  }

  const authorization = getHeader(req, "authorization");
  const signature = getHeader(req, "x-revenuecat-signature");
  const bearerSecret = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length).trim() : null;

  return bearerSecret === env.revenueCatWebhookSecret || signature === env.revenueCatWebhookSecret;
}

export function mapRevenueCatWebhookToSubscription(payload: RevenueCatWebhookEvent): SubscriptionStatusRecord | null {
  const appUserId =
    payload.event.app_user_id?.trim() ||
    payload.event.original_app_user_id?.trim() ||
    payload.event.aliases?.find((value) => value.trim())?.trim();
  if (!appUserId) {
    return null;
  }

  return buildSubscriptionStatusRecord({
    userId: appUserId,
    provider: "revenuecat",
    productId: payload.event.product_id ?? null,
    entitlementId: payload.event.entitlement_ids?.[0] ?? null,
    status: payload.event.type,
    expiresAt:
      typeof payload.event.expiration_at_ms === "number"
        ? new Date(payload.event.expiration_at_ms).toISOString()
        : null,
    isLifetime: (payload.event.entitlement_ids ?? []).some((value) => value.toLowerCase().includes("life")),
    rawPayload: payload,
  });
}
