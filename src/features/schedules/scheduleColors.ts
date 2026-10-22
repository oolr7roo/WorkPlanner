import type { ColorSettings, Schedule } from "./types";

export function defaultColorSettings(): ColorSettings {
  return { version: 1, activePresetId: "default", presets: [
    { id: "default", name: "기본 단계별 색상", colors: ["#3366dd", "#16845b", "#c56a15", "#8053bd"] },
  ] };
}

export function validateColorSettings(value: unknown): string {
  if (!value || typeof value !== "object") return "색상 설정 형식을 확인해 주세요.";
  const settings = value as ColorSettings;
  if (settings.version !== 1 || typeof settings.activePresetId !== "string" || !Array.isArray(settings.presets) || !settings.presets.length) return "색상 프리셋을 하나 이상 선택해 주세요.";
  const ids = new Set<string>();
  for (const preset of settings.presets) {
    if (!preset || typeof preset.id !== "string" || !preset.id.trim() || ids.has(preset.id)
      || typeof preset.name !== "string" || !preset.name.trim()) return "프리셋 이름과 고유한 식별자가 필요합니다.";
    ids.add(preset.id);
    if (!Array.isArray(preset.colors) || !preset.colors.every(color => typeof color === "string" && /^#[0-9a-f]{6}$/i.test(color))
      || new Set(preset.colors.map(color => color.toLowerCase())).size < 2) return "각 프리셋에 서로 다른 색상을 최소 2개 지정해 주세요.";
  }
  return ids.has(settings.activePresetId) ? "" : "활성 프리셋을 선택해 주세요.";
}

export function colorAtDepth(depth: number, colors: readonly string[], parentColor?: string): string {
  const start = depth % colors.length;
  for (let offset = 0; offset < colors.length; offset++) {
    const color = colors[(start + offset) % colors.length];
    if (color.toLowerCase() !== parentColor?.toLowerCase()) return color;
  }
  return colors[start];
}

export function resolveScheduleColors(items: Schedule[], colors: readonly string[]): Schedule[] {
  const byId = new Map(items.map(item => [item.id, item]));
  const resolved = new Map<string, { depth: number; color: string }>();
  const resolve = (item: Schedule): { depth: number; color: string } => {
    const cached = resolved.get(item.id);
    if (cached) return cached;
    const parent = item.parentId ? byId.get(item.parentId) : undefined;
    const above = parent ? resolve(parent) : undefined;
    const depth = above ? above.depth + 1 : 0;
    const result = { depth, color: item.colorMode === "auto" ? colorAtDepth(depth, colors, above?.color) : item.color ?? "#3366dd" };
    resolved.set(item.id, result);
    return result;
  };
  return items.map(item => ({ ...item, color: resolve(item).color }));
}

export function draftAutomaticColor(items: Schedule[], parentId: string | null, colors: readonly string[]): string {
  const byId = new Map(items.map(item => [item.id, item]));
  let depth = 0;
  let parent = parentId ? byId.get(parentId) : undefined;
  while (parent) { depth++; parent = parent.parentId ? byId.get(parent.parentId) : undefined; }
  const displayedParent = parentId ? resolveScheduleColors(items, colors).find(item => item.id === parentId) : undefined;
  return colorAtDepth(depth, colors, displayedParent?.color);
}
