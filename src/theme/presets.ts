export interface PremiumPreset<T extends string> {
  id: T;
  name: string;
  description: string;
  availability: "included" | "future_premium";
}

export interface PaperThemePreset<T extends string> extends PremiumPreset<T> {
  swatch: string;
}

export interface TypographyPreset<T extends string> extends PremiumPreset<T> {
  specimen: string;
}

export interface PageStylePreset<T extends string> extends PremiumPreset<T> {
  mood: string;
}

export const PAPER_THEME_PRESETS = [
  {
    id: "warm-ivory",
    name: "Warm Ivory",
    description: "A soft cream page with warm contrast.",
    swatch: "#F6EFE5",
    availability: "included",
  },
  {
    id: "soft-beige",
    name: "Soft Beige",
    description: "A slightly deeper paper tone with gentle warmth.",
    swatch: "#EDE1D0",
    availability: "future_premium",
  },
  {
    id: "stone-paper",
    name: "Stone Paper",
    description: "Muted mineral neutrals for a quieter look.",
    swatch: "#E5DED5",
    availability: "future_premium",
  },
  {
    id: "muted-sage",
    name: "Muted Sage",
    description: "A restrained green-gray tint with soft calm.",
    swatch: "#D5DDD2",
    availability: "future_premium",
  },
] as const satisfies readonly PaperThemePreset<string>[];

export const TYPOGRAPHY_PRESETS = [
  {
    id: "editorial-serif",
    name: "Editorial Serif",
    description: "Elegant serif-led contrast for the daily page.",
    specimen: "Quiet clarity",
    availability: "included",
  },
  {
    id: "quiet-sans",
    name: "Quiet Sans",
    description: "A cleaner low-noise rhythm for archive and settings.",
    specimen: "Steady attention",
    availability: "future_premium",
  },
  {
    id: "subtle-typewriter",
    name: "Subtle Typewriter",
    description: "A restrained monospaced accent for future premium themes.",
    specimen: "A gentler pace",
    availability: "future_premium",
  },
] as const satisfies readonly TypographyPreset<string>[];

export const PAGE_STYLE_PRESETS = [
  {
    id: "classic-tearoff",
    name: "Classic Tear-off",
    description: "A clean bound page with generous whitespace and a centered question.",
    mood: "Desk calendar",
    availability: "included",
  },
  {
    id: "framed-editorial",
    name: "Framed Editorial",
    description: "A lighter rule-based page with a more journal-like composition.",
    mood: "Printed essay page",
    availability: "future_premium",
  },
  {
    id: "soft-ledger",
    name: "Soft Ledger",
    description: "A gentle structured page with understated date framing.",
    mood: "Paper record",
    availability: "future_premium",
  },
] as const satisfies readonly PageStylePreset<string>[];

export type PaperThemePresetId = (typeof PAPER_THEME_PRESETS)[number]["id"];
export type TypographyPresetId = (typeof TYPOGRAPHY_PRESETS)[number]["id"];
export type PageStylePresetId = (typeof PAGE_STYLE_PRESETS)[number]["id"];
