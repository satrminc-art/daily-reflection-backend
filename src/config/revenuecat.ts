import { publicRuntimeConfig } from "@/config/publicRuntime";

export const REVENUECAT_KEYS = {
  ios: publicRuntimeConfig.revenueCatAppleKey,
  android: publicRuntimeConfig.revenueCatAndroidKey,
} as const;

export const ENTITLEMENTS = {
  premium: "Daytri Premium",
  lifelong: "lifelong",
} as const;

export const OFFERING_IDS = {
  default: "default",
} as const;

export const PACKAGE_IDS = {
  premiumMonthly: "$rc_monthly",
  premiumAnnual: "$rc_annual",
  lifelong: "lifelong",
} as const;
