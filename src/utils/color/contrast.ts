import { ColorRgb, rgbToLuminance } from "@/utils/color/luminance";

export function hexToRgb(value: string | null | undefined): ColorRgb | null {
  const normalized = (value ?? "").trim().replace(/\s+/g, "").replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(normalized)) {
    return null;
  }

  return {
    red: parseInt(normalized.slice(0, 2), 16),
    green: parseInt(normalized.slice(2, 4), 16),
    blue: parseInt(normalized.slice(4, 6), 16),
  };
}

export function getContrastRatio(colorA: string | ColorRgb, colorB: string | ColorRgb) {
  const resolvedA = typeof colorA === "string" ? hexToRgb(colorA) : colorA;
  const resolvedB = typeof colorB === "string" ? hexToRgb(colorB) : colorB;
  if (!resolvedA || !resolvedB) {
    return 1;
  }

  const luminanceA = rgbToLuminance(resolvedA);
  const luminanceB = rgbToLuminance(resolvedB);
  const lighter = Math.max(luminanceA, luminanceB);
  const darker = Math.min(luminanceA, luminanceB);

  return (lighter + 0.05) / (darker + 0.05);
}

export function getMinimumContrastRatio(foreground: string, backgrounds: string[]) {
  return backgrounds.reduce((minimum, background) => {
    return Math.min(minimum, getContrastRatio(foreground, background));
  }, Number.POSITIVE_INFINITY);
}
