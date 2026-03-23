export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

function clampChannel(value: number) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function parseHexColor(hex: string | null | undefined): RgbColor | null {
  if (!hex) {
    return null;
  }

  const normalized = hex.trim().replace("#", "");
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) {
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
