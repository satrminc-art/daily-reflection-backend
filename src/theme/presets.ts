export interface PremiumPreset<T extends string> {
  id: T;
  name: string;
  description: string;
  availability: "included" | "future_premium";
}

export interface PaperThemePreset<T extends string> extends PremiumPreset<T> {
  swatch: string;
}

export interface AppBackgroundPreset<T extends string> extends PremiumPreset<T> {
  swatch: string;
}

export interface AppearancePreset<T extends string> extends PremiumPreset<T> {
  appBackground: string;
  paper: string;
  text: string;
  note?: "recommended" | "balanced" | "warm-calm" | "readable" | "quiet";
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
    description: "A restrained monospaced accent for quieter premium themes.",
    specimen: "A gentler pace",
    availability: "future_premium",
  },
] as const satisfies readonly TypographyPreset<string>[];

export const APP_BACKGROUND_PRESETS = [
  {
    id: "ivory",
    name: "Ivory",
    description: "A bright calm base with almost no tint.",
    swatch: "#FFFFFF",
    availability: "future_premium",
  },
  {
    id: "warm-paper",
    name: "Warm Paper",
    description: "A soft cream ground with a little more warmth.",
    swatch: "#F5F1EB",
    availability: "future_premium",
  },
  {
    id: "sand",
    name: "Sand",
    description: "A quiet beige foundation with gentle depth.",
    swatch: "#E9DFD2",
    availability: "future_premium",
  },
  {
    id: "walnut",
    name: "Walnut",
    description: "A deep brown desk-like tone for a richer backdrop.",
    swatch: "#5A4638",
    availability: "future_premium",
  },
  {
    id: "charcoal",
    name: "Charcoal",
    description: "A muted charcoal field with soft contrast.",
    swatch: "#413A36",
    availability: "future_premium",
  },
  {
    id: "night-grey",
    name: "Night Grey",
    description: "A quieter grey with a slightly cooler dusk feel.",
    swatch: "#4A4A4E",
    availability: "future_premium",
  },
] as const satisfies readonly AppBackgroundPreset<string>[];

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

export const APPEARANCE_PRESETS = [
  {
    id: "classic-paper",
    name: "Classic Paper",
    description: "The original calm balance of paper, space, and restraint.",
    appBackground: "#F5F3EF",
    paper: "#E9E2D8",
    text: "#2A2623",
    note: "recommended",
    availability: "future_premium",
  },
  {
    id: "warm-ivory-style",
    name: "Warm Ivory",
    description: "A warm cream atmosphere with soft literary contrast.",
    appBackground: "#F7F1E8",
    paper: "#EADFCF",
    text: "#3A2F28",
    note: "warm-calm",
    availability: "future_premium",
  },
  {
    id: "stone-paper-style",
    name: "Stone Paper",
    description: "Mineral neutrals for a quieter, more architectural page.",
    appBackground: "#ECEBE8",
    paper: "#DCDAD4",
    text: "#2E2E2E",
    note: "balanced",
    availability: "future_premium",
  },
  {
    id: "soft-rose",
    name: "Soft Rose",
    description: "A faint rose haze with softened editorial warmth.",
    appBackground: "#F4E9EC",
    paper: "#EAD6DB",
    text: "#3A2A2F",
    note: "warm-calm",
    availability: "future_premium",
  },
  {
    id: "mist-grey",
    name: "Mist Grey",
    description: "A pale grey atmosphere with quiet clarity.",
    appBackground: "#F2F2F2",
    paper: "#E0E0E0",
    text: "#2C2C2C",
    note: "readable",
    availability: "future_premium",
  },
  {
    id: "midnight-ink",
    name: "Midnight Ink",
    description: "A duskier desk tone with softened paper lift.",
    appBackground: "#1C1C1E",
    paper: "#2C2C2E",
    text: "#F2F2F2",
    note: "readable",
    availability: "future_premium",
  },
  {
    id: "olive-note",
    name: "Olive Note",
    description: "A muted olive field with restrained paper calm.",
    appBackground: "#EEF1EA",
    paper: "#DDE3D6",
    text: "#2F332B",
    note: "balanced",
    availability: "future_premium",
  },
  {
    id: "sand-journal",
    name: "Sand Journal",
    description: "A grounded beige rhythm with journal-like warmth.",
    appBackground: "#F6EBDD",
    paper: "#EEDCC7",
    text: "#3A3128",
    note: "warm-calm",
    availability: "future_premium",
  },
  {
    id: "quiet-blue",
    name: "Quiet Blue",
    description: "A softened blue-grey for cooler, reflective pages.",
    appBackground: "#EAF1F6",
    paper: "#D6E3EC",
    text: "#2A3440",
    note: "quiet",
    availability: "future_premium",
  },
  {
    id: "charcoal-paper",
    name: "Charcoal Paper",
    description: "A dark paper atmosphere with elegant off-white reading tone.",
    appBackground: "#2B2B2B",
    paper: "#3A3A3A",
    text: "#F5F5F5",
    note: "balanced",
    availability: "future_premium",
  },
] as const satisfies readonly AppearancePreset<string>[];

export type PaperThemePresetId = (typeof PAPER_THEME_PRESETS)[number]["id"];
export type AppBackgroundPresetId = (typeof APP_BACKGROUND_PRESETS)[number]["id"];
export type TypographyPresetId = (typeof TYPOGRAPHY_PRESETS)[number]["id"];
export type PageStylePresetId = (typeof PAGE_STYLE_PRESETS)[number]["id"];
export type AppearancePresetId = (typeof APPEARANCE_PRESETS)[number]["id"];
