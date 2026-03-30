import { SubscriptionModel } from "@/types/reflection";

export interface RemoteSubscriptionStatus {
  tier: SubscriptionModel;
  status: "active" | "inactive" | "grace_period" | "expired";
  isPremium: boolean;
  productId: string | null;
  expiresAt: string | null;
  isLifetime: boolean;
  source: "backend" | "revenuecat_fallback";
}
