import { SubscriptionStatusRecord } from "../domain/entities";
import { supabaseAdminRequest } from "../lib/supabaseAdmin";

type SupabaseSubscriptionRow = {
  id: string;
  user_id: string;
  provider: string;
  product_id: string;
  entitlement_id: string | null;
  tier: SubscriptionStatusRecord["tier"];
  status: string;
  expires_at: string | null;
  is_lifetime: boolean;
  raw_payload?: unknown;
  updated_at: string;
};

function mapSubscriptionStatus(row: SupabaseSubscriptionRow): SubscriptionStatusRecord {
  return {
    id: row.id,
    userId: row.user_id,
    provider: row.provider,
    productId: row.product_id,
    entitlementId: row.entitlement_id,
    tier: row.tier,
    status: row.status,
    expiresAt: row.expires_at,
    isLifetime: row.is_lifetime,
    rawPayload: row.raw_payload,
    updatedAt: row.updated_at,
  };
}

export async function getSubscriptionStatusForUser(userId: string): Promise<SubscriptionStatusRecord | null> {
  const rows = await supabaseAdminRequest<SupabaseSubscriptionRow[]>(
    `/subscription_status?user_id=eq.${userId}&select=*&order=updated_at.desc&limit=1`,
  );

  return rows?.[0] ? mapSubscriptionStatus(rows[0]) : null;
}

export async function upsertSubscriptionStatus(record: SubscriptionStatusRecord) {
  const rows = await supabaseAdminRequest<SupabaseSubscriptionRow[]>(
    "/subscription_status?on_conflict=id",
    {
      method: "POST",
      body: [
        {
          id: record.id,
          user_id: record.userId,
          provider: record.provider,
          product_id: record.productId,
          entitlement_id: record.entitlementId,
          tier: record.tier,
          status: record.status,
          expires_at: record.expiresAt,
          is_lifetime: record.isLifetime,
          raw_payload: record.rawPayload,
          updated_at: record.updatedAt,
        },
      ],
    },
  );

  return rows?.[0] ? mapSubscriptionStatus(rows[0]) : null;
}
