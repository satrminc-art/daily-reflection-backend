import type { MembershipFeatureId } from "@/constants/premiumFeatures";

export type MembershipTier = "freemium" | "premium" | "lifelong";

export type PurchaseTarget = "premium" | "lifelong";

export type MembershipState = {
  membershipTier: MembershipTier;
  hasPremiumAccess: boolean;
  isLifelong: boolean;
  loading: boolean;
  error: string | null;
};

export type MembershipFeatureChecker = (featureKey: MembershipFeatureId) => boolean;
