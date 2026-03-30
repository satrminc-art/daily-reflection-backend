export interface ColorRgb {
  red: number;
  green: number;
  blue: number;
}

function toLinear(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

export function rgbToLuminance(color: ColorRgb) {
  return 0.2126 * toLinear(color.red) + 0.7152 * toLinear(color.green) + 0.0722 * toLinear(color.blue);
}
