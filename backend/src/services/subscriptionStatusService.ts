import { SubscriptionStatusRecord } from "../domain/entities";

export function mapRevenueCatProductToTier(productId: string | null | undefined): SubscriptionStatusRecord["tier"] {
  const normalized = productId?.toLowerCase() ?? "";

  if (normalized.includes("life")) {
    return "Lifelong";
  }

  if (normalized.includes("year") || normalized.includes("annual") || normalized.includes("month")) {
    return "Premium";
  }

  return "Freemium";
}

export function buildSubscriptionStatusRecord(input: {
  userId: string;
  provider: string;
  productId: string | null;
  entitlementId: string | null;
  status: string;
  expiresAt: string | null;
  isLifetime: boolean;
  rawPayload?: unknown;
}): SubscriptionStatusRecord {
  return {
    id: `subscription-${input.userId}`,
    userId: input.userId,
    provider: input.provider,
    productId: input.productId ?? "",
    entitlementId: input.entitlementId,
    tier: input.isLifetime ? "Lifelong" : mapRevenueCatProductToTier(input.productId),
    status: input.status,
    expiresAt: input.expiresAt,
    isLifetime: input.isLifetime,
    rawPayload: input.rawPayload,
    updatedAt: new Date().toISOString(),
  };
}

export function normalizeSubscriptionStatus(record: SubscriptionStatusRecord | null) {
  const tier = record?.tier ?? "Freemium";
  const isLifetime = tier === "Lifelong" || Boolean(record?.isLifetime);
  const isPremium = tier === "Premium" || isLifetime;
  const rawStatus = (record?.status ?? "").toLowerCase();
  const status: "active" | "inactive" | "grace_period" | "expired" =
    rawStatus.includes("grace")
      ? "grace_period"
      : rawStatus.includes("expire")
        ? "expired"
        : isPremium
          ? "active"
          : "inactive";

  return {
    tier,
    status,
    isPremium,
    isLifetime,
    expiresAt: record?.expiresAt ?? null,
    productId: record?.productId || null,
    source: "backend" as const,
  };
}
