export type PurchasesLogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export interface PurchasesEntitlementInfo {
  identifier: string;
  isActive: boolean;
  productIdentifier: string;
}

export interface PurchasesEntitlementInfos {
  active: Record<string, PurchasesEntitlementInfo>;
  all: Record<string, PurchasesEntitlementInfo>;
}

export interface CustomerInfo {
  entitlements: PurchasesEntitlementInfos;
  activeSubscriptions: string[];
}

export interface PurchasesStoreProduct {
  identifier: string;
  title: string;
  description: string;
  priceString: string;
}

export interface PurchasesPackage {
  identifier: string;
  packageType: string;
  product: PurchasesStoreProduct;
}

export interface PurchasesOffering {
  identifier: string;
  availablePackages: PurchasesPackage[];
  monthly?: PurchasesPackage | null;
  annual?: PurchasesPackage | null;
}

export interface PurchasesOfferings {
  current: PurchasesOffering | null;
  all: Record<string, PurchasesOffering>;
}
