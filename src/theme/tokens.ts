import type { PaperThemePresetId } from "@/theme/presets";
import { getQuietPaperColor, parseHexColor, mixRgb, rgbToHex } from "@/theme/paperColor";

interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  card: string;
  border: string;
  borderStrong: string;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  accent: string;
  accentSoft: string;
  paperTint: string;
  paperSurface: string;
  paperRaised: string;
  paperMuted: string;
  paperGlow: string;
  sage: string;
  clay: string;
  blueGray: string;
  overlay: string;
  overlayBackdrop: string;
  shadow: string;
  shadowStrong: string;
  binding: string;
  success: string;
  danger: string;
}

const basePalette: Record<"light" | "dark", ThemeColors> = {
  light: {
    background: "#F6F1EA",
    surface: "#FCF8F1",
    surfaceMuted: "#F3EBDD",
    card: "#FFFDF8",
    border: "#DED1C0",
    borderStrong: "#CDBCA8",
    primaryText: "#221B15",
    secondaryText: "#71655A",
    tertiaryText: "#A09284",
    accent: "#A18166",
    accentSoft: "#EEE3D6",
    paperTint: "#FBF4EA",
    paperSurface: "#FFFDF8",
    paperRaised: "#FBF4EA",
    paperMuted: "#F3EBDD",
    paperGlow: "rgba(255, 252, 246, 0.72)",
    sage: "#C7D0C3",
    clay: "#C8A691",
    blueGray: "#BAC5CD",
    overlay: "rgba(255, 252, 246, 0.72)",
    overlayBackdrop: "rgba(33, 26, 19, 0.24)",
    shadow: "rgba(53, 39, 24, 0.1)",
    shadowStrong: "rgba(53, 39, 24, 0.15)",
    binding: "#2F2C29",
    success: "#708D77",
    danger: "#9B5F50",
  },
  dark: {
    background: "#15120F",
    surface: "#1C1814",
    surfaceMuted: "#2A241D",
    card: "#241E18",
    border: "#4A3F35",
    borderStrong: "#615345",
    primaryText: "#F7F1E9",
    secondaryText: "#B9AB9F",
    tertiaryText: "#93867A",
    accent: "#D1B293",
    accentSoft: "#40342A",
    paperTint: "#2B241D",
    paperSurface: "#241E18",
    paperRaised: "#2B241D",
    paperMuted: "#2A241D",
    paperGlow: "rgba(255, 248, 240, 0.04)",
    sage: "#708170",
    clay: "#9D7E6A",
    blueGray: "#75838E",
    overlay: "rgba(255, 248, 240, 0.04)",
    overlayBackdrop: "rgba(7, 5, 4, 0.48)",
    shadow: "rgba(0, 0, 0, 0.34)",
    shadowStrong: "rgba(0, 0, 0, 0.5)",
    binding: "#0F0D0B",
    success: "#94B39B",
    danger: "#D59A8A",
  },
} as const;

const paperThemePaletteOverrides: Record<PaperThemePresetId, Partial<ThemeColors>> = {
  "warm-ivory": {
    paperSurface: "#FFFCF6",
    paperRaised: "#FBF4EA",
    paperMuted: "#F2EBDD",
    paperGlow: "rgba(255, 252, 246, 0.72)",
  },
  "soft-beige": {
    paperSurface: "#FCF7EF",
    paperRaised: "#F3E9DD",
    paperMuted: "#E8DCCB",
    paperGlow: "rgba(252, 247, 239, 0.72)",
  },
  "stone-paper": {
    paperSurface: "#F8F6F2",
    paperRaised: "#ECEAE5",
    paperMuted: "#E0DDD6",
    paperGlow: "rgba(248, 246, 242, 0.72)",
  },
  "muted-sage": {
    paperSurface: "#F5F8F5",
    paperRaised: "#E9EEE8",
    paperMuted: "#DADFD9",
    paperGlow: "rgba(245, 248, 245, 0.72)",
  },
} as const;

let activePaperThemeId: PaperThemePresetId = "warm-ivory";
let activePaperMode: "preset" | "custom" = "preset";
let activeCustomPaperColor = "#E9E2D8";

function resolveCustomLightPalette(customPaperColor: string) {
  const parsed = parseHexColor(getQuietPaperColor(customPaperColor));
  if (!parsed) {
    return resolveLightPalette();
  }

  const warmBase = { red: 246, green: 242, blue: 234 };
  const background = mixRgb(parsed, warmBase, 0.18);
  const surface = mixRgb(background, { red: 255, green: 252, blue: 246 }, 0.38);
  const muted = mixRgb(background, { red: 235, green: 226, blue: 214 }, 0.34);
  const card = mixRgb(surface, { red: 255, green: 255, blue: 252 }, 0.4);
  const accent = mixRgb(parsed, { red: 161, green: 129, blue: 102 }, 0.45);

  return {
    ...basePalette.light,
    paperSurface: rgbToHex(card),
    paperRaised: rgbToHex(surface),
    paperMuted: rgbToHex(muted),
    paperGlow: "rgba(255, 252, 246, 0.78)",
    accent: rgbToHex(accent),
    accentSoft: rgbToHex(mixRgb(surface, accent, 0.16)),
  };
}

function resolveLightPalette() {
  return {
    ...basePalette.light,
    ...paperThemePaletteOverrides[activePaperThemeId],
  };
}

export function setGlobalPaperThemeId(selection: {
  mode: "preset" | "custom";
  paperThemeId: PaperThemePresetId;
  customPaperColor: string;
}) {
  activePaperMode = selection.mode;
  activePaperThemeId = selection.paperThemeId;
  activeCustomPaperColor = selection.customPaperColor;
}

export const palette = new Proxy(basePalette, {
  get(target, property: string | symbol) {
    if (property === "light") {
      return activePaperMode === "custom"
        ? resolveCustomLightPalette(activeCustomPaperColor)
        : resolveLightPalette();
    }

    return Reflect.get(target, property);
  },
}) as typeof basePalette;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  xxxl: 40,
} as const;

export const radii = {
  sm: 14,
  md: 20,
  lg: 24,
  xl: 32,
  pill: 999,
} as const;

export type AppColorScheme = keyof typeof basePalette;
