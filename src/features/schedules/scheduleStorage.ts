import type { Schedule } from "./types";

const KEY = "workplan-calendar-events-v2";
const LEGACY_KEY = "workplan-calendar-events-v1";
const COLLAPSED_KEY = "workplan-calendar-collapsed-v1";

export function readSchedules(): { items: Schedule[]; error: string } {
  try {
    const saved = localStorage.getItem(KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (saved === null) return { items: [], error: "" };
    const parsed: unknown = JSON.parse(saved);
    if (!Array.isArray(parsed)) throw new Error("Invalid schedule list");
    const ids = new Set<string>();
    const items: Schedule[] = parsed.map((item, index) => {
      if (!item || typeof item.id !== "string" || !item.id || ids.has(item.id) || typeof item.title !== "string"
        || typeof item.start !== "string" || typeof item.end !== "string"
        || !Number.isFinite(Date.parse(item.start)) || !Number.isFinite(Date.parse(item.end)) || Date.parse(item.end) <= Date.parse(item.start)) throw new Error("Invalid schedule");
      ids.add(item.id);
      return { ...item, parentId: typeof item.parentId === "string" ? item.parentId : null,
        order: Number.isInteger(item.order) && item.order >= 0 ? item.order : index };
    });
    const byId = new Map(items.map(item => [item.id, item]));
    for (const item of items) {
      const seen = new Set([item.id]);
      let parent = item.parentId;
      while (parent) {
        if (seen.has(parent) || !byId.has(parent)) throw new Error("Invalid tree");
        seen.add(parent); parent = byId.get(parent)!.parentId;
      }
    }
    return { items, error: "" };
  } catch {
    return { items: [], error: "저장된 일정을 불러올 수 없습니다. 원본 보존을 위해 저장을 중단했습니다. 브라우저 저장소를 확인해 주세요." };
  }
}
export function writeSchedules(items: Schedule[]): void { localStorage.setItem(KEY, JSON.stringify(items)); }
export function readCollapsed(): Set<string> {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(COLLAPSED_KEY) ?? "[]");
    return new Set(Array.isArray(value) ? value.filter((id): id is string => typeof id === "string") : []);
  } catch { return new Set(); }
}
export function writeCollapsed(ids: Set<string>): void { localStorage.setItem(COLLAPSED_KEY, JSON.stringify([...ids])); }
