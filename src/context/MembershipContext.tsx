import React, { createContext, useContext, useMemo } from "react";
import { MembershipFeatureId } from "@/constants/premiumFeatures";
import { __DEV_OVERRIDE_ENABLED__ } from "@/config/devFlags";
import { deriveMembershipTier, purchaseTarget } from "@/services/purchases";
import { MembershipState, MembershipTier, PurchaseTarget } from "@/types/membership";
import { useSubscription } from "@/hooks/useSubscription";
import { SubscriptionModel } from "@/types/reflection";
import {
  getEffectiveEntitlement,
  hasFeature as hasMembershipFeature,
  hasPremiumMembershipAccess,
  isLifelongTier,
  isPremiumActive,
} from "@/utils/membershipHelpers";

interface MembershipContextValue extends MembershipState {
  tier: MembershipTier;
  effectiveEntitlement: MembershipTier;
  currentPlanLabel: SubscriptionModel;
  devOverrideEnabled: boolean;
  isUsingDevOverride: boolean;
  isPremiumActive: boolean;
  isLifelongActive: boolean;
  hasFeature: (featureKey: MembershipFeatureId) => boolean;
  refreshMembership: () => Promise<void>;
  restoreMembership: () => Promise<void>;
  selectPlan: (target: PurchaseTarget) => Promise<void>;
  restore: () => Promise<void>;
  setDevMembershipTier: (plan: MembershipTier | SubscriptionModel | null) => Promise<void>;
  clearDevMembershipTier: () => Promise<void>;
}

const MembershipContext = createContext<MembershipContextValue | undefined>(undefined);

export function MembershipProvider({ children }: { children: React.ReactNode }) {
  const subscription = useSubscription();

  const value = useMemo<MembershipContextValue>(() => {
    const membershipTier = getEffectiveEntitlement(subscription.currentPlanLabel);
    const mapTierToPlanLabel = (plan: MembershipTier | SubscriptionModel): SubscriptionModel => {
      if (plan === "freemium" || plan === "Freemium") {
        return "Freemium";
      }

      if (plan === "premium" || plan === "Premium") {
        return "Premium";
      }

      return "Lifelong";
    };

    return {
      membershipTier,
      tier: membershipTier,
      effectiveEntitlement: membershipTier,
      hasPremiumAccess: hasPremiumMembershipAccess(membershipTier),
      isLifelong: isLifelongTier(membershipTier),
      isPremiumActive: isPremiumActive(membershipTier),
      isLifelongActive: isLifelongTier(membershipTier),
      hasFeature: (featureKey: MembershipFeatureId) => hasMembershipFeature(membershipTier, featureKey),
      loading: subscription.loading,
      error: subscription.error,
      currentPlanLabel: subscription.currentPlanLabel,
      devOverrideEnabled: __DEV_OVERRIDE_ENABLED__,
      isUsingDevOverride: subscription.isUsingDevOverride,
      refreshMembership: subscription.refreshSubscriptionStatus,
      restoreMembership: async () => {
        await subscription.restorePurchases();
        await subscription.refreshSubscriptionStatus();
      },
      selectPlan: async (target: PurchaseTarget) => {
        if (__DEV_OVERRIDE_ENABLED__) {
          await subscription.setDevOverridePlan(target === "premium" ? "Premium" : "Lifelong");
          return;
        }

        const customerInfo = await purchaseTarget(target);
        const tier = deriveMembershipTier(customerInfo);
        subscription.setRealTier(tier);
        await subscription.refreshSubscriptionStatus();
      },
      restore: async () => {
        await subscription.restorePurchases();
        await subscription.refreshSubscriptionStatus();
      },
      setDevMembershipTier: async (plan: MembershipTier | SubscriptionModel | null) => {
        if (plan === null) {
          await subscription.clearDevOverridePlan();
          return;
        }

        await subscription.setDevOverridePlan(mapTierToPlanLabel(plan));
      },
      clearDevMembershipTier: subscription.clearDevOverridePlan,
    };
  }, [subscription]);

  return <MembershipContext.Provider value={value}>{children}</MembershipContext.Provider>;
}

export function useMembershipContext() {
  const context = useContext(MembershipContext);
  if (!context) {
    throw new Error("useMembershipContext must be used within MembershipProvider");
  }

  return context;
}
