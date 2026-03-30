export type AnalyticsEventName =
  | "onboarding_started"
  | "onboarding_completed"
  | "reflection_preview_seen"
  | "paywall_seen"
  | "continue_free"
  | "purchase_started"
  | "purchase_completed"
  | "notification_permission_allowed"
  | "notification_permission_denied"
  | "save_attempted"
  | "locked_feature_seen";

export function trackAppEvent(name: AnalyticsEventName, properties?: Record<string, string | number | boolean | null | undefined>) {
  if (__DEV__) {
    console.info("[analytics]", name, properties ?? {});
  }
}
