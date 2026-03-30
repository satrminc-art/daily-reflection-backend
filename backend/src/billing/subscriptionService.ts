import { SubscriptionStatusRecord } from "../domain/entities";
import { normalizeSubscriptionStatus as normalizeRecord } from "../services/subscriptionStatusService";

export function normalizeSubscriptionStatus(record: SubscriptionStatusRecord | null) {
  return normalizeRecord(record);
}
