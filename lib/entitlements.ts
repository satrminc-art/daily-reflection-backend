import type { MembershipTier } from "../src/types/membership";

export interface EntitlementResolution {
  effectiveEntitlement: MembershipTier;
  source: "client_unverified";
}

function sanitizeEntitlement(entitlement: MembershipTier): MembershipTier {
  if (entitlement === "premium" || entitlement === "lifelong") {
    return entitlement;
  }

  return "freemium";
}

export async function resolveEffectiveEntitlement(args: {
  clientEntitlement: MembershipTier;
  userId?: string;
}): Promise<EntitlementResolution> {
  const effectiveEntitlement = sanitizeEntitlement(args.clientEntitlement);

  // Future hardening hook:
  // Replace this branch with server-side RevenueCat / auth-backed verification
  // once a trusted user identity is available on the backend.
  return {
    effectiveEntitlement,
    source: "client_unverified",
  };
}
