import { ENTITLEMENTS, PACKAGE_IDS } from "@/services/purchasesConfig";
import type { PurchasesEntitlementInfos, PurchasesOffering, PurchasesPackage } from "@/types/purchases";
export const FREE_ARCHIVE_LIMIT = 7;

export function hasActivePremiumEntitlement(entitlements?: PurchasesEntitlementInfos | null): boolean {
  return Boolean(
    entitlements?.active?.[ENTITLEMENTS.premium]?.isActive ||
      entitlements?.active?.[ENTITLEMENTS.lifelong]?.isActive,
  );
}

export function getPrimaryOffering(offering: PurchasesOffering | null | undefined) {
  if (!offering) {
    return { monthly: null, yearly: null };
  }

  const monthly =
    offering.monthly ??
    offering.availablePackages.find((pkg) => pkg.identifier === PACKAGE_IDS.premiumMonthly) ??
    offering.availablePackages.find((pkg) => pkg.packageType.toUpperCase() === "MONTHLY") ??
    offering.availablePackages.find((pkg) => pkg.identifier.includes("monthly")) ??
    null;
  const yearly =
    offering.annual ??
    offering.availablePackages.find((pkg) => pkg.identifier === PACKAGE_IDS.premiumAnnual) ??
    offering.availablePackages.find((pkg) => pkg.packageType.toUpperCase() === "ANNUAL") ??
    offering.availablePackages.find((pkg) => pkg.identifier.includes("year")) ??
    null;

  return { monthly, yearly };
}

export function resolveCurrentPlanLabel(args: {
  isPremium: boolean;
  activeSubscriptions?: string[];
}): "Freemium" | "Premium" | "Lifelong" {
  if (!args.isPremium) {
    return "Freemium";
  }

  const hasLifetime = args.activeSubscriptions?.some(
    (id) => id.toLowerCase().includes(PACKAGE_IDS.lifelong) || id.toLowerCase().includes(ENTITLEMENTS.lifelong),
  );
  return hasLifetime ? "Lifelong" : "Premium";
}

export function isPackageLocked(isPremium: boolean, availability: "included" | "future_premium"): boolean {
  return availability === "future_premium" && !isPremium;
}

export function getPackageDisplayLabel(pkg: PurchasesPackage | null | undefined): string {
  if (!pkg) {
    return "";
  }

  return pkg.product.priceString;
}
