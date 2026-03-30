import { SubscriptionStatusResponse } from "@/types/api";
import { apiRequest } from "@/services/api/client";

export function fetchSubscriptionStatus(accessToken?: string | null) {
  return apiRequest<SubscriptionStatusResponse>("/api/subscription/status", {
    accessToken,
  });
}
