import type { MembershipTier } from "../src/types/membership";

const DAILY_LIMITS: Record<MembershipTier, number> = {
  freemium: 1,
  premium: 10,
  lifelong: 10,
};

const REQUEST_COOLDOWN_MS = 12_000;
const IP_DAILY_LIMIT = 40;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 6;

type DailyUsageEntry = {
  count: number;
  expiresAt: number;
};

type CooldownEntry = {
  expiresAt: number;
};

type WindowEntry = {
  count: number;
  windowStartedAt: number;
  expiresAt: number;
};

const dailyUsageStore = new Map<string, DailyUsageEntry>();
const cooldownStore = new Map<string, CooldownEntry>();
const rateLimitWindowStore = new Map<string, WindowEntry>();

function getUtcDateKey(now: Date) {
  return now.toISOString().slice(0, 10);
}

function getExpiryForDateKey(dateKey: string) {
  return new Date(`${dateKey}T23:59:59.999Z`).getTime();
}

function pruneExpiredEntries(nowMs: number) {
  for (const [key, entry] of dailyUsageStore.entries()) {
    if (entry.expiresAt <= nowMs) {
      dailyUsageStore.delete(key);
    }
  }

  for (const [key, entry] of cooldownStore.entries()) {
    if (entry.expiresAt <= nowMs) {
      cooldownStore.delete(key);
    }
  }

  for (const [key, entry] of rateLimitWindowStore.entries()) {
    if (entry.expiresAt <= nowMs) {
      rateLimitWindowStore.delete(key);
    }
  }
}

function getUsageEntry(key: string) {
  return dailyUsageStore.get(key);
}

function getRemainingCooldown(key: string, nowMs: number) {
  const entry = cooldownStore.get(key);
  if (!entry || entry.expiresAt <= nowMs) {
    return 0;
  }

  return entry.expiresAt - nowMs;
}

export function getDailyLimitForEntitlement(entitlement: MembershipTier) {
  return DAILY_LIMITS[entitlement];
}

export async function enforceFollowUpLimits(args: {
  ipIdentifier: string;
  userIdentifier?: string;
  entitlement: MembershipTier;
  now?: Date;
}) {
  const now = args.now ?? new Date();
  const nowMs = now.getTime();
  pruneExpiredEntries(nowMs);

  const dateKey = getUtcDateKey(now);
  const dateExpiry = getExpiryForDateKey(dateKey);
  const identifiers = [args.ipIdentifier, args.userIdentifier].filter(Boolean) as string[];

  for (const identifier of identifiers) {
    const windowKey = `window:${identifier}`;
    const existingWindow = rateLimitWindowStore.get(windowKey);

    if (existingWindow && existingWindow.expiresAt > nowMs) {
      if (existingWindow.count >= RATE_LIMIT_MAX_REQUESTS) {
        return {
          allowed: false as const,
          code: "rate_limited" as const,
          retryAfterMs: existingWindow.expiresAt - nowMs,
          resetAt: new Date(existingWindow.expiresAt).toISOString(),
        };
      }

      rateLimitWindowStore.set(windowKey, {
        ...existingWindow,
        count: existingWindow.count + 1,
      });
    } else {
      rateLimitWindowStore.set(windowKey, {
        count: 1,
        windowStartedAt: nowMs,
        expiresAt: nowMs + RATE_LIMIT_WINDOW_MS,
      });
    }
  }

  let maxCooldownRemaining = 0;
  for (const identifier of identifiers) {
    maxCooldownRemaining = Math.max(maxCooldownRemaining, getRemainingCooldown(identifier, nowMs));
  }

  if (maxCooldownRemaining > 0) {
    return {
      allowed: false as const,
      code: "rate_limited" as const,
      retryAfterMs: maxCooldownRemaining,
      resetAt: new Date(nowMs + maxCooldownRemaining).toISOString(),
    };
  }

  const ipUsageKey = `${dateKey}:ip:${args.ipIdentifier}`;
  const ipUsage = getUsageEntry(ipUsageKey);
  if ((ipUsage?.count ?? 0) >= IP_DAILY_LIMIT) {
    return {
      allowed: false as const,
      code: "rate_limited" as const,
      retryAfterMs: dateExpiry - nowMs,
      resetAt: new Date(dateExpiry).toISOString(),
    };
  }

  const userLimit = getDailyLimitForEntitlement(args.entitlement);
  if (args.userIdentifier) {
    const userUsageKey = `${dateKey}:user:${args.userIdentifier}`;
    const userUsage = getUsageEntry(userUsageKey);
    if ((userUsage?.count ?? 0) >= userLimit) {
      return {
        allowed: false as const,
        code: "daily_limit_reached" as const,
        retryAfterMs: dateExpiry - nowMs,
        resetAt: new Date(dateExpiry).toISOString(),
      };
    }

    dailyUsageStore.set(userUsageKey, {
      count: (userUsage?.count ?? 0) + 1,
      expiresAt: userUsage?.expiresAt ?? dateExpiry,
    });
  } else {
    const fallbackUsageKey = `${dateKey}:anon:${args.ipIdentifier}:${args.entitlement}`;
    const fallbackUsage = getUsageEntry(fallbackUsageKey);
    if ((fallbackUsage?.count ?? 0) >= userLimit) {
      return {
        allowed: false as const,
        code: "daily_limit_reached" as const,
        retryAfterMs: dateExpiry - nowMs,
        resetAt: new Date(dateExpiry).toISOString(),
      };
    }

    dailyUsageStore.set(fallbackUsageKey, {
      count: (fallbackUsage?.count ?? 0) + 1,
      expiresAt: fallbackUsage?.expiresAt ?? dateExpiry,
    });
  }

  dailyUsageStore.set(ipUsageKey, {
    count: (ipUsage?.count ?? 0) + 1,
    expiresAt: ipUsage?.expiresAt ?? dateExpiry,
  });

  for (const identifier of identifiers) {
    cooldownStore.set(identifier, {
      expiresAt: nowMs + REQUEST_COOLDOWN_MS,
    });
  }

  return {
    allowed: true as const,
    code: null,
    retryAfterMs: 0,
    resetAt: new Date(dateExpiry).toISOString(),
  };
}
