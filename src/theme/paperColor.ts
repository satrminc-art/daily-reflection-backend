export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function normalizeHexInput(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, "").replace(/^#/, "").toUpperCase();
}

export function formatHexInputDisplay(value: string | null | undefined) {
  const normalized = normalizeHexInput(value);
  return normalized ? `#${normalized}` : "#";
}

export function isValidHexColorInput(value: string | null | undefined) {
  return /^[0-9A-F]{6}$/.test(normalizeHexInput(value));
}

export function isHexColorInputPotentiallyValid(value: string | null | undefined) {
  const normalized = normalizeHexInput(value);
  return normalized.length <= 6 && /^[0-9A-F]*$/.test(normalized);
}

export function parseHexColor(hex: string | null | undefined): RgbColor | null {
  const normalized = normalizeHexInput(hex);
  if (!normalized) {
    return null;
  }

  if (!isValidHexColorInput(normalized)) {
    return null;
  }

  return {
    red: parseInt(normalized.slice(0, 2), 16),
    green: parseInt(normalized.slice(2, 4), 16),
    blue: parseInt(normalized.slice(4, 6), 16),
  };
}

export function rgbToHex(color: RgbColor) {
  return `#${clampChannel(color.red).toString(16).padStart(2, "0")}${clampChannel(color.green)
    .toString(16)
    .padStart(2, "0")}${clampChannel(color.blue).toString(16).padStart(2, "0")}`.toUpperCase();
}

export function mixRgb(left: RgbColor, right: RgbColor, weight: number): RgbColor {
  return {
    red: clampChannel(left.red * (1 - weight) + right.red * weight),
    green: clampChannel(left.green * (1 - weight) + right.green * weight),
    blue: clampChannel(left.blue * (1 - weight) + right.blue * weight),
  };
}

export function getRelativeLuminance(color: RgbColor) {
  const toLinear = (channel: number) => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * toLinear(color.red) + 0.7152 * toLinear(color.green) + 0.0722 * toLinear(color.blue);
}

export function getContrastRatio(foreground: RgbColor, background: RgbColor) {
  const lighter = Math.max(getRelativeLuminance(foreground), getRelativeLuminance(background));
  const darker = Math.min(getRelativeLuminance(foreground), getRelativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
}

export function ensureReadableHexOnBackgrounds(
  foregroundHex: string | null | undefined,
  backgroundHexes: Array<string | null | undefined>,
  fallbackHex: string,
  minContrast = 4.5,
) {
  const fallback = parseHexColor(fallbackHex);
  const foreground = parseHexColor(foregroundHex);
  const backgrounds = backgroundHexes
    .map((value) => parseHexColor(value))
    .filter((value): value is RgbColor => Boolean(value));

  if (!fallback || !foreground || backgrounds.length === 0) {
    return fallbackHex;
  }

  let candidate = foreground;

  for (let step = 0; step < 8; step += 1) {
    const readable = backgrounds.every((background) => getContrastRatio(candidate, background) >= minContrast);
    if (readable) {
      return rgbToHex(candidate);
    }

    candidate = mixRgb(candidate, fallback, 0.18);
  }

  return fallbackHex;
}

export function sanitizeCustomPaperColor(hex: string | null | undefined, fallback = "#E9E2D8") {
  const parsed = parseHexColor(hex);
  if (!parsed) {
    return fallback;
  }

  return rgbToHex(parsed);
}

export function getQuietPaperColor(hex: string | null | undefined, fallback = "#E9E2D8") {
  const parsed = parseHexColor(sanitizeCustomPaperColor(hex, fallback));
  if (!parsed) {
    return fallback;
  }

  const quietWarm = { red: 238, green: 229, blue: 217 };
  const softened = mixRgb(parsed, quietWarm, 0.42);
  const lifted = mixRgb(softened, { red: 255, green: 252, blue: 246 }, 0.28);
  return rgbToHex(lifted);
}

export function getQuietNoteColor(hex: string | null | undefined, fallback = "#FFFFFF") {
  const normalized = sanitizeCustomPaperColor(hex, fallback);
  if (normalized === "#FFFFFF") {
    return normalized;
  }

  const parsed = parseHexColor(normalized);
  if (!parsed) {
    return fallback;
  }

  const softened = mixRgb(parsed, { red: 245, green: 241, blue: 236 }, 0.28);
  const lifted = mixRgb(softened, { red: 255, green: 255, blue: 255 }, 0.24);
  return rgbToHex(lifted);
}

export function getQuietAppBackgroundColor(hex: string | null | undefined, fallback = "#FFFFFF") {
  const normalized = sanitizeCustomPaperColor(hex, fallback);
  if (normalized === "#FFFFFF") {
    return normalized;
  }

  const parsed = parseHexColor(normalized);
  if (!parsed) {
    return fallback;
  }

  const softened = mixRgb(parsed, { red: 244, green: 238, blue: 231 }, 0.18);
  return rgbToHex(softened);
}
