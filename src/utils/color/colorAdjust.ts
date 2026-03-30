import { getContrastRatio, getMinimumContrastRatio, hexToRgb } from "@/utils/color/contrast";

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function mixHex(left: string, right: string, weight: number) {
  const a = hexToRgb(left);
  const b = hexToRgb(right);
  if (!a || !b) {
    return right;
  }

  const mixed = {
    red: clampChannel(a.red * (1 - weight) + b.red * weight),
    green: clampChannel(a.green * (1 - weight) + b.green * weight),
    blue: clampChannel(a.blue * (1 - weight) + b.blue * weight),
  };

  return `#${mixed.red.toString(16).padStart(2, "0")}${mixed.green.toString(16).padStart(2, "0")}${mixed.blue
    .toString(16)
    .padStart(2, "0")}`.toUpperCase();
}

export function ensureReadableTextColor(
  textColor: string,
  backgroundColor: string,
  fallbackColor: string,
  minContrast = 4.5,
) {
  const candidate = ensureReadableTextColorAcrossBackgrounds(textColor, [backgroundColor], fallbackColor, minContrast);
  return {
    ...candidate,
    ratio: getContrastRatio(candidate.color, backgroundColor),
  };
}

export function ensureReadableTextColorAcrossBackgrounds(
  textColor: string,
  backgroundColors: string[],
  fallbackColor: string,
  minContrast = 4.5,
) {
  const initial = hexToRgb(textColor);
  const fallback = hexToRgb(fallbackColor);
  const backgrounds = backgroundColors.filter((value) => Boolean(hexToRgb(value)));

  if (!initial || !fallback || backgrounds.length === 0) {
    return {
      color: fallbackColor,
      adjusted: textColor.toUpperCase() !== fallbackColor.toUpperCase(),
      ratio: getMinimumContrastRatio(fallbackColor, backgroundColors),
    };
  }

  let candidate = textColor.toUpperCase();
  const rawRatio = getMinimumContrastRatio(candidate, backgroundColors);

  if (rawRatio >= minContrast) {
    return { color: candidate, adjusted: false, ratio: rawRatio };
  }

  for (let step = 0; step < 10; step += 1) {
    candidate = mixHex(candidate, fallbackColor, 0.18);
    const ratio = getMinimumContrastRatio(candidate, backgroundColors);
    if (ratio >= minContrast) {
      return { color: candidate, adjusted: true, ratio };
    }
  }

  return {
    color: fallbackColor,
    adjusted: true,
    ratio: getMinimumContrastRatio(fallbackColor, backgroundColors),
  };
}
