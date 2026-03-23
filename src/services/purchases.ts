import { Platform } from "react-native";
import { ENTITLEMENTS, OFFERING_IDS, PACKAGE_IDS, REVENUECAT_KEYS } from "@/config/revenuecat";
import type { MembershipTier, PurchaseTarget } from "@/types/membership";
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesOfferings,
  PurchasesPackage,
  RevenueCatPaywallResult,
} from "@/types/purchases";

let configured = false;
let purchasesModule: any | null | undefined;
let purchasesUiModule: any | null | undefined;

function loadPurchasesModule() {
  if (purchasesModule !== undefined) {
    return purchasesModule;
  }

  try {
    const dynamicRequire = new Function("moduleName", "return require(moduleName);") as (name: string) => any;
    purchasesModule = dynamicRequire("react-native-purchases");
  } catch {
    purchasesModule = null;
  }

  return purchasesModule;
}

function loadPurchasesUiModule() {
  if (purchasesUiModule !== undefined) {
    return purchasesUiModule;
  }

  try {
    const dynamicRequire = new Function("moduleName", "return require(moduleName);") as (name: string) => any;
    purchasesUiModule = dynamicRequire("react-native-purchases-ui");
  } catch {
    purchasesUiModule = null;
  }

  return purchasesUiModule;
}

function getRevenueCatApiKey() {
  const key = Platform.select({
    ios: REVENUECAT_KEYS.ios,
    android: REVENUECAT_KEYS.android,
    default: "",
  });

  if (!key || key.includes("your_") || key.endsWith("_here")) {
    return null;
  }

  return key;
}

export async function configurePurchases(userId?: string): Promise<void> {
  const apiKey = getRevenueCatApiKey();
  const Purchases = loadPurchasesModule();
  if (!apiKey || configured || !Purchases) {
    if (!apiKey || !Purchases) {
      throw new Error("RevenueCat is not configured for this build yet.");
    }
    return;
  }

  Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
  await Purchases.configure({ apiKey, appUserID: userId });
  configured = true;
}

export async function initializePurchases(): Promise<boolean> {
  try {
    await configurePurchases();
    return true;
  } catch (error) {
    if (__DEV__) {
      console.warn("RevenueCat initialization skipped", error);
    }
    return false;
  }
}

export function isPurchasesConfigured() {
  return configured;
}

export async function fetchCurrentOffering(): Promise<PurchasesOffering | null> {
  const Purchases = loadPurchasesModule();
  if (!configured || !Purchases) {
    return null;
  }

  const offerings = (await Purchases.getOfferings()) as PurchasesOfferings;
  return offerings.current ?? offerings.all?.[OFFERING_IDS.default] ?? null;
}

export async function fetchCustomerInfo(): Promise<CustomerInfo | null> {
  try {
    return await getCustomerInfo();
  } catch {
    return null;
  }
}

export async function purchaseRevenueCatPackage(pkg: PurchasesPackage): Promise<CustomerInfo | null> {
  const Purchases = loadPurchasesModule();
  if (!configured || !Purchases) {
    throw new Error("RevenueCat is not configured. Add your platform API keys first.");
  }

  const result = await Purchases.purchasePackage(pkg);
  return result.customerInfo;
}

export async function restoreRevenueCatPurchases(): Promise<CustomerInfo | null> {
  try {
    return await restorePurchases();
  } catch {
    return null;
  }
}

export async function getCustomerInfo(): Promise<CustomerInfo> {
  const Purchases = loadPurchasesModule();
  if (!configured || !Purchases) {
    throw new Error("RevenueCat is not configured for this build yet.");
  }

  return Purchases.getCustomerInfo();
}

export function deriveMembershipTier(customerInfo: CustomerInfo): MembershipTier {
  const active = customerInfo.entitlements.active;

  if (active[ENTITLEMENTS.lifelong]) {
    return "lifelong";
  }

  if (active[ENTITLEMENTS.premium]) {
    return "premium";
  }

  return "freemium";
}

export function getMembershipTierFromCustomerInfo(customerInfo: CustomerInfo): MembershipTier {
  return deriveMembershipTier(customerInfo);
}

export async function getDefaultOffering(): Promise<PurchasesOffering | null> {
  return fetchCurrentOffering();
}

export async function getCurrentOffering(): Promise<PurchasesOffering | null> {
  return getDefaultOffering();
}

export function findPremiumPackage(offering: PurchasesOffering): PurchasesPackage | null {
  return (
    offering.monthly ??
    offering.annual ??
    offering.availablePackages.find((pkg) => pkg.identifier === PACKAGE_IDS.premiumMonthly) ??
    offering.availablePackages.find((pkg) => pkg.identifier === PACKAGE_IDS.premiumAnnual) ??
    offering.availablePackages[0] ??
    null
  );
}

export function findLifelongPackage(offering: PurchasesOffering): PurchasesPackage | null {
  return (
    offering.availablePackages.find((pkg) => pkg.identifier === PACKAGE_IDS.lifelong) ??
    offering.availablePackages.find((pkg) => {
      const identifier = pkg.identifier.toLowerCase();
      return identifier.includes("lifetime") || identifier.includes("lifelong");
    }) ??
    null
  );
}

export function findPackageForTarget(
  offering: PurchasesOffering,
  target: PurchaseTarget,
): PurchasesPackage | null {
  if (target === "premium") {
    return findPremiumPackage(offering);
  }

  return findLifelongPackage(offering);
}

export async function purchaseTarget(target: PurchaseTarget): Promise<CustomerInfo> {
  const offering = await getDefaultOffering();

  if (!offering) {
    throw new Error("No offering available.");
  }

  const pkg = findPackageForTarget(offering, target);

  if (!pkg) {
    throw new Error(`No package found for target: ${target}`);
  }

  const result = await purchaseRevenueCatPackage(pkg);

  if (!result) {
    throw new Error("Purchase did not return customer info.");
  }

  return result;
}

export async function restorePurchases(): Promise<CustomerInfo> {
  const Purchases = loadPurchasesModule();
  if (!configured || !Purchases) {
    throw new Error("RevenueCat is not configured for this build yet.");
  }

  return Purchases.restorePurchases();
}

export async function purchasePackage(pkg: PurchasesPackage): Promise<CustomerInfo> {
  const customerInfo = await purchaseRevenueCatPackage(pkg);

  if (!customerInfo) {
    throw new Error("Purchase did not return customer info.");
  }

  return customerInfo;
}

export function isRevenueCatPaywallAvailable() {
  return Boolean(loadPurchasesUiModule());
}

export async function presentRevenueCatPaywall(): Promise<boolean> {
  const RevenueCatUI = loadPurchasesUiModule();

  if (!configured || !RevenueCatUI?.presentPaywall || !RevenueCatUI?.PAYWALL_RESULT) {
    return false;
  }

  const paywallResult = (await RevenueCatUI.presentPaywall()) as RevenueCatPaywallResult;

  switch (paywallResult) {
    case RevenueCatUI.PAYWALL_RESULT.PURCHASED:
    case RevenueCatUI.PAYWALL_RESULT.RESTORED:
      return true;
    case RevenueCatUI.PAYWALL_RESULT.NOT_PRESENTED:
    case RevenueCatUI.PAYWALL_RESULT.ERROR:
    case RevenueCatUI.PAYWALL_RESULT.CANCELLED:
    default:
      return false;
  }
}
