import type { MembershipTier } from "@/types/membership";

export type MembershipFeatureCategoryId =
  | "design"
  | "archive"
  | "languages"
  | "ritual"
  | "export";

export type MembershipFeatureId =
  | "premium-paper-colors"
  | "premium-typography"
  | "premium-layouts"
  | "unlimited-archive"
  | "unlimited-saved"
  | "extended-notes"
  | "search-filter"
  | "advanced-saved-management"
  | "personal-collections"
  | "quote-language-choice"
  | "multiple-quote-languages"
  | "daily-language-rotation"
  | "deeper-personalization"
  | "reflection-prompts"
  | "save-reason"
  | "weekly-recap"
  | "monthly-recap"
  | "email-export"
  | "pdf-export"
  | "year-end-reminder";

export interface MembershipFeatureDefinition {
  id: MembershipFeatureId;
  category: MembershipFeatureCategoryId;
  premiumOnly: boolean;
  live: boolean;
}

export const MEMBERSHIP_FEATURES: readonly MembershipFeatureDefinition[] = [
  { id: "premium-paper-colors", category: "design", premiumOnly: true, live: true },
  { id: "premium-typography", category: "design", premiumOnly: true, live: true },
  { id: "premium-layouts", category: "design", premiumOnly: true, live: true },
  { id: "unlimited-archive", category: "archive", premiumOnly: false, live: true },
  { id: "unlimited-saved", category: "archive", premiumOnly: true, live: true },
  { id: "extended-notes", category: "ritual", premiumOnly: true, live: true },
  { id: "search-filter", category: "archive", premiumOnly: true, live: true },
  { id: "advanced-saved-management", category: "archive", premiumOnly: true, live: true },
  { id: "personal-collections", category: "archive", premiumOnly: true, live: true },
  { id: "quote-language-choice", category: "languages", premiumOnly: true, live: true },
  { id: "multiple-quote-languages", category: "languages", premiumOnly: true, live: true },
  { id: "daily-language-rotation", category: "languages", premiumOnly: true, live: false },
  { id: "deeper-personalization", category: "languages", premiumOnly: true, live: false },
  { id: "reflection-prompts", category: "ritual", premiumOnly: true, live: false },
  { id: "save-reason", category: "ritual", premiumOnly: true, live: false },
  { id: "weekly-recap", category: "ritual", premiumOnly: true, live: false },
  { id: "monthly-recap", category: "ritual", premiumOnly: true, live: false },
  { id: "email-export", category: "export", premiumOnly: true, live: true },
  { id: "pdf-export", category: "export", premiumOnly: true, live: true },
  { id: "year-end-reminder", category: "export", premiumOnly: true, live: true },
] as const;

export const MEMBERSHIP_FEATURE_CATEGORIES: readonly MembershipFeatureCategoryId[] = [
  "design",
  "archive",
  "languages",
  "ritual",
  "export",
] as const;

export const FREEMIUM_FEATURE_IDS: readonly MembershipFeatureId[] = ["unlimited-archive"] as const;

export const PREMIUM_FEATURE_IDS: readonly MembershipFeatureId[] = MEMBERSHIP_FEATURES
  .filter((feature) => feature.premiumOnly)
  .map((feature) => feature.id);

export const MEMBERSHIP_PLAN_FEATURES: Record<MembershipTier, readonly MembershipFeatureId[]> = {
  freemium: FREEMIUM_FEATURE_IDS,
  premium: [...FREEMIUM_FEATURE_IDS, ...PREMIUM_FEATURE_IDS],
  lifelong: [...FREEMIUM_FEATURE_IDS, ...PREMIUM_FEATURE_IDS],
} as const;
