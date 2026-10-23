export type Rgb = { r: number; g: number; b: number };
export type Hsv = { h: number; s: number; v: number };
const clamp = (value: number, max: number) => Math.min(max, Math.max(0, Number.isFinite(value) ? value : 0));

export function hexToRgb(hex: string): Rgb {
  const value = /^#[0-9a-f]{6}$/i.test(hex) ? hex : "#000000";
  return { r: parseInt(value.slice(1, 3), 16), g: parseInt(value.slice(3, 5), 16), b: parseInt(value.slice(5, 7), 16) };
}
export function rgbToHex({ r, g, b }: Rgb): string {
  return "#" + [r, g, b].map(value => Math.round(clamp(value, 255)).toString(16).padStart(2, "0")).join("");
}
export function rgbToHsv(rgb: Rgb): Hsv {
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(value => clamp(value, 255) / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), delta = max - min;
  const hue = delta === 0 ? 0 : max === r ? (g - b) / delta : max === g ? (b - r) / delta + 2 : (r - g) / delta + 4;
  return { h: (hue * 60 + 360) % 360, s: max === 0 ? 0 : delta / max * 100, v: max * 100 };
}
export function hsvToHex({ h, s, v }: Hsv): string {
  const hue = ((Number.isFinite(h) ? h : 0) % 360 + 360) % 360 / 60;
  const saturation = clamp(s, 100) / 100, value = clamp(v, 100) / 100;
  const c = value * saturation, x = c * (1 - Math.abs(hue % 2 - 1)), m = value - c;
  const sectors = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]];
  const [r, g, b] = sectors[Math.floor(hue)].map(channel => (channel + m) * 255);
  return rgbToHex({ r, g, b });
}
