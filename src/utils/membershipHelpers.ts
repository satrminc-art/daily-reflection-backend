import {
  MembershipFeatureCategoryId,
  MembershipFeatureDefinition,
  MembershipFeatureId,
  MEMBERSHIP_FEATURES,
  MEMBERSHIP_PLAN_FEATURES,
} from "@/constants/premiumFeatures";
import { MembershipTier } from "@/types/membership";
import { SubscriptionModel } from "@/types/reflection";

export const FREE_ARCHIVE_LIMIT = 7;
export const FREE_SAVED_LIMIT = 7;
export const FREE_NOTE_CHARACTER_LIMIT = 180;
export const PREMIUM_NOTE_CHARACTER_LIMIT = 5000;

export function normalizeMembershipTier(plan: SubscriptionModel): MembershipTier {
  if (plan === "Premium") {
    return "premium";
  }

  if (plan === "Lifelong") {
    return "lifelong";
  }

  return "freemium";
}

export function getEffectiveEntitlement(plan: SubscriptionModel): MembershipTier {
  return normalizeMembershipTier(plan);
}

export function isPremiumActive(tier: MembershipTier) {
  return tier === "premium" || tier === "lifelong";
}

export function hasPremiumMembershipAccess(tier: MembershipTier) {
  return isPremiumActive(tier);
}

export function isLifelongActive(tier: MembershipTier) {
  return tier === "lifelong";
}

export function isLifelongTier(tier: MembershipTier) {
  return isLifelongActive(tier);
}

export function getFeaturesForEntitlement(tier: MembershipTier): readonly MembershipFeatureId[] {
  return MEMBERSHIP_PLAN_FEATURES[tier];
}

export function hasFeature(tier: MembershipTier, featureKey: MembershipFeatureId): boolean {
  return getFeaturesForEntitlement(tier).includes(featureKey);
}

export function getSaveLimitForEntitlement(tier: MembershipTier): number | null {
  return hasFeature(tier, "unlimited-saved") ? null : FREE_SAVED_LIMIT;
}

export function canSaveAdditionalReflection(
  tier: MembershipTier,
  currentSavedCount: number,
  alreadySaved: boolean,
): boolean {
  if (alreadySaved) {
    return true;
  }

  const limit = getSaveLimitForEntitlement(tier);
  if (limit === null) {
    return true;
  }

  return currentSavedCount < limit;
}

export function getNoteMaxLengthForEntitlement(tier: MembershipTier): number {
  return hasFeature(tier, "extended-notes") ? PREMIUM_NOTE_CHARACTER_LIMIT : FREE_NOTE_CHARACTER_LIMIT;
}

export function getFeaturesByCategory(category: MembershipFeatureCategoryId): MembershipFeatureDefinition[] {
  return MEMBERSHIP_FEATURES.filter((feature) => feature.category === category);
}
