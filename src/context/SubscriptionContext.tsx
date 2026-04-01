import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { __DEV_OVERRIDE_ENABLED__ } from "@/config/devFlags";
import { useAppContext } from "@/context/AppContext";
import { fetchSubscriptionStatus } from "@/services/api/subscription";
import {
  deriveMembershipTier,
  fetchCurrentOffering,
  fetchCustomerInfo,
  initializePurchases,
  isPurchasesConfigured,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases,
} from "@/services/purchases";
import { MembershipTier } from "@/types/membership";
import {
  scheduleYearEndPremiumReminder,
  clearYearEndPremiumReminder,
  clearFreemiumUpgradeReminder,
  scheduleFreemiumUpgradeReminder,
} from "@/services/notificationService";
import {
  clearDevSubscriptionOverride,
  loadDevSubscriptionOverride,
  saveDevSubscriptionOverride,
} from "@/services/subscriptionOverride";
import { getAppStrings } from "@/localization/strings";
import { RemoteSubscriptionStatus } from "@/types/subscription";
import type { CustomerInfo, PurchasesOffering, PurchasesPackage } from "@/types/purchases";
import type { SubscriptionModel } from "@/types/reflection";
import {
  getPrimaryOffering,
  hasActivePremiumEntitlement,
  resolveCurrentPlanLabel,
} from "@/utils/subscriptionHelpers";

interface SubscriptionContextValue {
  isPremium: boolean;
  offering: PurchasesOffering | null;
  loading: boolean;
  error: string | null;
  configured: boolean;
  subscriptionReady: boolean;
  currentPlanLabel: "Freemium" | "Premium" | "Lifelong";
  isUsingDevOverride: boolean;
  devOverridePlan: SubscriptionModel | null;
  monthlyPackage: PurchasesPackage | null;
  yearlyPackage: PurchasesPackage | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<void>;
  restorePurchases: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  setRealTier: (tier: MembershipTier | null) => void;
  setDevOverridePlan: (plan: SubscriptionModel) => Promise<void>;
  clearDevOverridePlan: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(undefined);

function getErrorMessage(error: unknown, language?: string | null) {
  return getAppStrings(language).t("membership.errorBody");
}

function hasDaysSince(timestamp: string | null, days: number) {
  if (!timestamp) {
    return true;
  }

  const previous = new Date(timestamp).getTime();
  if (Number.isNaN(previous)) {
    return true;
  }

  return Date.now() - previous >= days * 24 * 60 * 60 * 1000;
}

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { appState, authSession, updateSubscriptionModel, markFreemiumUpgradeNotificationScheduled } = useAppContext();
  const [configured, setConfigured] = useState(false);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptionReady, setSubscriptionReady] = useState(false);
  const [realTier, setRealTier] = useState<MembershipTier | null>(null);
  const [devOverridePlan, setDevOverridePlanState] = useState<SubscriptionModel | null>(null);
  const [remoteSubscriptionStatus, setRemoteSubscriptionStatus] = useState<RemoteSubscriptionStatus | null>(null);

  useEffect(() => {
    if (!__DEV_OVERRIDE_ENABLED__) {
      return;
    }

    loadDevSubscriptionOverride().then(setDevOverridePlanState).catch((nextError) => {
      console.warn("Failed to load dev subscription override", nextError);
    });
  }, []);

  async function refreshSubscriptionStatus() {
    setLoading(true);
    setError(null);

    try {
      console.log("[RevenueCat] startup: initializePurchases()");
      const didConfigure = await initializePurchases();
      console.log("[RevenueCat] startup: initializePurchases() result", {
        didConfigure,
        configured: isPurchasesConfigured(),
      });
      setConfigured(didConfigure || isPurchasesConfigured());

      if (!didConfigure && !isPurchasesConfigured()) {
        setOffering(null);
        setCustomerInfo(null);
        setRealTier(null);
        console.log("[RevenueCat] NOT CONNECTED", {
          reason: "RevenueCat initialization error",
        });
        console.info("[SUBSCRIPTION] fallback to freemium");
        return;
      }

      console.log("[RevenueCat] startup: fetchCurrentOffering()");
      console.log("[RevenueCat] startup: fetchCustomerInfo()");
      const [nextOffering, nextCustomerInfo] = await Promise.all([
        fetchCurrentOffering(),
        fetchCustomerInfo(),
      ]);

      setOffering(nextOffering);
      setCustomerInfo(nextCustomerInfo);
      setRealTier(nextCustomerInfo ? deriveMembershipTier(nextCustomerInfo) : null);
      if (nextOffering) {
        console.log("[RevenueCat] CONNECTED", {
          reason: "offerings found",
          offeringId: nextOffering.identifier,
        });
      } else {
        console.log("[RevenueCat] CONFIGURED BUT EMPTY", {
          reason: "no offerings found",
        });
      }
      console.info("[SUBSCRIPTION] subscription state ready");
    } catch (nextError) {
      console.log("[RevenueCat] NOT CONNECTED", {
        reason: "RevenueCat initialization error",
        error: nextError instanceof Error ? nextError.message : String(nextError),
      });
      setError(getErrorMessage(nextError, appState.preferredLanguage));
      console.warn("[SUBSCRIPTION] initialization failed, continuing as freemium", nextError);
    } finally {
      setSubscriptionReady(true);
      setLoading(false);
    }
  }

  useEffect(() => {
    console.info("[SUBSCRIPTION] starting deferred initialization");
    refreshSubscriptionStatus().catch((nextError) => {
      setError(getErrorMessage(nextError, appState.preferredLanguage));
      setSubscriptionReady(true);
      setLoading(false);
    });
  }, [appState.preferredLanguage]);

  useEffect(() => {
    if (!authSession?.accessToken) {
      setRemoteSubscriptionStatus(null);
      return;
    }

    fetchSubscriptionStatus(authSession.accessToken)
      .then((status) => {
        setRemoteSubscriptionStatus(status);
      })
      .catch((error) => {
        console.warn("[SUBSCRIPTION] failed to hydrate backend subscription status", error);
      });
  }, [authSession?.accessToken]);

  async function purchasePackage(pkg: PurchasesPackage) {
    setLoading(true);
    setError(null);

    try {
      const info = await purchaseRevenueCatPackage(pkg);
      setCustomerInfo(info);
      setRealTier(info ? deriveMembershipTier(info) : null);
      setOffering(await fetchCurrentOffering());
    } catch (nextError) {
      setError(getErrorMessage(nextError, appState.preferredLanguage));
      throw nextError;
    } finally {
      setLoading(false);
    }
  }

  async function restorePurchases() {
    setLoading(true);
    setError(null);

    try {
      const info = await restoreRevenueCatPurchases();
      setCustomerInfo(info);
      setRealTier(info ? deriveMembershipTier(info) : null);
      setOffering(await fetchCurrentOffering());
    } catch (nextError) {
      setError(getErrorMessage(nextError, appState.preferredLanguage));
      throw nextError;
    } finally {
      setLoading(false);
    }
  }

  const actualMembershipTier =
    remoteSubscriptionStatus?.tier === "Lifelong"
      ? "lifelong"
      : remoteSubscriptionStatus?.tier === "Premium"
        ? "premium"
        : realTier ?? (customerInfo ? deriveMembershipTier(customerInfo) : "freemium");
  const actualIsPremium = actualMembershipTier !== "freemium" || hasActivePremiumEntitlement(customerInfo?.entitlements);
  const packageSet = useMemo(() => getPrimaryOffering(offering), [offering]);
  const actualPlanLabel =
    actualMembershipTier === "lifelong"
      ? "Lifelong"
      : actualMembershipTier === "premium"
        ? "Premium"
        : resolveCurrentPlanLabel({
            isPremium: actualIsPremium,
            activeSubscriptions: customerInfo?.activeSubscriptions,
          });
  const effectivePlanLabel = __DEV_OVERRIDE_ENABLED__ && devOverridePlan ? devOverridePlan : actualPlanLabel;
  const isPremium = effectivePlanLabel !== "Freemium";

  async function setDevOverridePlan(plan: SubscriptionModel) {
    if (!__DEV_OVERRIDE_ENABLED__) {
      return;
    }

    await saveDevSubscriptionOverride(plan);
    setDevOverridePlanState(plan);
  }

  async function clearDevOverridePlan() {
    if (!__DEV_OVERRIDE_ENABLED__) {
      return;
    }

    await clearDevSubscriptionOverride();
    setDevOverridePlanState(null);
  }

  useEffect(() => {
    const strings = getAppStrings(appState.preferredLanguage);

    if (isPremium) {
      scheduleYearEndPremiumReminder({
        title: strings.yearEndReminderTitle(appState.userName),
        body: strings.yearEndReminderBody(),
      }).catch((error) => {
        console.warn("Failed to schedule premium reminder", error);
      });

      clearFreemiumUpgradeReminder().catch((error) => {
        console.warn("Failed to clear freemium upgrade reminder", error);
      });
      return;
    }

    clearYearEndPremiumReminder().catch((error) => {
      console.warn("Failed to clear premium reminder", error);
    });
  }, [appState.preferredLanguage, appState.userName, isPremium]);

  useEffect(() => {
    if (
      isPremium ||
      !appState.hasCompletedOnboarding ||
      !appState.preferences.notificationsEnabled ||
      appState.viewedDates.length < 7 ||
      !hasDaysSince(appState.lastFreemiumUpgradeNotificationAt, 10)
    ) {
      return;
    }

    const strings = getAppStrings(appState.preferredLanguage);

    scheduleFreemiumUpgradeReminder(appState.preferences.notificationTime, {
      title: strings.t("membership.upgradeNotificationTitle"),
      body: strings.t("membership.upgradeNotificationBody"),
      language: appState.preferredLanguage,
      userName: appState.userName,
      notificationsEnabled: appState.preferences.notificationsEnabled,
      soundEnabled: appState.preferences.soundEnabled,
      silentMode: appState.preferences.silentMode,
      daysFromNow: 7,
    })
      .then((scheduled) => {
        if (scheduled) {
          return markFreemiumUpgradeNotificationScheduled();
        }
      })
      .catch((error) => {
        console.warn("Failed to schedule freemium upgrade reminder", error);
      });
  }, [
    appState.hasCompletedOnboarding,
    appState.lastFreemiumUpgradeNotificationAt,
    appState.preferences.notificationTime,
    appState.preferences.notificationsEnabled,
    appState.preferences.silentMode,
    appState.preferences.soundEnabled,
    appState.preferredLanguage,
    appState.userName,
    appState.viewedDates.length,
    isPremium,
    markFreemiumUpgradeNotificationScheduled,
  ]);

  useEffect(() => {
    updateSubscriptionModel(effectivePlanLabel).catch((error) => {
      console.warn("[SUBSCRIPTION] failed to sync local subscription model", error);
    });
  }, [effectivePlanLabel]);

  return (
    <SubscriptionContext.Provider
      value={{
        isPremium,
        offering,
        loading,
        error,
        configured,
        subscriptionReady,
        currentPlanLabel: effectivePlanLabel,
        isUsingDevOverride: __DEV_OVERRIDE_ENABLED__ && Boolean(devOverridePlan),
        devOverridePlan,
        monthlyPackage: packageSet.monthly,
        yearlyPackage: packageSet.yearly,
        purchasePackage,
        restorePurchases,
        refreshSubscriptionStatus,
        setRealTier,
        setDevOverridePlan,
        clearDevOverridePlan,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscriptionContext() {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error("useSubscriptionContext must be used within SubscriptionProvider");
  }

  return context;
}
