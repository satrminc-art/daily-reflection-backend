export interface RevenueCatWebhookEvent {
  event: {
    type: string;
    app_user_id?: string | null;
    original_app_user_id?: string | null;
    product_id?: string | null;
    entitlement_ids?: string[] | null;
    expiration_at_ms?: number | null;
    original_transaction_id?: string | null;
    aliases?: string[] | null;
  };
}
