import type { MembershipTier } from "../src/types/membership";

const DAILY_LIMITS: Record<MembershipTier, number> = {
  freemium: 1,
  premium: 10,
  lifelong: 10,
};

type UsageEntry = {
  count: number;
  expiresAt: number;
};

const usageStore = new Map<string, UsageEntry>();

function getUtcDateKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function pruneExpiredEntries(now: number) {
  for (const [key, entry] of usageStore.entries()) {
    if (entry.expiresAt <= now) {
      usageStore.delete(key);
    }
  }
}

function getExpiryForDateKey(dateKey: string) {
  return new Date(`${dateKey}T23:59:59.999Z`).getTime();
}

export function getDailyLimitForEntitlement(entitlement: MembershipTier) {
  return DAILY_LIMITS[entitlement];
}

export async function consumeFollowUpQuota(args: {
  identifier: string;
  entitlement: MembershipTier;
  now?: Date;
}) {
  const now = args.now ?? new Date();
  const nowMs = now.getTime();
  pruneExpiredEntries(nowMs);

  const dateKey = getUtcDateKey(now);
  const storeKey = `${dateKey}:${args.entitlement}:${args.identifier}`;
  const existing = usageStore.get(storeKey);
  const limit = getDailyLimitForEntitlement(args.entitlement);

  if (existing && existing.count >= limit) {
    return {
      allowed: false as const,
      remaining: 0,
      limit,
      resetAt: new Date(existing.expiresAt).toISOString(),
    };
  }

  const nextCount = (existing?.count ?? 0) + 1;
  const expiresAt = existing?.expiresAt ?? getExpiryForDateKey(dateKey);
  usageStore.set(storeKey, {
    count: nextCount,
    expiresAt,
  });

  return {
    allowed: true as const,
    remaining: Math.max(limit - nextCount, 0),
    limit,
    resetAt: new Date(expiresAt).toISOString(),
  };
}
