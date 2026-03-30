import {
  APPEARANCE_PRESETS,
  PAGE_STYLE_PRESETS,
  PAPER_THEME_PRESETS,
  TYPOGRAPHY_PRESETS,
  type AppearancePreset,
  type AppearancePresetId,
  type PageStylePreset,
  type PageStylePresetId,
  type PaperThemePreset,
  type PaperThemePresetId,
  type TypographyPreset,
  type TypographyPresetId,
} from "@/theme/presets";

export interface PersonalizationSelection {
  appearanceStyle: AppearancePreset<AppearancePresetId>;
  paperTone: PaperThemePreset<PaperThemePresetId>;
  fontStyle: TypographyPreset<TypographyPresetId>;
  pageStyle: PageStylePreset<PageStylePresetId>;
}

function findPreset<T extends { id: string }>(items: readonly T[], id: string, fallbackId: string): T {
  return items.find((item) => item.id === id) || items.find((item) => item.id === fallbackId) || items[0];
}

export function resolvePersonalizationSelection(input: {
  selectedAppearancePresetId?: string | null;
  paperThemeId: string;
  typographyPresetId: string;
  pageStyleId: string;
}): PersonalizationSelection {
  return {
    appearanceStyle: findPreset(
      APPEARANCE_PRESETS,
      input.selectedAppearancePresetId ?? "classic-paper",
      "classic-paper",
    ) as AppearancePreset<AppearancePresetId>,
    paperTone: findPreset(PAPER_THEME_PRESETS, input.paperThemeId, "warm-ivory") as PaperThemePreset<PaperThemePresetId>,
    fontStyle: findPreset(
      TYPOGRAPHY_PRESETS,
      input.typographyPresetId,
      "editorial-serif",
    ) as TypographyPreset<TypographyPresetId>,
    pageStyle: findPreset(
      PAGE_STYLE_PRESETS,
      input.pageStyleId,
      "classic-tearoff",
    ) as PageStylePreset<PageStylePresetId>,
  };
}
