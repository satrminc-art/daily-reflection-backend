import { APPEARANCE_PRESETS, type AppearancePresetId, type PaperThemePresetId } from "@/theme/presets";
import {
  getQuietAppBackgroundColor,
  getQuietPaperColor,
  mixRgb,
  parseHexColor,
  rgbToHex,
} from "@/theme/paperColor";
import { ensureReadableTextColorAcrossBackgrounds } from "@/utils/color/colorAdjust";
import { rgbToLuminance } from "@/utils/color/luminance";

interface ThemeColors {
  appBackground: string;
  background: string;
  surface: string;
  elevatedSurface: string;
  surfaceMuted: string;
  card: string;
  inputSurface: string;
  border: string;
  borderStrong: string;
  primaryText: string;
  secondaryText: string;
  tertiaryText: string;
  accent: string;
  accentSoft: string;
  controlActiveSurface: string;
  controlActiveText: string;
  tabBarBackground: string;
  tabBarActive: string;
  tabBarInactive: string;
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
    appBackground: "#FFFFFF",
    background: "#F6F1EA",
    surface: "#FCF8F1",
    elevatedSurface: "#FFF9F2",
    surfaceMuted: "#F3EBDD",
    card: "#FFFDF8",
    inputSurface: "#FCF8F1",
    border: "#DED1C0",
    borderStrong: "#CDBCA8",
    primaryText: "#221B15",
    secondaryText: "#71655A",
    tertiaryText: "#A09284",
    accent: "#A18166",
    accentSoft: "#EEE3D6",
    controlActiveSurface: "#A18166",
    controlActiveText: "#FFF9F2",
    tabBarBackground: "#FCF8F1",
    tabBarActive: "#221B15",
    tabBarInactive: "#71655A",
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
    appBackground: "#120E0C",
    background: "#120E0C",
    surface: "#181311",
    elevatedSurface: "#211A17",
    surfaceMuted: "#221B18",
    card: "#261E1A",
    inputSurface: "#1D1714",
    border: "#43362E",
    borderStrong: "#5F4D40",
    primaryText: "#F1E9E0",
    secondaryText: "#B8AA9E",
    tertiaryText: "#8E8074",
    accent: "#CAA684",
    accentSoft: "#3A2C21",
    controlActiveSurface: "#3A2C21",
    controlActiveText: "#E9D7C6",
    tabBarBackground: "#16110F",
    tabBarActive: "#CAA684",
    tabBarInactive: "#8E8074",
    paperTint: "#2A211C",
    paperSurface: "#2C231D",
    paperRaised: "#352A23",
    paperMuted: "#241C17",
    paperGlow: "rgba(214, 183, 149, 0.08)",
    sage: "#708170",
    clay: "#A7866E",
    blueGray: "#7A8790",
    overlay: "rgba(31, 24, 20, 0.72)",
    overlayBackdrop: "rgba(6, 4, 3, 0.62)",
    shadow: "rgba(0, 0, 0, 0.42)",
    shadowStrong: "rgba(0, 0, 0, 0.58)",
    binding: "#0D0A08",
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
let activeAppearanceMode: "default" | "preset" | "custom" = "default";
let activeAppearancePresetId: AppearancePresetId | null = null;
let activeAppBackgroundColor = "#FFFFFF";
let activeTextColorMode: "default" | "custom" = "default";
let activeCustomTextColor = "#221B15";
let activePaperMode: "preset" | "custom" = "preset";
let activeCustomPaperColor = "#E9E2D8";

function getActiveAppearancePreset() {
  return (
    APPEARANCE_PRESETS.find((preset) => preset.id === (activeAppearancePresetId ?? "classic-paper")) ?? null
  );
}

function resolveAppBackgroundColor(scheme: "light" | "dark", appBackgroundColor: string) {
  const parsed = parseHexColor(getQuietAppBackgroundColor(appBackgroundColor, "#FFFFFF"));
  if (!parsed || rgbToHex(parsed) === "#FFFFFF") {
    return basePalette[scheme].appBackground;
  }

  const isDarkBase = rgbToLuminance(parsed) < 0.56;

  if (!isDarkBase) {
    return rgbToHex(parsed);
  }

  const background = mixRgb(parsed, { red: 26, green: 20, blue: 17 }, scheme === "dark" ? 0.12 : 0.04);
  return rgbToHex(background);
}

function applyReadableTextSet(palette: ThemeColors, targetPrimary: string) {
  const readablePrimary = ensureReadableTextColorAcrossBackgrounds(
    targetPrimary,
    [palette.paperSurface, palette.surface, palette.card, palette.inputSurface, palette.appBackground],
    palette.primaryText,
    4.5,
  ).color;
  const primary = parseHexColor(readablePrimary);
  const defaultSecondary = parseHexColor(palette.secondaryText);
  const defaultTertiary = parseHexColor(palette.tertiaryText);

  if (!primary || !defaultSecondary || !defaultTertiary) {
    return palette;
  }

  const secondaryCandidate = rgbToHex(mixRgb(primary, defaultSecondary, 0.4));
  const tertiaryCandidate = rgbToHex(mixRgb(primary, defaultTertiary, 0.58));

  return {
    ...palette,
    primaryText: readablePrimary,
    secondaryText: ensureReadableTextColorAcrossBackgrounds(
      secondaryCandidate,
      [palette.paperSurface, palette.surface, palette.card, palette.inputSurface, palette.appBackground],
      palette.secondaryText,
      3.3,
    ).color,
    tertiaryText: ensureReadableTextColorAcrossBackgrounds(
      tertiaryCandidate,
      [palette.paperSurface, palette.surface, palette.card, palette.inputSurface, palette.appBackground],
      palette.tertiaryText,
      2.6,
    ).color,
  };
}

function applyTextColorOverrides(palette: ThemeColors) {
  if (activeTextColorMode !== "custom") {
    return palette;
  }

  return applyReadableTextSet(palette, activeCustomTextColor);
}

function buildPresetPalette(
  base: ThemeColors,
  scheme: "light" | "dark",
  preset: { appBackground: string; paper: string; text: string },
) {
  const backgroundColor = resolveAppBackgroundColor(scheme, preset.appBackground);
  const paperBase = parseHexColor(getQuietPaperColor(preset.paper, preset.paper));
  const backgroundBase = parseHexColor(backgroundColor);

  if (!paperBase || !backgroundBase) {
    return applyTextColorOverrides({
      ...base,
      appBackground: backgroundColor,
    });
  }

  const paperRaised = rgbToHex(mixRgb(paperBase, backgroundBase, scheme === "dark" ? 0.12 : 0.08));
  const paperMuted = rgbToHex(mixRgb(paperBase, backgroundBase, scheme === "dark" ? 0.22 : 0.16));
  const paperSurface = rgbToHex(mixRgb(paperBase, { red: 255, green: 252, blue: 246 }, scheme === "dark" ? 0.04 : 0.18));

  return applyReadableTextSet(
    {
      ...base,
      appBackground: backgroundColor,
      paperSurface,
      paperRaised,
      paperMuted,
      paperGlow: scheme === "dark" ? "rgba(243, 233, 223, 0.08)" : "rgba(255, 252, 246, 0.74)",
      accentSoft: rgbToHex(mixRgb(parseHexColor(base.accentSoft) ?? { red: 238, green: 227, blue: 214 }, paperBase, 0.18)),
    },
    preset.text,
  );
}

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

  return applyTextColorOverrides({
    ...basePalette.light,
    appBackground: resolveAppBackgroundColor("light", activeAppBackgroundColor),
    paperSurface: rgbToHex(card),
    paperRaised: rgbToHex(surface),
    paperMuted: rgbToHex(muted),
    paperGlow: "rgba(255, 252, 246, 0.78)",
    accent: rgbToHex(accent),
    accentSoft: rgbToHex(mixRgb(surface, accent, 0.16)),
  });
}

function resolveLightPalette() {
  if (activeAppearanceMode === "default") {
    return {
      ...basePalette.light,
      ...paperThemePaletteOverrides["warm-ivory"],
    };
  }

  const activePreset = activeAppearanceMode === "preset" ? getActiveAppearancePreset() : null;

  if (activePreset) {
    return buildPresetPalette(
      {
        ...basePalette.light,
        ...paperThemePaletteOverrides[activePaperThemeId],
      },
      "light",
      activePreset,
    );
  }

  return applyTextColorOverrides({
    ...basePalette.light,
    appBackground: resolveAppBackgroundColor("light", activeAppBackgroundColor),
    ...paperThemePaletteOverrides[activePaperThemeId],
  });
}

export function setGlobalPaperThemeId(selection: {
  appearanceMode: "default" | "preset" | "custom";
  appearancePresetId: AppearancePresetId | null;
  appBackgroundColor: string;
  textColorMode: "default" | "custom";
  customTextColor: string;
  mode: "preset" | "custom";
  paperThemeId: PaperThemePresetId;
  customPaperColor: string;
}) {
  activeAppearanceMode = selection.appearanceMode;
  activeAppearancePresetId = selection.appearancePresetId;
  activeAppBackgroundColor = selection.appBackgroundColor;
  activeTextColorMode = selection.textColorMode;
  activeCustomTextColor = selection.customTextColor;
  activePaperMode = selection.mode;
  activePaperThemeId = selection.paperThemeId;
  activeCustomPaperColor = selection.customPaperColor;
}

export const palette = new Proxy(basePalette, {
  get(target, property: string | symbol) {
    if (property === "light") {
      if (activeAppearanceMode === "default") {
        return resolveLightPalette();
      }

      return activeAppearanceMode === "custom" && activePaperMode === "custom"
        ? resolveCustomLightPalette(activeCustomPaperColor)
        : resolveLightPalette();
    }

    if (property === "dark") {
      if (activeAppearanceMode === "default") {
        return basePalette.dark;
      }

      const activePreset = activeAppearanceMode === "preset" ? getActiveAppearancePreset() : null;

      if (activePreset) {
        return buildPresetPalette(basePalette.dark, "dark", activePreset);
      }

      return applyTextColorOverrides({
        ...basePalette.dark,
        appBackground: resolveAppBackgroundColor("dark", activeAppBackgroundColor),
      });
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
