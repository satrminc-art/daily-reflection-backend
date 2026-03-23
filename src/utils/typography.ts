import { Platform } from "react-native";
import type { TypographyPresetId } from "@/theme/presets";

const editorialSerifFamily = Platform.select({
  ios: "Georgia",
  android: "serif",
  default: "serif",
});

const sansFamily = Platform.select({
  ios: "System",
  android: "sans-serif",
  default: "sans-serif",
});

const typewriterFamily = Platform.select({
  ios: "Menlo",
  android: "monospace",
  default: "monospace",
});

export interface TypographyRoles {
  display: string;
  body: string;
  meta: string;
  action: string;
  specimen: string;
}

const typographyByPreset: Record<TypographyPresetId, TypographyRoles> = {
  "editorial-serif": {
    display: editorialSerifFamily,
    body: sansFamily,
    meta: sansFamily,
    action: sansFamily,
    specimen: editorialSerifFamily,
  },
  "quiet-sans": {
    display: sansFamily,
    body: sansFamily,
    meta: sansFamily,
    action: sansFamily,
    specimen: sansFamily,
  },
  "subtle-typewriter": {
    display: typewriterFamily,
    body: sansFamily,
    meta: typewriterFamily,
    action: sansFamily,
    specimen: typewriterFamily,
  },
};

export function resolveTypographyRoles(presetId: TypographyPresetId): TypographyRoles {
  return typographyByPreset[presetId] ?? typographyByPreset["editorial-serif"];
}

export const fonts = {
  editorialSerif: editorialSerifFamily,
  sans: sansFamily,
  mono: typewriterFamily,
} as const;
